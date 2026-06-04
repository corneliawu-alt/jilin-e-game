# 料理鼠亡 - 漢他病毒防衛戰

2D 網格 RPG 衛教遊戲，以 React + Vite + Tailwind 建置。玩家在小鎮地圖中向 NPC 學習、答題驅逐老鼠、尋寶收集道具，最終挑戰鼠王 Boss。

## 功能概覽

- 40×30 可探索小鎮地圖（道路、建築、公園、回收站等）
- 學習期：找 3 位 NPC 完成衛教對話（閒置／線索雙模式）
- 實戰期：10 隻任務鼠答題 + 尋寶收集三種道具
- 任務進度表：0/10 進度條、防疫積分、防鼠徽章特效
- 結局：星級榮譽獎狀 + **Google 試算表**成績上傳（GAS）

## 環境需求

- Node.js 18 以上
- npm

## 本機開發

```bash
git clone https://github.com/corneliawu-alt/jilin-e-game.git
cd jilin-e-game
npm install

# （選用）設定 Google 試算表成績上傳
cp .env.example .env
# 編輯 .env，填入 VITE_GOOGLE_FORM_SCRIPT_URL

npm run dev
```

## Google 試算表成績上傳

完成 10 項任務、加冕劇情結束後，背景 POST 至 Google Apps Script，寫入試算表。

**試算表標題列（第一列）：** `Timestamp` | `Class` | `Seat` | `Name` | `Score` | `Time`

**傳送欄位：** 班級、座號、姓名、總積分、完成時間（MM:SS）

1. 在**要寫入的那份試算表**內開啟 Apps Script（擴充功能 → Apps Script），貼上 [docs/gas-score-submit.example.js](docs/gas-score-submit.example.js) 的 `doPost`
2. 部署為「網路應用程式」（執行身分：我；存取：**任何人**）
3. 修改 GAS 後須「管理部署 → 編輯 → 新版本」才會生效
4. `.env` 設定：

```env
VITE_GOOGLE_FORM_SCRIPT_URL=https://script.google.com/macros/s/你的部署ID/exec
```

4. Vercel 部署時在 Environment Variables 加入同一變數

未設定 URL 時遊戲可正常遊玩，但成績**不會**上傳試算表，登入頁排行榜也無法顯示資料。

### 登入頁排行榜

- 僅從 Google 試算表讀取（`GET ?action=leaderboard&limit=6`），顯示全體最快前六名。
- GAS 需使用 `docs/gas-score-submit.example.js` 內含 `getLeaderboard` 的版本，部署後請**更新網路應用程式版本**。
- 測試：瀏覽器開啟 `你的/exec?action=leaderboard&limit=6` 應看到 JSON `entries`（有資料時不可為 `[]`）。
- **試算表有資料但 `entries` 是空陣列**：多半是 `Time` 欄被 Google 存成時間格式，`getValues()` 讀不到 `4:42` 這種字串；請更新 GAS 為使用 `getDisplayValues()` 的版本並重新部署。

### 排行榜有資料、試算表卻是空的？

| 可能原因 | 處理方式 |
|----------|----------|
| Vercel 未設定環境變數 | 到 Vercel → Settings → Environment Variables 加入 `VITE_GOOGLE_FORM_SCRIPT_URL`，重新 Deploy |
| GAS 未綁定該試算表 | 必須從試算表內開啟 Apps Script，不要用獨立空白專案 |
| 欄位順序不符 | GAS `appendRow` 順序須為：時間戳記、Class、Seat、Name、Score、Time（見範例檔） |
| 部署版本過舊 | GAS 管理部署 → 新版本 → 再測試 |

通關後按 F12 → Console，若出現 `[ScoreSubmit] Google 試算表上傳失敗` 代表前端有打到 GAS 但遭拒絕，請對照 GAS 執行紀錄。

架構說明：[docs/GAME_ARCHITECTURE.md](docs/GAME_ARCHITECTURE.md)

## 部署到 Vercel

| 項目 | 值 |
|------|-----|
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |

環境變數：`VITE_GOOGLE_FORM_SCRIPT_URL`（選用）

## 操作說明

| 按鍵 | 功能 |
|------|------|
| 方向鍵 / WASD | 移動 |
| 空白鍵 | 與 NPC / 寶物 / 任務鼠互動 |
| 滑鼠 | 點擊任務鼠、UI 按鈕 |

## 專案結構

```
src/
  components/     # Game、QuestProgressBar、NpcDialog、HonorCertificate…
  constants/      # gameData（題庫、NPC）、tilemap（地圖）
  lib/            # submitGoogleForm、submitGameScore
docs/             # 架構說明、GAS 範例
public/characters/
```

## 授權

Apache-2.0
