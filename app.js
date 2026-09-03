/**
 * TEA TOP 第一味 - TOP 10 人氣飲品排行榜
 * Android 機上盒 / 數位電子看板核心控制腳本
 */

const DRINKS_DATA = [
  {
    rank: '01',
    name: '招牌高山青',
    engName: 'Signature Alpine Green Tea',
    price: 40,
    size: 'L',
    theme: 'orange',
    heroImg: 'assets/images/drinks/drink_1_hero.png',
    badges: ['assets/images/badges/badge_hot.png']
  },
  {
    rank: '02',
    name: '108茶王',
    engName: '108 King Oolong Tea',
    price: 49,
    size: 'L',
    theme: 'orange',
    heroImg: 'assets/images/drinks/drink_2_hero.png',
    badges: ['assets/images/badges/badge_hot.png']
  },
  {
    rank: '03',
    name: '青茶3Q',
    engName: 'Alpine Green Tea w/ Coconut jelly & Tea jelly & Pearl',
    price: 50,
    size: 'L',
    theme: 'orange',
    heroImg: 'assets/images/drinks/drink_3_hero.png',
    badges: ['assets/images/badges/badge_hot.png']
  },
  {
    rank: '04',
    name: '黑糖珍珠鮮奶',
    engName: 'Brown Sugar Fresh Milk w/ Pearls',
    price: 80,
    size: 'L',
    theme: 'orange',
    heroImg: 'assets/images/drinks/drink_4_hero.png',
    badges: ['assets/images/badges/badge_no_caffeine_hot_fixed.png']
  },
  {
    rank: '05',
    name: '當代雙Q',
    engName: 'Pearl Milk Tea w/ Taro Balls',
    price: 65,
    size: 'L',
    theme: 'orange',
    heroImg: 'assets/images/drinks/drink_5_hero.png',
    badges: ['assets/images/badges/badge_hot.png']
  },
  {
    rank: '06',
    name: '桂花凍108',
    engName: '108 King Oolong Tea w/ Osmanthus Jelly',
    price: 70,
    size: 'L',
    theme: 'navy',
    heroImg: 'assets/images/drinks/drink_2_hero.png',
    badges: ['assets/images/badges/badge_fixed_sugar.png']
  },
  {
    rank: '07',
    name: '奶蓋日月紅',
    engName: 'Milk Foam Sun Moon Lake Black Tea',
    price: 60,
    size: 'L',
    theme: 'navy',
    heroImg: 'assets/images/drinks/drink_5_hero.png',
    badges: ['assets/images/badges/badge_hot_navy.png']
  },
  {
    rank: '08',
    name: '轟蜜茶108',
    engName: 'Honey 108 King Oolong Tea w/ Tea Jelly',
    price: 70,
    size: 'L',
    theme: 'navy',
    heroImg: 'assets/images/drinks/drink_1_hero.png',
    badges: []
  },
  {
    rank: '09',
    name: '紅豆粉粿鮮奶',
    engName: 'Brown Sugar Fresh Milk w/ Red Bean & Jelly',
    price: 95,
    size: 'L',
    theme: 'navy',
    heroImg: 'assets/images/drinks/drink_4_hero.png',
    badges: ['assets/images/badges/badge_no_caffeine_hot_fixed.png']
  },
  {
    rank: '10',
    name: '百香QQ',
    engName: 'Passion Fruit Green Tea Medley',
    price: 75,
    size: 'L',
    theme: 'navy',
    heroImg: 'assets/images/drinks/drink_3_hero.png',
    badges: ['assets/images/badges/badge_hot_navy.png']
  }
];

class MenuBoardApp {
  constructor() {
    this.currentIndex = 0;
    this.autoPlayInterval = 5000; // 5 秒輪播
    this.isPlaying = true;
    this.progress = 0;
    this.lastTimestamp = null;
    this.animFrameId = null;
    this.unsubscribeLive = null;

    // 解析 URL 中的分區參數（預設為 north）
    const urlParams = new URLSearchParams(window.location.search);
    this.regionId = urlParams.get('region') || 'north';

    // 優先讀取本地預設資料，確保機上盒秒開零延遲、斷網保證不白屏
    const defaultData = (window.DEFAULT_MENUS_BY_REGION && window.DEFAULT_MENUS_BY_REGION[this.regionId])
      || (window.DEFAULT_MENUS_BY_REGION && window.DEFAULT_MENUS_BY_REGION.north)
      || { drinks: DRINKS_DATA, regionName: '北區門市' };

    this.regionName = defaultData.regionName || '北區門市';
    this.drinksData = defaultData.drinks || DRINKS_DATA;

    // DOM 元素
    this.scaler = document.getElementById('screen-scaler');
    this.menuList = document.getElementById('menu-list');
    this.heroImg = document.getElementById('hero-drink-img');
    this.heroRankTag = document.getElementById('hero-rank-tag');
    this.heroTitle = document.getElementById('hero-title');
    this.heroEngTitle = document.getElementById('hero-eng-title');
    this.heroPrice = document.getElementById('hero-price');
    this.heroBadges = document.getElementById('hero-badges');
    this.progressBar = document.getElementById('progress-bar-fill');
    this.playStatus = document.getElementById('play-status');

    this.init();
  }

  async init() {
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());

    this.renderMenuList();
    this.selectDrink(0, false);
    this.startCarousel();
    this.bindEvents();

    // 啟動 Firebase 雲端資料同步與即時監聽
    this.setupCloudSync();
  }

  // 雲端即時同步與斷網保護
  async setupCloudSync() {
    if (!window.teatopFirebase) return;

    try {
      const cloudData = await window.teatopFirebase.getRegionMenu(this.regionId);
      if (cloudData && Array.isArray(cloudData.drinks) && cloudData.drinks.length > 0) {
        console.log(`[看板] 成功載入雲端 [${this.regionId}] 菜單`);
        this.applyUpdatedMenu(cloudData);
      }
    } catch (err) {
      console.warn('[看板] 離線保護生效，持續使用本地菜單:', err);
    }

    // 啟動即時推送監聽 (當管理後台儲存發布時，本看板秒級自動更新)
    this.unsubscribeLive = window.teatopFirebase.listenRegionMenu(this.regionId, (newMenu) => {
      if (newMenu && Array.isArray(newMenu.drinks) && newMenu.drinks.length > 0) {
        console.log(`[看板 Live] 收到雲端即時更新 [${this.regionId}]`);
        this.applyUpdatedMenu(newMenu);
      }
    });
  }

  applyUpdatedMenu(menuData) {
    if (menuData.regionName) {
      this.regionName = menuData.regionName;
    }
    this.drinksData = menuData.drinks;
    this.renderMenuList();
    const safeIndex = Math.min(this.currentIndex, this.drinksData.length - 1);
    this.selectDrink(safeIndex, false);
  }

  // 1920x1080 自適應等比縮放
  handleResize() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const scale = Math.min(windowWidth / 1920, windowHeight / 1080);
    this.scaler.style.transform = `scale(${scale})`;
  }

  // 渲染右側 10 筆清單
  renderMenuList() {
    this.menuList.innerHTML = '';
    this.drinksData.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = `menu-row ${item.theme}-theme`;
      row.dataset.index = index;

      const badgesHtml = item.badges.map(b => `<img src="${b}" alt="標籤">`).join('');

      row.innerHTML = `
        <div class="row-rank-group">
          <span class="row-rank">${item.rank}</span>
          <span class="row-slash">/</span>
        </div>
        <div class="row-name-group">
          <div class="row-title-container">
            <span class="row-title">${item.name}</span>
            <div class="row-badges">${badgesHtml}</div>
          </div>
          <div class="row-eng-title">${item.engName}</div>
        </div>
        <div class="row-price-group">
          <div class="row-meta-col">
            <span class="row-currency">$</span>
            <span class="row-size">${item.size}</span>
          </div>
          <span class="row-price">${item.price}</span>
        </div>
      `;

      row.addEventListener('click', () => {
        this.selectDrink(index);
        this.resetProgress();
      });

      this.menuList.appendChild(row);
    });
  }

  // 切換選中飲品
  selectDrink(index, animate = true) {
    if (!this.drinksData || this.drinksData.length === 0) return;
    this.currentIndex = (index + this.drinksData.length) % this.drinksData.length;
    const item = this.drinksData[this.currentIndex];

    // 更新右側選中狀態
    const rows = this.menuList.querySelectorAll('.menu-row');
    rows.forEach((r, idx) => {
      if (idx === this.currentIndex) {
        r.classList.add('active');
      } else {
        r.classList.remove('active');
      }
    });

    // 動畫切換左側內容
    if (animate) {
      this.heroImg.style.opacity = '0';
      this.heroImg.style.transform = 'scale(0.85) translateY(20px)';

      setTimeout(() => {
        this.updateHeroContent(item);
        this.heroImg.style.opacity = '1';
        this.heroImg.style.transform = 'scale(1) translateY(0)';
      }, 200);
    } else {
      this.updateHeroContent(item);
    }
  }

  updateHeroContent(item) {
    this.heroImg.src = item.heroImg;
    this.heroRankTag.textContent = `TOP ${item.rank}`;
    this.heroTitle.textContent = item.name;
    this.heroEngTitle.textContent = item.engName;
    this.heroPrice.textContent = item.price;
    this.heroBadges.innerHTML = item.badges.map(b => `<img src="${b}" alt="標籤">`).join('');
  }

  // 自動輪播循環 (60 FPS Progress Animation)
  startCarousel() {
    this.lastTimestamp = performance.now();
    const loop = (currentTimestamp) => {
      const delta = currentTimestamp - this.lastTimestamp;
      this.lastTimestamp = currentTimestamp;

      if (this.isPlaying) {
        this.progress += delta;
        const percent = Math.min((this.progress / this.autoPlayInterval) * 100, 100);
        this.progressBar.style.width = `${percent}%`;

        if (this.progress >= this.autoPlayInterval) {
          this.progress = 0;
          this.selectDrink(this.currentIndex + 1);
        }
      }

      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  resetProgress() {
    this.progress = 0;
    this.progressBar.style.width = '0%';
    this.lastTimestamp = performance.now();
  }

  togglePlay() {
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      this.playStatus.innerHTML = '<span class="pulse-dot"></span> 自動輪播中 (5s)';
      this.lastTimestamp = performance.now();
    } else {
      this.playStatus.innerHTML = '<span style="color: #FFCC00;">❚❚ 已暫停輪播</span>';
    }
  }

  // 遙控器與鍵盤按鍵監聽
  bindEvents() {
    window.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'Up':
        case 'w':
        case 'W':
          e.preventDefault();
          this.selectDrink(this.currentIndex - 1);
          this.resetProgress();
          break;
        case 'ArrowDown':
        case 'Down':
        case 's':
        case 'S':
          e.preventDefault();
          this.selectDrink(this.currentIndex + 1);
          this.resetProgress();
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          this.togglePlay();
          break;
        case 'f':
        case 'F':
          this.toggleFullScreen();
          break;
        default:
          // 支援數字鍵 1~9, 0 跳轉
          if (e.key >= '1' && e.key <= '9') {
            this.selectDrink(parseInt(e.key) - 1);
            this.resetProgress();
          } else if (e.key === '0') {
            this.selectDrink(9);
            this.resetProgress();
          }
          break;
      }
    });

    // 雙擊切換全螢幕
    window.addEventListener('dblclick', () => {
      this.toggleFullScreen();
    });
  }

  toggleFullScreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }
}

// 頁面載入完成後啟動應用
document.addEventListener('DOMContentLoaded', () => {
  window.app = new MenuBoardApp();
});
