/**
 * TEA TOP 第一味 - Firebase Firestore 連線與即時資料層
 * 支援全台門市看板即時同步 (Realtime Sync) 與離線保險 (Offline Fallback)
 */

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDxHY7clYs6zeC5sAJnXwg5O52xmWjUSWY",
  authDomain: "teatop-top10.firebaseapp.com",
  projectId: "teatop-top10",
  storageBucket: "teatop-top10.firebasestorage.app",
  messagingSenderId: "372146960410",
  appId: "1:372146960410:web:6ba6de6d3a1232b8e379a3"
};

class TeatopFirebaseManager {
  constructor() {
    this.db = null;
    this.isInitialized = false;
    this.init();
  }

  init() {
    try {
      if (typeof firebase !== 'undefined') {
        if (!firebase.apps.length) {
          firebase.initializeApp(FIREBASE_CONFIG);
        }
        this.db = firebase.firestore();
        this.isInitialized = true;
        console.log('[Firebase] 初始化成功，已連線至 teatop-top10');
      } else {
        console.warn('[Firebase] 未偵測到 Firebase SDK，啟用純離線模式');
      }
    } catch (err) {
      console.error('[Firebase] 初始化異常，切換至離線保護模式:', err);
    }
  }

  /**
   * 取得指定區域的菜單 (優先從 Firestore 讀取，失敗則無縫 fallback 至本地預設)
   */
  async getRegionMenu(regionId = 'north') {
    const fallback = (window.DEFAULT_MENUS_BY_REGION && window.DEFAULT_MENUS_BY_REGION[regionId]) 
      || (window.DEFAULT_MENUS_BY_REGION && window.DEFAULT_MENUS_BY_REGION.north)
      || null;

    if (!this.isInitialized || !this.db) {
      console.log(`[Firebase] 處於離線狀態，載入本地預設 [${regionId}] 資料`);
      return fallback;
    }

    try {
      const docRef = this.db.collection('regions').doc(regionId);
      const docSnap = await docRef.get();

      if (docSnap.exists) {
        console.log(`[Firebase] 成功從雲端取得 [${regionId}] 資料`);
        return docSnap.data();
      } else {
        console.log(`[Firebase] 雲端尚無 [${regionId}] 文件，自動寫入預設值並返回`);
        if (fallback) {
          await docRef.set(fallback);
        }
        return fallback;
      }
    } catch (err) {
      console.warn(`[Firebase] 讀取雲端資料失敗，啟動離線保護 [${regionId}]:`, err);
      return fallback;
    }
  }

  /**
   * 即時監聽指定區域的菜單變動 (當後台點擊發布時，看板端秒級自動更新，不需重整頁面)
   */
  listenRegionMenu(regionId = 'north', onUpdate, onError) {
    if (!this.isInitialized || !this.db) {
      console.warn('[Firebase] 無法建立實時監聽：尚未連線至 Firebase');
      return () => {};
    }

    try {
      const docRef = this.db.collection('regions').doc(regionId);
      const unsubscribe = docRef.onSnapshot(
        (docSnap) => {
          if (docSnap.exists) {
            const data = docSnap.data();
            console.log(`[Firebase Live] 收到雲端即時推播 [${regionId}]:`, data.updatedAt);
            if (typeof onUpdate === 'function') {
              onUpdate(data);
            }
          } else {
            console.log(`[Firebase Live] 雲端查無此文件 [${regionId}]`);
          }
        },
        (error) => {
          console.error(`[Firebase Live] 實時監聽中斷 [${regionId}]:`, error);
          if (typeof onError === 'function') {
            onError(error);
          }
        }
      );

      return unsubscribe;
    } catch (err) {
      console.error('[Firebase Live] 啟動監聽失敗:', err);
      return () => {};
    }
  }

  /**
   * 儲存並即時發布區域菜單 (管理後台專用)
   */
  async saveRegionMenu(regionId, menuData) {
    if (!this.isInitialized || !this.db) {
      throw new Error('Firebase 尚未就緒，請檢查網路連線');
    }

    const payload = {
      ...menuData,
      regionId,
      updatedAt: new Date().toISOString()
    };

    const docRef = this.db.collection('regions').doc(regionId);
    await docRef.set(payload, { merge: true });
    console.log(`[Firebase] 區域 [${regionId}] 已成功發布至雲端！時間戳:`, payload.updatedAt);
    return payload;
  }

  /**
   * 取得商品總庫清單
   */
  async getProducts() {
    const fallback = window.DEFAULT_PRODUCTS || [];

    if (!this.isInitialized || !this.db) {
      console.log(`[Firebase] 處於離線狀態，載入本地預設商品庫`);
      return fallback;
    }

    try {
      const snapshot = await this.db.collection('products').get();
      if (!snapshot.empty) {
        console.log(`[Firebase] 成功從雲端取得商品庫資料`);
        let products = [];
        snapshot.forEach(doc => {
          products.push({ _docId: doc.id, ...doc.data() });
        });
        // 依照 id 排序，確保順序固定
        return products.sort((a, b) => a.id.localeCompare(b.id));
      } else {
        console.log(`[Firebase] 雲端尚無商品庫，自動寫入預設值並返回`);
        if (fallback.length > 0) {
          for (const prod of fallback) {
            await this.db.collection('products').doc(prod.id).set(prod);
          }
        }
        return fallback;
      }
    } catch (err) {
      console.warn(`[Firebase] 讀取商品庫失敗，啟動離線保護:`, err);
      return fallback;
    }
  }

  /**
   * 儲存商品至商品庫
   */
  async saveProduct(productData) {
    if (!this.isInitialized || !this.db) {
      throw new Error('Firebase 尚未就緒，請檢查網路連線');
    }
    const docId = productData.id || `prod_${Date.now()}`;
    const payload = {
      ...productData,
      id: docId,
      updatedAt: new Date().toISOString()
    };
    
    // 移除前端內部用的 _docId 避免存回資料庫
    if (payload._docId) delete payload._docId;

    await this.db.collection('products').doc(docId).set(payload, { merge: true });
    console.log(`[Firebase] 商品 [${docId}] 已成功儲存至雲端！`);
    return payload;
  }

  /**
   * 刪除商品庫商品
   */
  async deleteProduct(productId) {
    if (!this.isInitialized || !this.db) {
      throw new Error('Firebase 尚未就緒，請檢查網路連線');
    }
    await this.db.collection('products').doc(productId).delete();
    console.log(`[Firebase] 商品 [${productId}] 已從雲端刪除！`);
  }

  /**
   * 批次儲存商品總庫
   */
  async saveProducts(products) {
    if (!this.isInitialized || !this.db) {
      throw new Error('Firebase 尚未就緒，請檢查網路連線');
    }
    // Using a batch or just loops
    const batch = this.db.batch();
    for (const prod of products) {
      const docId = prod.id || `prod_${Date.now()}_${Math.floor(Math.random()*1000)}`;
      const docRef = this.db.collection('products').doc(docId);
      const payload = {
        ...prod,
        id: docId,
        updatedAt: new Date().toISOString()
      };
      if (payload._docId) delete payload._docId;
      batch.set(docRef, payload, { merge: true });
    }
    await batch.commit();
    console.log(`[Firebase] ${products.length} 筆商品已批次儲存至雲端！`);
  }

  /**
   * 取得所有區域設定
   */
  async getRegions() {
    const fallback = window.DEFAULT_REGIONS || [];
    if (!this.isInitialized || !this.db) return fallback;
    try {
      const docSnap = await this.db.collection('settings').doc('regions').get();
      if (docSnap.exists) {
        return docSnap.data().list || fallback;
      } else {
        await this.db.collection('settings').doc('regions').set({ list: fallback });
        return fallback;
      }
    } catch (err) {
      return fallback;
    }
  }

  /**
   * 儲存所有區域設定
   */
  async saveRegions(regionsList) {
    if (!this.isInitialized || !this.db) {
      throw new Error('Firebase 尚未就緒，請檢查網路連線');
    }
    await this.db.collection('settings').doc('regions').set({ list: regionsList, updatedAt: new Date().toISOString() });
    console.log(`[Firebase] 區域設定已更新！`);
  }

  /**
   * 刪除區域設定並清理該區域看板文檔 (防止孤立資料)
   */
  async deleteRegion(regionId, updatedRegionsList) {
    if (!this.isInitialized || !this.db) {
      throw new Error('Firebase 尚未就緒，請檢查網路連線');
    }
    const batch = this.db.batch();
    // 1. 刪除該分區的看板菜單資料庫文檔 (避免孤立資料)
    const regionDocRef = this.db.collection('regions').doc(regionId);
    batch.delete(regionDocRef);
    // 2. 更新分區清單設定
    const settingsDocRef = this.db.collection('settings').doc('regions');
    batch.set(settingsDocRef, { list: updatedRegionsList, updatedAt: new Date().toISOString() });

    await batch.commit();
    console.log(`[Firebase] 分區 [${regionId}] 及其看板配置已成功刪除！`);
  }
}

// 建立全域單例
window.teatopFirebase = new TeatopFirebaseManager();

