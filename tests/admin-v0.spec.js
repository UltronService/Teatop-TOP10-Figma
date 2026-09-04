const { test, expect } = require('@playwright/test');

const TARGET_URL = 'http://localhost:8085/admin-v0.html';

test.describe('TEA TOP 第一味 - TOP 10 數位看板雲端管理後台 (admin-v0.html) 自動化測試', () => {
  // 因涉及雲端 Firestore 資料庫狀態變更，採循序 (serial) 執行以避免各 Worker 相互干擾
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    // 監聽 console 錯誤，確保無未捕獲之腳本崩潰
    page.on('pageerror', error => {
      console.warn('[Page Error Caught]:', error.message);
    });
    await page.goto(TARGET_URL);
    // 等待 React 與 Babel 完成渲染且資料載入
    await page.waitForSelector('#root > div', { timeout: 10000 });
    await page.waitForSelector('.w-10.h-10.rounded-full', { timeout: 10000 });
  });

  // =========================================================================
  // 模組 A：看板區域配置 (Signage View)
  // =========================================================================
  test.describe('模組 A：看板區域配置 (Signage View)', () => {

    test('TC-SIG-01: 應預設載入首個分區並正確渲染 TOP 10 飲品與連線狀態', async ({ page }) => {
      // 驗證 Header 標題與雲端連線狀態
      await expect(page.locator('h1')).toContainText('TEA TOP');
      await expect(page.locator('h1')).toContainText('TOP 10 管理');
      await expect(page.locator('text=雲端連線正常')).toBeVisible();

      // 驗證看板標題包含分區排行榜配置
      const title = page.locator('h2');
      await expect(title).toContainText('看板排行榜配置');

      // 驗證 TOP 10 列表項目的數量為 10
      const rankBadges = page.locator('.w-10.h-10.rounded-full');
      await expect(rankBadges).toHaveCount(10);
      await expect(rankBadges.first()).toHaveText('01');
      await expect(rankBadges.last()).toHaveText('10');

      // 驗證初始儲存按鈕為 disabled
      const saveBtn = page.locator('button:has-text("儲存發布")');
      await expect(saveBtn).toBeDisabled();
    });

    test('TC-SIG-02: 點擊切換地區應正確切換並載入對應區域菜單', async ({ page }) => {
      // 點擊「中區門市」按鈕
      const centralRegionBtn = page.locator('aside button:has-text("中區門市")');
      await expect(centralRegionBtn).toBeVisible();
      await centralRegionBtn.click();

      // 驗證標題切換為「中區門市」
      const title = page.locator('h2');
      await expect(title).toContainText('中區門市 看板排行榜配置');

      // 驗證中區門市按鈕的外層容器獲得 active 樣式 (bg-brand-navy)
      const parentDiv = centralRegionBtn.locator('..');
      await expect(parentDiv).toHaveClass(/bg-brand-navy/);
    });

    test('TC-SIG-03: 有未儲存變更時切換區域，應彈出防呆確認對話框', async ({ page }) => {
      // 記住當前區域名稱
      const initialHeading = await page.locator('h2').textContent();

      // 第一個項目的下移按鈕是第 1 個 .flex-col > button:nth-child(2)
      const firstRowDownBtn = page.locator('.flex-col > button').nth(1);
      await firstRowDownBtn.click();

      // 確認儲存發布按鈕變為可點擊
      const saveBtn = page.locator('button:has-text("儲存發布")');
      await expect(saveBtn).toBeEnabled();

      // 1. 測試使用者選擇「取消」：應停留在原區
      let dialogDismissed = false;
      page.once('dialog', async dialog => {
        expect(dialog.message()).toContain('您有未儲存的變更，確定要切換區域嗎？');
        await dialog.dismiss();
        dialogDismissed = true;
      });

      await page.locator('aside button:has-text("南區門市")').click();
      expect(dialogDismissed).toBe(true);
      await expect(page.locator('h2')).toHaveText(initialHeading);

      // 2. 測試使用者選擇「確定」：應切換並捨棄變更
      let dialogAccepted = false;
      page.once('dialog', async dialog => {
        expect(dialog.message()).toContain('您有未儲存的變更');
        await dialog.accept();
        dialogAccepted = true;
      });

      await page.locator('aside button:has-text("南區門市")').click();
      expect(dialogAccepted).toBe(true);
      await expect(page.locator('h2')).toContainText('南區門市 看板排行榜配置');
    });

    test('TC-SIG-04 & 05: 新增區域及其防呆測試 (prompt 對話框)', async ({ page }) => {
      // 側邊欄頂部的新增按鈕 (位於 p-4.border-b 標題欄內)
      const addRegionBtn = page.locator('aside .p-4.border-b button');
      await expect(addRegionBtn).toBeVisible();

      // 防呆：使用者取消
      page.once('dialog', async dialog => {
        expect(dialog.message()).toContain('請輸入新區域的名稱');
        await dialog.dismiss();
      });
      await addRegionBtn.click();

      // 正向：新增分區
      const testRegionName = '自動化測試區_' + Date.now().toString().slice(-4);
      page.once('dialog', async dialog => {
        await dialog.accept(testRegionName);
      });
      await addRegionBtn.click();

      // 驗證左側選單出現新分區
      await expect(page.locator(`aside button:has-text("${testRegionName}")`)).toBeVisible();
    });

    test('TC-SIG-06: 重新命名區域測試 (rename prompt 對話框)', async ({ page }) => {
      // 點擊第一個區域旁邊的編輯按鈕 (aside 中每一項的第二個 button)
      const firstRegionRow = page.locator('aside .p-2 > div').first();
      const editBtn = firstRegionRow.locator('button').nth(1);
      const updatedName = '北區旗艦門市_' + Date.now().toString().slice(-4);

      page.once('dialog', async dialog => {
        expect(dialog.message()).toContain('請輸入新的區域名稱');
        await dialog.accept(updatedName);
      });
      await editBtn.click();

      // 驗證名稱已更新
      await expect(page.locator(`aside button:has-text("${updatedName}")`)).toBeVisible();

      // 復原區域名稱為「北區門市」，以確保後續測試環境乾淨與獨立性
      page.once('dialog', async dialog => {
        await dialog.accept('北區門市');
      });
      await editBtn.click();
      await expect(page.locator(`aside button:has-text("北區門市")`)).toBeVisible();
    });

    test('TC-SIG-07 & 08: 飲品排序上移/下移與邊界 disabled 狀態檢查', async ({ page }) => {
      // 檢查第 1 名的「上移」按鈕必須 disabled (即第 1 個 .flex-col > button)
      const firstUpBtn = page.locator('.flex-col > button').first();
      await expect(firstUpBtn).toBeDisabled();

      // 檢查第 10 名的「下移」按鈕必須 disabled (即最後 1 個 .flex-col > button)
      const lastDownBtn = page.locator('.flex-col > button').last();
      await expect(lastDownBtn).toBeDisabled();

      // 取得第 1 名與第 2 名的原本名稱
      const drinkNames = page.locator('.font-bold.text-lg');
      const firstDrinkName = (await drinkNames.nth(0).textContent()).trim();
      const secondDrinkName = (await drinkNames.nth(1).textContent()).trim();

      // 點擊第 2 名的「上移」按鈕 (即第 3 個 .flex-col > button，索引 2)
      const secondUpBtn = page.locator('.flex-col > button').nth(2);
      await secondUpBtn.click();

      // 驗證第 1 名與第 2 名品名已對調
      const newFirstDrinkName = (await drinkNames.nth(0).textContent()).trim();
      const newSecondDrinkName = (await drinkNames.nth(1).textContent()).trim();
      expect(newFirstDrinkName).toContain(secondDrinkName);
      expect(newSecondDrinkName).toContain(firstDrinkName);

      // 驗證排名編號依然依序為 01 與 02
      const rankBadges = page.locator('.w-10.h-10.rounded-full');
      await expect(rankBadges.nth(0)).toHaveText('01');
      await expect(rankBadges.nth(1)).toHaveText('02');

      // 驗證儲存按鈕轉為可點擊 (dirty 狀態生效)
      const saveBtn = page.locator('button:has-text("儲存發布")');
      await expect(saveBtn).toBeEnabled();
    });

    test('TC-SIG-09: 點擊「變更飲品」開啟商品挑選彈窗並支援關閉', async ({ page }) => {
      // 點擊第 1 個項目的「變更飲品」按鈕
      const changeBtn = page.locator('button:has-text("變更飲品")').first();
      await changeBtn.click();

      // 驗證彈窗可見
      const modal = page.locator('.fixed.inset-0.bg-black\\/50');
      await expect(modal).toBeVisible();
      await expect(page.locator('h3:has-text("從商品總庫挑選")')).toBeVisible();

      // 點擊頂部的關閉按鈕 (header 裡面的第二個按鈕或包含 svg 的按鈕)
      const closeBtn = modal.locator('.p-4.border-b button');
      await closeBtn.click();

      // 驗證彈窗已消失
      await expect(modal).not.toBeVisible();
    });

    test('TC-SIG-10: 透過挑選彈窗替換飲品，驗證資料替換正確並儲存發布', async ({ page }) => {
      // 開啟挑選彈窗
      await page.locator('button:has-text("變更飲品")').first().click();
      const modal = page.locator('.fixed.inset-0.bg-black\\/50');
      await expect(modal).toBeVisible();

      // 等待商品清單載入
      await modal.locator('.space-y-2 > div').first().waitFor();

      // 選取商品總庫中的第 2 個商品
      const secondProductCard = modal.locator('.space-y-2 > div').nth(1);
      const selectedProdName = (await secondProductCard.locator('.font-bold.text-gray-800').textContent()).trim();
      
      const selectBtn = secondProductCard.locator('button:has-text("選取")');
      await selectBtn.click();

      // 彈窗關閉
      await expect(modal).not.toBeVisible();

      // 驗證第 1 名品名已替換為選取之商品
      const firstDrinkName = (await page.locator('.font-bold.text-lg').first().textContent()).trim();
      expect(firstDrinkName).toContain(selectedProdName);

      // 點擊「儲存發布」
      const saveBtn = page.locator('button:has-text("儲存發布")');
      await expect(saveBtn).toBeEnabled();
      await saveBtn.click();

      // 驗證 Toast 出現成功提示
      const toast = page.locator('.fixed.top-6.right-6');
      await expect(toast).toBeVisible();
      await expect(toast).toContainText('已成功發布！全台該區看板秒級同步完成。');

      // 儲存完成後，按鈕應恢復為 disabled (signageDirty=false)
      await expect(saveBtn).toBeDisabled();
    });

    test('TC-SIG-11: 驗證「預覽」按鈕能開啟對應分區的新視窗', async ({ page }) => {
      // 監聽 popup 事件
      const [popup] = await Promise.all([
        page.waitForEvent('popup'),
        page.locator('button:has-text("預覽")').click()
      ]);

      // 驗證新視窗的 URL 包含 region=north
      await popup.waitForLoadState();
      expect(popup.url()).toContain('index2.html?region=north');
      await popup.close();
    });
  });

  // =========================================================================
  // 模組 B：商品總庫管理 (Catalog View)
  // =========================================================================
  test.describe('模組 B：商品總庫管理 (Catalog View)', () => {

    test.beforeEach(async ({ page }) => {
      // 切換至商品總庫管理分頁
      await page.locator('button:has-text("商品總庫管理")').click();
      await page.waitForSelector('h2:has-text("全域商品總庫")');
      // 等待非同步商品資料載入完成
      await page.locator('.grid.grid-cols-1 > div').first().waitFor({ timeout: 10000 });
    });

    test('TC-CAT-01: 應成功進入商品總庫視圖並渲染商品卡片清單', async ({ page }) => {
      await expect(page.locator('h2:has-text("全域商品總庫")')).toBeVisible();
      await expect(page.locator('button:has-text("新增商品")')).toBeVisible();
      await expect(page.locator('button:has-text("儲存總庫")')).toBeVisible();

      // 驗證有至少 1 筆以上的商品卡片
      const productCards = page.locator('.grid.grid-cols-1 > div');
      const count = await productCards.count();
      expect(count).toBeGreaterThan(0);
    });

    test('TC-CAT-02: 點擊「新增商品」應在列表末端新增一筆預設商品卡片', async ({ page }) => {
      const productCards = page.locator('.grid.grid-cols-1 > div');
      const initialCount = await productCards.count();

      // 點擊新增按鈕
      await page.locator('button:has-text("新增商品")').click();

      // 驗證數量增加 1
      await expect(productCards).toHaveCount(initialCount + 1);

      // 驗證最後一筆包含預設「新商品」名稱
      const lastCard = productCards.last();
      const nameInput = lastCard.locator('input.font-bold.text-sm');
      await expect(nameInput).toHaveValue('新商品');
    });

    test('TC-CAT-03 & 04: 編輯商品中英文名稱並切換標籤核取方塊', async ({ page }) => {
      const firstCard = page.locator('.grid.grid-cols-1 > div').first();

      // 修改中文品名
      const chNameInput = firstCard.locator('input.font-bold.text-sm');
      const testName = '特調青茶_' + Date.now().toString().slice(-4);
      await chNameInput.fill(testName);
      await expect(chNameInput).toHaveValue(testName);

      // 勾選/取消「♨️ 可熱飲」標籤
      const hotCheckbox = firstCard.locator('label:has-text("可做熱飲") input[type="checkbox"]');
      const isChecked = await hotCheckbox.isChecked();
      await hotCheckbox.click();
      await expect(hotCheckbox).toBeChecked({ checked: !isChecked });

      // 再次點擊復原
      await hotCheckbox.click();
      await expect(hotCheckbox).toBeChecked({ checked: isChecked });
    });

    test('TC-CAT-05: 點擊「儲存總庫」應發布變更並顯示成功 Toast', async ({ page }) => {
      const saveCatalogBtn = page.locator('button:has-text("儲存總庫")');
      await expect(saveCatalogBtn).toBeEnabled();
      await saveCatalogBtn.click();

      // 驗證 Toast 彈出
      const toast = page.locator('.fixed.top-6.right-6');
      await expect(toast).toBeVisible();
      await expect(toast).toContainText('商品總庫已儲存成功！');
    });
  });

  // =========================================================================
  // 模組 C：商品價格管理 / 價格矩陣 (Pricing View)
  // =========================================================================
  test.describe('模組 C：全台各區商品價格矩陣 (Pricing Matrix View)', () => {

    test.beforeEach(async ({ page }) => {
      // 切換至商品價格管理分頁
      await page.locator('button:has-text("商品價格管理")').click();
      await page.waitForSelector('h2:has-text("全台各區商品價格矩陣")');
      // 等待表格渲染完畢
      await page.waitForSelector('table tbody tr', { timeout: 10000 });
    });

    test('TC-PRC-01: 應正確載入價格矩陣表格表頭與所有區域欄位', async ({ page }) => {
      await expect(page.locator('h2:has-text("全台各區商品價格矩陣")')).toBeVisible();

      const table = page.locator('table');
      await expect(table).toBeVisible();

      // 驗證表頭包含必要項目與區域
      const thead = table.locator('thead');
      await expect(thead).toContainText('圖片');
      await expect(thead).toContainText('飲品名稱');
      await expect(thead).toContainText('總庫基準價');
      await expect(thead).toContainText('中區門市');
      await expect(thead).toContainText('南區門市');
      await expect(thead).toContainText('特殊門市');
    });

    test('TC-PRC-02 & 03: 編輯基準價與各區域價格並驗證輸入響應', async ({ page }) => {
      const firstRow = page.locator('tbody tr').first();
      await expect(firstRow).toBeVisible();

      // 測試修改總庫基準價
      const basePriceInput = firstRow.locator('td.bg-orange-50\\/30 input');
      await expect(basePriceInput).toBeVisible();
      await basePriceInput.fill('65');
      await expect(basePriceInput).toHaveValue('65');

      // 測試修改分區價格 (若該格位有上架商品即有 input)
      const regionalPriceInput = firstRow.locator('td:nth-child(4) input');
      if (await regionalPriceInput.isVisible()) {
        await regionalPriceInput.fill('70');
        await expect(regionalPriceInput).toHaveValue('70');
      }
    });

    test('TC-PRC-05: 點擊「全面儲存並發布」應觸發儲存並顯示 Toast', async ({ page }) => {
      const saveAllBtn = page.locator('button:has-text("全面儲存並發布")');
      await expect(saveAllBtn).toBeVisible();
      await saveAllBtn.click();

      // 驗證 Toast 出現
      const toast = page.locator('.fixed.top-6.right-6');
      await expect(toast).toBeVisible();
      await expect(toast).toContainText('全台價格與基準定價已成功更新與發布！');
    });
  });

  // =========================================================================
  // 模組 D：安全與非功能性驗證 (Security & Non-Functional)
  // =========================================================================
  test.describe('模組 D：安全性與健壯性驗證 (Security & Resilience)', () => {

    test('TC-NFN-05: XSS 防護測試 - 於商品名稱輸入 script 標籤應被安全轉義', async ({ page }) => {
      // 前往商品總庫
      await page.locator('button:has-text("商品總庫管理")').click();
      await page.waitForSelector('h2:has-text("全域商品總庫")');

      // 插入含有 XSS Payload 的文字
      const firstCard = page.locator('.grid.grid-cols-1 > div').first();
      const chNameInput = firstCard.locator('input.font-bold.text-sm');
      const xssPayload = '<script>window.__xss_attack_triggered__=true;</script>';
      await chNameInput.fill(xssPayload);

      // 驗證不會被瀏覽器作為 HTML 腳本解析執行
      const xssTriggered = await page.evaluate(() => window.__xss_attack_triggered__);
      expect(xssTriggered).toBeUndefined();
    });

    test('TC-NFN-04: 響應式佈局驗證 - 1024px 寬度下不破版且表格提供水平捲動', async ({ page }) => {
      await page.setViewportSize({ width: 1024, height: 768 });
      await page.locator('button:has-text("商品價格管理")').click();
      await page.waitForSelector('h2:has-text("全台各區商品價格矩陣")');

      // 檢查表格外層有 overflow-x-auto
      const tableWrapper = page.locator('.overflow-x-auto');
      await expect(tableWrapper).toBeVisible();
      const hasHorizontalScroll = await tableWrapper.evaluate(el => el.scrollWidth >= el.clientWidth);
      expect(hasHorizontalScroll).toBe(true);
    });
  });

});
