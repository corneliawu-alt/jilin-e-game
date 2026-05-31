/** 背景音樂路徑（檔案請放在 public/music/bgm.mp3） */
export const BGM_SRC = '/music/bgm.mp3';

export const DEFAULT_BGM_VOLUME = 0.45;
/** BGM 播放 SFX 時閃避至原音量比例 */
export const BGM_DUCKED_VOLUME_RATIO = 0.2;
export const SFX_VOLUME = 0.8;
/** SFX 結束後還原 BGM 的保險逾時（ms） */
export const BGM_DUCK_RESTORE_FALLBACK_MS = 2000;

export const SFX_SOURCES = {
  success: '/success.mp3',
  fail: '/fail.mp3',
} as const;

export type SfxType = keyof typeof SFX_SOURCES;

/** @deprecated 請改用 SFX_SOURCES / playSfx */
export const SOUND_SOURCES: Partial<Record<string, string>> = {
  success: SFX_SOURCES.success,
  fail: SFX_SOURCES.fail,
  correct: SFX_SOURCES.success,
  wrong: SFX_SOURCES.fail,
  treasure: '/sfx/treasure.mp3',
  quest_complete: '/sfx/quest_complete.mp3',
};

export function createBgmAudio(): HTMLAudioElement {
  const audio = new Audio(BGM_SRC);
  audio.loop = true;
  audio.preload = 'auto';
  audio.volume = DEFAULT_BGM_VOLUME;
  return audio;
}

export function createSfxAudio(type: SfxType): HTMLAudioElement {
  const audio = new Audio(SFX_SOURCES[type]);
  audio.preload = 'auto';
  audio.volume = SFX_VOLUME;
  return audio;
}

/** 播放單次音效；找不到檔案或播放失敗時僅記錄警告，不拋錯 */
export async function playSound(
  effectName: string,
  volume = SFX_VOLUME,
): Promise<void> {
  const src = SOUND_SOURCES[effectName];
  if (!src) {
    console.warn(`[audio] 未知音效：${effectName}`);
    return;
  }

  try {
    const audio = new Audio(src);
    audio.volume = volume;
    await audio.play();
  } catch (error) {
    console.warn(`[audio] 音效播放失敗 (${effectName}):`, error);
  }
}

export async function safePlayBgm(audio: HTMLAudioElement): Promise<boolean> {
  try {
    await audio.play();
    return true;
  } catch (error) {
    console.warn('[audio] BGM 播放被瀏覽器阻擋，等待使用者互動：', error);
    return false;
  }
}

export function attachBgmErrorHandler(
  audio: HTMLAudioElement,
  onError: () => void,
): () => void {
  const handleError = () => {
    console.warn(`[audio] BGM 載入失敗：${BGM_SRC}`);
    onError();
  };
  audio.addEventListener('error', handleError);
  return () => audio.removeEventListener('error', handleError);
}

export function attachSfxErrorHandler(
  audio: HTMLAudioElement,
  type: SfxType,
  onError: () => void,
): () => void {
  const handleError = () => {
    console.warn(`[audio] 音效載入失敗：${SFX_SOURCES[type]}`);
    onError();
  };
  audio.addEventListener('error', handleError);
  return () => audio.removeEventListener('error', handleError);
}

export function getDuckedBgmVolume(normalVolume = DEFAULT_BGM_VOLUME): number {
  return Math.min(0.1, normalVolume * BGM_DUCKED_VOLUME_RATIO);
}

/** 前言低頻「咚」一聲（Web Audio，無需額外音效檔） */
export function playIntroSting(): void {
  try {
    const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(92, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(48, ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.75);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);
    osc.onended = () => void ctx.close();
  } catch (error) {
    console.warn('[audio] 前言音效播放失敗：', error);
  }
}
