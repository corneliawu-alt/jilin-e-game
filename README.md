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

**傳送欄位：** 班級、座號、姓名、總積分（`totalScore`）、完成時間（`elapsedTime`，MM:SS）

1. 建立試算表與 GAS，參考 [docs/gas-score-submit.example.js](docs/gas-score-submit.example.js)
2. 部署為「網路應用程式」（存取：任何人）
3. `.env` 設定：

```env
VITE_GOOGLE_FORM_SCRIPT_URL=https://script.google.com/macros/s/你的部署ID/exec
```

4. Vercel 部署時在 Environment Variables 加入同一變數

未設定 URL 時遊戲可正常遊玩，成績僅顯示於獎狀（可選本機 `localStorage` 備份）。

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
