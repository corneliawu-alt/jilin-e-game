# 料理鼠亡 - 漢他病毒防衛戰

2D 網格 RPG 衛教遊戲，以 React + Vite + Tailwind 建置。玩家在小鎮地圖中向 NPC 學習、答題驅逐老鼠、尋寶收集道具，最終挑戰鼠王 Boss。

## 功能概覽

- 40×30 可探索小鎮地圖（道路、建築、公園、回收站等）
- 學習期：找 3 位 NPC 完成衛教對話
- 實戰期：10 隻任務鼠答題 + 尋寶收集三種道具
- Boss 戰：集齊 🪤 黏鼠板、🧴 漂白水、😷 防護口罩 後可挑戰鼠王
- 尋寶雷達：定位未收集寶物（冷卻或消耗積分）
- 成績紀錄：Firebase Firestore 雲端上傳（選用，失敗則存本機）

## 環境需求

- Node.js 18 以上
- npm

## 本機開發（Cursor / VS Code）

```bash
# 1. 克隆專案
git clone https://github.com/corneliawu-alt/jilin-e-game.git
cd jilin-e-game

# 2. 安裝依賴
npm install

# 3. （選用）設定 Firebase 成績上傳
cp .env.example .env
# 編輯 .env，填入 Firebase 專案資訊（參考 firebase-applet-config.example.json）

# 4. 放入角色圖片（見下方「角色素材」）

# 5. 啟動開發伺服器
npm run dev
```

瀏覽器開啟 `http://localhost:3000`（若 port 被占用，Vite 會自動換 port）。

### 其他指令

```bash
npm run build    # 建置正式版至 dist/
npm run preview  # 預覽建置結果
npm run lint     # TypeScript 型別檢查
```

## 角色素材

請將 RPG Maker 角色 PNG 放入 `public/characters/`，詳見 [public/characters/README.md](public/characters/README.md)。

| 檔案 | 用途 |
|------|------|
| `Actor1_1.png` / `Actor1_1_1.png` | 玩家 1 大圖 / 地圖行走圖 |
| `Actor1_2.png` / `Actor1_2_1.png` | 玩家 2 大圖 / 地圖行走圖 |
| `Actor1_5.png` ~ `Actor1_8_1.png` | 三位 NPC 大圖與行走圖 |

> 若素材有版權限制，請勿公開上傳至 GitHub；可改用 Private repo 或各自本地放置。

## Firebase 設定（選用）

遊戲**不設定 Firebase 也能正常遊玩**，成績會改存瀏覽器 `localStorage`。

若要啟用雲端成績上傳：

1. 複製 `.env.example` 為 `.env`
2. 填入 Firebase 專案資訊（欄位對照見 `firebase-applet-config.example.json`）
3. 到 [Firebase Console](https://console.firebase.google.com) → 專案設定 → **Authorized domains**，加入你的部署網域（如 `xxx.vercel.app`）

## 部署到 Vercel

1. 將此 repo 推送到 GitHub
2. 登入 [vercel.com](https://vercel.com) → **Add New → Project**
3. 選擇 `jilin-e-game` repository
4. Vercel 會自動偵測 Vite，設定如下：

| 項目 | 值 |
|------|-----|
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |

5. （選用）在 Vercel **Environment Variables** 加入 `VITE_FIREBASE_*` 變數
6. 按 **Deploy**

專案已包含 `vercel.json`，push 後會自動觸發重新部署。

## 操作說明

| 按鍵 | 功能 |
|------|------|
| 方向鍵 / WASD | 移動 |
| 空白鍵 | 與 NPC / 寶物 / 任務鼠互動 |
| 滑鼠 | UI 按鈕（雷達、背包等） |

## 專案結構

```
src/
  components/     # React UI 元件
  constants/      # 地圖、題庫、道具、NPC 資料
  lib/            # Firebase、成績儲存
public/
  characters/     # 角色 PNG（需自行放入）
```

## 授權

Apache-2.0（見各檔案 SPDX 標頭）
