# 料理鼠亡 - 漢他病毒防衛戰 · 遊戲架構

## 1. 遊戲基礎設定

| 項目 | 實作 |
|------|------|
| 標題 | `GAME_TITLE` — 料理鼠亡 - 漢他病毒防衛戰 |
| 玩家角色 | 特級衛生稽查員（外觀：吉林娃娃，`characterAssets`） |
| 劇情 | `GAME_STORY_SUMMARY` + `GameIntro` |

劇情摘要：吉林小鎮爆發疫情，玩家探索大地圖，至餐廳／診所／倉庫向三位 NPC 多段學習，尋寶並以捕鼠網完成 10 項防疫任務；全數答對後依正確率與時間結算，頒發星級獎狀，並 POST 成績至 Google 試算表（GAS）。

## 2. 流程狀態

```
LOGIN → INTRO → PLAYING
  ├─ 學習期：與 3 位 NPC 多段對話（空白鍵逐句）
  ├─ 認證彈窗 → 實戰期
  ├─ Enter/Z 抓鼠答題（答錯可重挑，進度僅答對時 +1）
  └─ 10/10 → 勝利劇情 → 榮譽獎狀 + 成績上傳
```

## 3. 任務進度表 `QuestProgressBar`

- 位置：`GameHeader` 上方區塊
- **防疫任務 n/10**、平滑 CSS `transition` 進度條
- **防疫積分**面板
- 10 格老鼠槽 + 答對時徽章／捕獲特效（`lastCapturedQuestId`）
- 每題 **兩次**作答機會：第一次答錯顯示統一提示並留在對話框再選；第二次答錯顯示 `errorMsg` 線索，按「我知道了」關閉；下次再抓同一鼠時次數重置
- 進度僅在答對時 +1

## 4. 題庫 `QUESTIONS` / `questions`

每題：`question`, `options`, `correctAnswer`（0-based）, `successMsg`, `errorMsg`, `targetNPC`（`'Chef' | 'Doctor' | 'Captain'`）

- 第一次答錯：統一提示，按「再試一次」留在題目
- 第二次答錯：顯示 `errorMsg` 線索，按「我知道了」關閉 → 設定 `seekingNpc` → 該 NPC **線索對話**（`clueDialogue`）
- 答對：進度 +1，關閉後可繼續抓下一隻鼠

## 5. NPC 對話

| ID | 區域 | 首次 `dialogue[]` | `summary` | 線索 `clueDialogue` |
|----|------|-------------------|-----------|---------------------|
| Chef | 小鎮餐廳 | 三不政策等多段 | 精簡複習 | 答錯後請教 |
| Doctor | 小鎮診所 | 傳播／潛伏期／症狀 | 同上 | 同上 |
| Captain | 小鎮倉庫 | 清理 SOP 五步 | 同上 | 同上 |

### 互動規則

| 按鍵 | 行為 |
|------|------|
| **空白鍵** | 僅九宮格內 **NPC**（忽略老鼠） |
| **Enter / Z** | 互動範圍內 **抓鼠**（未完成 3 NPC 時老鼠嘲諷） |

### 再次拜訪（已完成該 NPC 學習）

1. 選單：**A. 我想重點複習** → 顯示 `summary`，空白鍵關閉  
2. 選單：**B. 我接下來該做什麼？** → 動態提示（`getNpcDepartureMessage`）  
   - 尚有未拜訪 NPC → 提醒下一位姓名  
   - 三位皆完成 → 引導按 Enter 用捕鼠網  

實作：`NpcDialog`、`npcFollowUpDialogue.ts`

## 6. 2D 地圖

- **40×30** 格，`TILE_SIZE = 32`（`mapConfig.ts`）
- `tilemap.ts`：草地、道路、建築牆頂、樹木、水池等造景
- 餐廳／診所／倉庫地標 + 區域色帶
- `GameMap`：`overflow-hidden` viewport + `computeCameraOffset` 視角跟隨

## 7. 老鼠

- 素材：`/enemyrat/rat1~3.png`，`ratType` 隨機，`RatSprite` 精靈裁切
- 走近顯示 **捕鼠網** 提示（`RatCatchNetIndicator`）
- 漫遊／與 NPC 不重疊（`npcWander` / `ratWander`）

## 8. 音訊

- 小鎮 BGM：`bgm.mp3`
- 解鎖實戰：`bomp.mp3`（僅認證時）
- 答題中：`battle.mp3`（開答題框切換，關閉恢復）
- 結局：`win.mp3`

## 9. 登入與排行榜

- RPG 卷軸版面 `login-rpg-scroll`、Google 試算表前 6 名（`fetchGoogleLeaderboard.ts` + GAS `?action=leaderboard`）
- 裝飾老鼠 `LoginDecorRats`

## 10. 成績上傳（Google 試算表，無 Firebase）

觸發：勝利劇情結束 → 獎狀前，`submitGameScore` 非同步執行。

| 欄位 | 說明 |
|------|------|
| `classId` | 班級 |
| `seatNumber` | 座號 |
| `name` | 姓名 |
| `totalScore` | 總積分 |
| `elapsedTime` | MM:SS |
| 其他 | 完成題數、星級等（見 `submitGoogleForm.ts`） |

環境變數：`VITE_GOOGLE_FORM_SCRIPT_URL`  
範例 GAS：`docs/gas-score-submit.example.js`  
登入頁排行榜由 GAS GET 讀取試算表，不再使用 localStorage。

## 11. 主要檔案

| 路徑 | 職責 |
|------|------|
| `src/components/Game.tsx` | 主迴圈、鍵盤分流、狀態 |
| `src/constants/gameData.ts` | 題庫、NPC、地圖常數 |
| `src/constants/tilemap.ts` | 地圖生成、任務點 |
| `src/components/QuestProgressBar.tsx` | 任務進度與積分 |
| `src/components/QuestQuizDialog.tsx` | 答題與去尋找 NPC |
| `src/components/NpcDialog.tsx` | NPC 多段／選單／複習 |
| `src/lib/submitGameScore.ts` | 結算上傳 |
| `src/contexts/BgmContext.tsx` | BGM／音效 |

## 12. 操作提示（常駐）

`GAME_KEYBOARD_HINT`：**WASD移動 • 空白鍵:對話 • Enter鍵或Z鍵:抓老鼠**
