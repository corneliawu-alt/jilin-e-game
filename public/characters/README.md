# 角色圖片（RPG Maker Actor）

請將下列 PNG 放入此目錄：

| 檔案 | 用途 |
|------|------|
| `Actor1_1.png` | 玩家 1 對話框大圖（稽查員 A） |
| `Actor1_1_1.png` | 玩家 1 地圖行走圖（4×2 方向小圖） |
| `Actor1_2.png` | 玩家 2 對話框大圖（稽查員 B） |
| `Actor1_2_1.png` | 玩家 2 地圖行走圖（4×2 方向小圖） |
| `Actor1_5.png` | NPC 大頭照：餐廳大廚（Chef） |
| `Actor1_5_1.png` | NPC 地圖行走圖：餐廳大廚 |
| `Actor1_6.png` | NPC 大頭照：鎮守醫師（Doctor） |
| `Actor1_6_1.png` | NPC 地圖行走圖：鎮守醫師 |
| `Actor1_8.png` | NPC 大頭照：清潔隊長（Captain） |
| `Actor1_8_1.png` | NPC 地圖行走圖：清潔隊長 |

路徑由 `src/constants/characterAssets.ts` 的 `ACTOR_FILES` 統一管理。

## 行走圖方向（4 欄 × 2 列）

| 欄位 | 朝向 |
|------|------|
| 第 1 欄 | 向下 |
| 第 2 欄 | 向左 |
| 第 3 欄 | 向右 |
| 第 4 欄 | 向上 |

上下兩列為走路動畫幀（站立／跨步）。
