# TEA TOP 第一味 - TOP 10 數位電子看板與雲端管理系統
> **Version 1.0.0** | High-Fidelity Digital Signage & Cloud CMS

本專案為 **TEA TOP 第一味** 打造之門市專用「TOP 10 數位電子看板」與「雲端視覺化管理後台」。基於 Figma 設計稿進行 1:1 像素級高保真切版，搭載 1920x1080 Full HD 智能等比縮放機制，並整合 Firebase Firestore 實現跨分區菜單即時推播與離線容錯防白屏機制。

---

## 📌 系統預覽與存取端點 (Endpoints)

| 系統模組 | 本地服務網址 | 說明 |
| :--- | :--- | :--- |
| **數位電子看板 (電視盒專用)** | `http://localhost:8085/index2.html` | 1920x1080 數位看板端，支援平滑輪播與雲端即時同步 |
| **數位看板 (北區門市)** | `http://localhost:8085/index2.html?region=north` | 北區門市專屬 TOP 10 菜單與定價 |
| **數位看板 (中區門市)** | `http://localhost:8085/index2.html?region=central` | 中區門市專屬 TOP 10 菜單與定價 |
| **數位看板 (南區門市)** | `http://localhost:8085/index2.html?region=south` | 南區門市專屬 TOP 10 菜單與定價 |
| **雲端管理後台 (v0 UI)** | `http://localhost:8080/admin-v0.html` | 視覺化管理介面，支援即時編輯、排序、圖片上傳與發布 |

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

## 📂 專案檔案結構 (Project Structure)

```text
Teatop TOP10 Figma/
├── index2.html             # [主要] TOP 10 數位電子看板展示主頁 (v2 架構)
├── app2.js                 # [主要] 看板自適應縮放、輪播控制與雲端監聽邏輯
├── styles2.css             # [主要] 數位看板高保真 Figma 樣式
├── admin-v0.html           # [主要] 雲端視覺化菜單管理後台 (React + Tailwind CDN)
├── firebase-config.js      # Firebase 初始化與 Firestore 即時資料讀寫 API
├── data/
│   └── default_menus.js    # 各分區預設菜單資料（提供離線秒開與斷網備援）
├── assets/                 # 品牌標誌、飲品透明背景圖、背景紋理等素材
├── admin.html              # 備用純 HTML/CSS 管理後台版本
├── admin-ui/               # Vite + React 管理後台模組原始碼
├── firebase.json           # Firebase Hosting 與環境配置檔
├── firestore.rules         # Firestore 安全規則
├── firestore.indexes.json  # Firestore 索引配置
└── .gitignore              # Git 排除清單 (排除 node_modules 等建置產物)
```

---

## 🏷️ 版本歷史 (Changelog)

### `v1.0.0` - 2026-09-03
* ✨ **新增**：`index2.html` 數位電子看板高保真版，支援 1920x1080 智慧等比縮放與平滑輪播。
* ✨ **新增**：`admin-v0.html` 現代化雲端視覺化管理後台，具備分區菜單編輯、圖片預覽與即時推送功能。
* ⚡ **架構升級**：整合 Firebase Firestore 雲端同步與 `data/default_menus.js` 離線容錯雙層架構，達成門市零延遲開機與斷網防白屏保護。
* 🌐 **多區支援**：支援 URL 參數分區切換（`?region=north|central|south|demo`）。
* 📝 **文件完善**：建立全系統規格說明文件與本地端運行指南。
