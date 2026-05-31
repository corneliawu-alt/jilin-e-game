# 背景音樂

BGM 檔案路徑：`public/music/bgm.mp3`（網址 `/music/bgm.mp3`）

遊戲會自動循環播放；若檔案不存在，僅停用音樂功能，不影響遊戲進行。

## 建議格式

- 格式：MP3
- 長度：1～3 分鐘（會循環播放）
- 風格：輕快 RPG 冒險感、音量適中

## 音效（選用）

未來可在 `public/sfx/` 放置音效，並於 `src/lib/audio.ts` 的 `SOUND_SOURCES` 對照表中加入路徑。
