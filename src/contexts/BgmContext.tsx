import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  attachBgmErrorHandler,
  attachSfxErrorHandler,
  BGM_DUCK_RESTORE_FALLBACK_MS,
  createBgmAudio,
  createSfxAudio,
  DEFAULT_BGM_VOLUME,
  getDuckedBgmVolume,
  safePlayBgm,
  playIntroSting as playIntroStingAudio,
  type SfxType,
} from '../lib/audio';

type BgmContextValue = {
  enabled: boolean;
  unlocked: boolean;
  loadFailed: boolean;
  unlock: () => void;
  toggle: () => void;
  playSfx: (type: SfxType) => void;
  playIntroSting: () => void;
};

const BgmContext = createContext<BgmContextValue | null>(null);

export function BgmProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const successSfxRef = useRef<HTMLAudioElement | null>(null);
  const failSfxRef = useRef<HTMLAudioElement | null>(null);
  const duckRestoreTimerRef = useRef<number | null>(null);
  const duckCleanupRef = useRef<(() => void) | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  const clearDuckRestore = useCallback(() => {
    if (duckRestoreTimerRef.current !== null) {
      window.clearTimeout(duckRestoreTimerRef.current);
      duckRestoreTimerRef.current = null;
    }
    duckCleanupRef.current?.();
    duckCleanupRef.current = null;
  }, []);

  const restoreBgmVolume = useCallback(() => {
    const bgm = audioRef.current;
    if (!bgm || loadFailed) return;
    bgm.volume = DEFAULT_BGM_VOLUME;
  }, [loadFailed]);

  useEffect(() => {
    const bgm = createBgmAudio();
    audioRef.current = bgm;
    const detachBgm = attachBgmErrorHandler(bgm, () => setLoadFailed(true));

    const successSfx = createSfxAudio('success');
    const failSfx = createSfxAudio('fail');
    successSfxRef.current = successSfx;
    failSfxRef.current = failSfx;
    const detachSuccess = attachSfxErrorHandler(successSfx, 'success', () => {});
    const detachFail = attachSfxErrorHandler(failSfx, 'fail', () => {});

    return () => {
      clearDuckRestore();
      detachBgm();
      detachSuccess();
      detachFail();
      bgm.pause();
      bgm.src = '';
      successSfx.src = '';
      failSfx.src = '';
      audioRef.current = null;
      successSfxRef.current = null;
      failSfxRef.current = null;
    };
  }, [clearDuckRestore]);

  const unlock = useCallback(() => {
    setUnlocked(true);
  }, []);

  const toggle = useCallback(() => {
    if (loadFailed) return;
    clearDuckRestore();
    restoreBgmVolume();
    setUnlocked(true);
    setEnabled((prev) => !prev);
  }, [loadFailed, clearDuckRestore, restoreBgmVolume]);

  useEffect(() => {
    if (!unlocked) return;
    const bgm = audioRef.current;
    if (!bgm || loadFailed) return;

    if (enabled) {
      bgm.volume = DEFAULT_BGM_VOLUME;
      void safePlayBgm(bgm);
    } else {
      clearDuckRestore();
      bgm.pause();
    }
  }, [enabled, unlocked, loadFailed, clearDuckRestore]);

  const playSfx = useCallback(
    (type: SfxType) => {
      if (!enabled) return;

      const sfx = type === 'success' ? successSfxRef.current : failSfxRef.current;
      if (!sfx) return;

      clearDuckRestore();

      const bgm = audioRef.current;
      const shouldDuck = Boolean(bgm && !loadFailed && !bgm.paused);

      if (shouldDuck && bgm) {
        bgm.volume = getDuckedBgmVolume(DEFAULT_BGM_VOLUME);
      }

      const finishDuck = () => {
        if (duckRestoreTimerRef.current !== null) {
          window.clearTimeout(duckRestoreTimerRef.current);
          duckRestoreTimerRef.current = null;
        }
        duckCleanupRef.current = null;
        if (shouldDuck && enabled) restoreBgmVolume();
      };

      const onEnded = () => {
        sfx.removeEventListener('ended', onEnded);
        finishDuck();
      };

      duckCleanupRef.current = () => {
        sfx.removeEventListener('ended', onEnded);
      };

      sfx.addEventListener('ended', onEnded);
      duckRestoreTimerRef.current = window.setTimeout(() => {
        sfx.removeEventListener('ended', onEnded);
        finishDuck();
      }, BGM_DUCK_RESTORE_FALLBACK_MS);

      sfx.currentTime = 0;
      void sfx.play().catch((error) => {
        console.warn(`[audio] 音效播放失敗 (${type}):`, error);
        finishDuck();
      });
    },
    [enabled, loadFailed, clearDuckRestore, restoreBgmVolume],
  );

  const playIntroSting = useCallback(() => {
    if (!enabled) return;
    playIntroStingAudio();
  }, [enabled]);

  const value = useMemo(
    () => ({ enabled, unlocked, loadFailed, unlock, toggle, playSfx, playIntroSting }),
    [enabled, unlocked, loadFailed, unlock, toggle, playSfx, playIntroSting],
  );

  return <BgmContext.Provider value={value}>{children}</BgmContext.Provider>;
}

export function useBgm(): BgmContextValue {
  const ctx = useContext(BgmContext);
  if (!ctx) throw new Error('useBgm must be used within BgmProvider');
  return ctx;
}

/** 首次點擊或按鍵時解鎖 BGM 播放（符合瀏覽器 Autoplay Policy） */
export function BgmAutoplayUnlock() {
  const { unlock, unlocked } = useBgm();

  useEffect(() => {
    if (unlocked) return;

    const onInteract = () => unlock();

    window.addEventListener('pointerdown', onInteract, { once: true });
    window.addEventListener('keydown', onInteract, { once: true });

    return () => {
      window.removeEventListener('pointerdown', onInteract);
      window.removeEventListener('keydown', onInteract);
    };
  }, [unlock, unlocked]);

  return null;
}
