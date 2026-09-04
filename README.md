# TEA TOP 第一味 - TOP 10 數位電子看板與雲端管理系統
> **Version 1.1.0** | High-Fidelity Digital Signage & Cloud CMS

本專案為 **TEA TOP 第一味** 打造之門市專用「TOP 10 數位電子看板」與「雲端視覺化管理後台」。基於 Figma 設計稿進行 1:1 像素級高保真切版，搭載 1920x1080 Full HD 智能等比縮放機制，並整合 Firebase Firestore 實現跨分區菜單即時推播與離線容錯防白屏機制。

---

## 🌐 雲端正式發布端點 (Online Production Endpoints)

### 1. Google Firebase Hosting (全球 CDN 加速)
* 📺 **數位電子看板 (首頁)**: [https://teatop-top10.web.app/index2.html](https://teatop-top10.web.app/index2.html)
* 📍 **分區看板 (北區門市)**: [https://teatop-top10.web.app/index2.html?region=north](https://teatop-top10.web.app/index2.html?region=north)
* 📍 **分區看板 (中區門市)**: [https://teatop-top10.web.app/index2.html?region=central](https://teatop-top10.web.app/index2.html?region=central)
* 📍 **分區看板 (南區門市)**: [https://teatop-top10.web.app/index2.html?region=south](https://teatop-top10.web.app/index2.html?region=south)
* 🛠️ **雲端管理後台 (v0 UI)**: [https://teatop-top10.web.app/admin-v0.html](https://teatop-top10.web.app/admin-v0.html)

### 2. GitHub Pages (靜態託管備援)
* 📺 **數位電子看板**: [https://ultronservice.github.io/Teatop-TOP10-Figma/index2.html](https://ultronservice.github.io/Teatop-TOP10-Figma/index2.html)
* 🛠️ **雲端管理後台**: [https://ultronservice.github.io/Teatop-TOP10-Figma/admin-v0.html](https://ultronservice.github.io/Teatop-TOP10-Figma/admin-v0.html)

---

## 📌 本地開發與區域網路存取 (Local & LAN)

| 系統模組 | 本地服務網址 | 區域網路 (Wi-Fi/電視盒) | 說明 |
| :--- | :--- | :--- | :--- |
| **數位電子看板 (首頁)** | `http://localhost:8085/index2.html` | `http://192.168.1.184:8085/index2.html` | 1920x1080 數位看板端，支援平滑輪播與雲端即時同步 |
| **數位看板 (北區門市)** | `http://localhost:8085/index2.html?region=north` | `http://192.168.1.184:8085/index2.html?region=north` | 北區門市專屬 TOP 10 菜單與定價 |
| **數位看板 (中區門市)** | `http://localhost:8085/index2.html?region=central` | `http://192.168.1.184:8085/index2.html?region=central` | 中區門市專屬 TOP 10 菜單與定價 |
| **數位看板 (南區門市)** | `http://localhost:8085/index2.html?region=south` | `http://192.168.1.184:8085/index2.html?region=south` | 南區門市專屬 TOP 10 菜單與定價 |
| **雲端管理後台 (v0 UI)** | `http://localhost:8080/admin-v0.html` | `http://192.168.1.184:8080/admin-v0.html` | 視覺化管理介面，支援即時編輯、排序、圖片上傳與發布 |

---

## ✨ 核心特色與技術亮點

### 1. 📺 TOP 10 數位看板展示端 (`index2.html` / `app2.js`)
* **1:1 Figma 像素級還原**：精確還原品牌字型、色彩主題、漸層光暈與排版層次。
* **1920x1080 Full HD 自適應縮放**：採用 Transform Scale 核心自適應演算法，在任何商用電視盒、直/橫螢幕或各類螢幕解析度下保證零跑版。
* **雙層資料防禦架構（秒開 + 離線不斷訊）**：
  * **第一層（本地預備層）**：透過 `data/default_menus.js` 在開機 0 毫秒立即呈現菜單，徹底解決門市開機白屏與等待延遲問題。
  * **第二層（雲端同步層）**：背景非同步連接 Firebase Firestore，即時監聽後台發布更新，秒級無感刷新畫面。
  * **斷網保護**：門市網路中斷時自動鎖定離線快取，看板持續順暢運作。
* **多輪播動態機制**：流暢平滑切換、獨立倒數進度條、自定義主題色切換。

### 2. 🛠️ 雲端視覺化管理後台 (`admin-v0.html`)
* **現代化輕量架構**：整合 React 18 + Tailwind CSS + Lucide Icons，無繁瑣建置環境即可開箱即用。
* **多分區門市切換**：可獨立維護北區、中區、南區及示範門市菜單與個別價格。
* **TOP 10 項目全屬性自定義**：
  * 品名、英文名、排名、價格、冷/熱標示、新品/推薦徽章。
  * 自定義主題色彩（鮮果、珍珠、特調、純茶等特色主題）。
  * 圖片預覽卡片與支援本機圖片上傳 / 外部圖檔 URL。
* **一鍵雲端即時發布**：編輯完成點擊發布，Firestore 即時推送至全台門市看板，無需重新整理網頁。

---

## 🚀 本地端快速啟動 (Quick Start)

### 方式一：使用 Node.js / http-server (推薦)
```bash
# 全域安裝 http-server（若尚未安裝）
npm install -g http-server

# 啟動雲端管理後台 (Port 8080)
http-server . -p 8080 -c-1

# 另開終端機啟動數位看板 (Port 8085)
http-server . -p 8085 -c-1
```

### 方式二：使用 Python 內建伺服器
```bash
# 啟動 8080 端口
python -m http.server 8080

# 另開終端機啟動 8085 端口
python -m http.server 8085
```

開啟瀏覽器前往：
* 管理後台：[http://localhost:8080/admin-v0.html](http://localhost:8080/admin-v0.html)
* 電子看板：[http://localhost:8085/index2.html](http://localhost:8085/index2.html)

---

## 🧪 自動化端對端測試 (E2E Testing with Playwright)

專案包含完整的 Playwright 自動化測試套件，涵蓋展示端動畫輪播、後台完整功能模組與異常防呆驗證：

```bash
# 啟動本地測試伺服器 (Port 8085)
npx http-server . -p 8085 -c-1

# 執行所有 Playwright E2E 測試
npx playwright test

# 執行特定測試套件
npx playwright test tests/admin-v0.spec.js  # 後台全模組測試 (看板配置/商品總庫/分區定價/防呆機制)
npx playwright test tests/frontend.spec.js  # 電子看板輪播與畫面渲染測試
npx playwright test tests/backend.spec.js   # 後台基礎功能測試
```

---

## 📂 專案檔案結構 (Project Structure)

```text
Teatop TOP10 Figma/
├── .github/
│   └── workflows/
│       └── deploy-pages.yml# GitHub Pages 自動部屬 CI/CD 工作流
├── index2.html             # [主要] TOP 10 數位電子看板展示主頁 (v2 架構)
├── app2.js                 # [主要] 看板自適應縮放、輪播控制與雲端監聽邏輯
├── styles2.css             # [主要] 數位看板高保真 Figma 樣式
├── admin-v0.html           # [主要] 雲端視覺化菜單管理後台 (React + Tailwind CDN)
├── firebase-config.js      # Firebase 初始化與 Firestore 即時資料讀寫 API
├── data/
│   └── default_menus.js    # 各分區預設菜單資料（提供離線秒開與斷網備援）
├── assets/                 # 品牌標誌、飲品透明背景圖、背景紋理等素材
├── tests/                  # Playwright 自動化端對端測試套件
│   ├── admin-v0.spec.js    # 管理後台全功能模組 E2E 深度測試
│   ├── frontend.spec.js    # 數位看板展示與自動輪播測試
│   └── backend.spec.js     # 管理後台基礎功能測試
├── admin.html              # 備用純 HTML/CSS 管理後台版本
├── admin-ui/               # Vite + React 管理後台模組原始碼
├── firebase.json           # Firebase Hosting 與 Firestore 配置檔
├── firestore.rules         # Firestore 安全規則
├── firestore.indexes.json  # Firestore 索引配置
└── .gitignore              # Git 排除清單 (排除 node_modules 等建置產物)
```

---

## 🏷️ 版本歷史 (Changelog)

### `v1.1.0` - 2026-09-04
* 🛡️ **榜單防重複機制**：更換 TOP 10 項目時若選中已存在於榜單之商品，自動執行雙向對調（Swap），徹底杜絕品項重複配置問題。
* 🔍 **全域庫搜尋與定價優化**：
  * 商品總庫新增即時搜尋與分類篩選，並強化搜尋結果為空時的友善提示。
  * 矩陣分區定價優化數值輸入與雙向連動，避免輸入非數字或空值引發之計算異常。
* 🗑️ **分區安全刪除與管理**：支援自定義門市/分區的新增與刪除功能，並加入最後分區防呆保護機制。
* 🧪 **Playwright 完整測試套件**：
  * 新增 `tests/admin-v0.spec.js`，包含看板排行榜配置、商品總庫管理、分區定價矩陣及防呆邏輯等完整自動化檢測。
  * 支援循序執行與 Firestore 實時資料變更斷言。

### `v1.0.1` - 2026-09-03
* 🚀 **雲端發布**：正式同步部署至 **Firebase Hosting** (`teatop-top10.web.app`) 與 **GitHub Pages**。
* ⚙️ **自動化 CI/CD**：建立 `.github/workflows/deploy-pages.yml` 支援推送自動部屬。
* 📝 **文件擴充**：補齊公網網址、分區端點與區域網路測試資訊。

### `v1.0.0` - 2026-09-03
* ✨ **新增**：`index2.html` 數位電子看板高保真版，支援 1920x1080 智慧等比縮放與平滑輪播。
* ✨ **新增**：`admin-v0.html` 現代化雲端視覺化管理後台，具備分區菜單編輯、圖片預覽與即時推送功能。
* ⚡ **架構升級**：整合 Firebase Firestore 雲端同步與 `data/default_menus.js` 離線容錯雙層架構，達成門市零延遲開機與斷網防白屏保護。
* 🌐 **多區支援**：支援 URL 參數分區切換（`?region=north|central|south|demo`）。
