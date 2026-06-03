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
  BOMP_DUCK_HOLD_MS,
  BOMP_FADE_RESTORE_MS,
  BOMP_GAIN,
  BGM_FADE_OUT_MS,
  createBattleBgmAudio,
  createBgmAudio,
  createBompAudio,
  createSfxAudio,
  createWinAudio,
  DEFAULT_BATTLE_BGM_VOLUME,
  routeAudioThroughGain,
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
  /** 完成 3 位 NPC 解鎖打怪：播放 bomp 並閃避／漸強還原 BGM */
  playRatUnlockBomp: () => void;
  /** 結局：BGM 淡出後播放 win.mp3 */
  beginVictoryMusic: () => void;
  stopVictoryMusic: () => void;
  /** 觸發任務答題：僅切換 battle BGM（bomp 僅在 playRatUnlockBomp） */
  onQuestDialogOpened: () => void;
  /** 關閉任務答題：停止 battle、恢復小鎮 BGM */
  onQuestDialogClosed: () => void;
};

const BgmContext = createContext<BgmContextValue | null>(null);

export function BgmProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const battleBgmRef = useRef<HTMLAudioElement | null>(null);
  const questBattleActiveRef = useRef(false);
  const questBompFallbackTimerRef = useRef<number | null>(null);
  const questBompEndedHandlerRef = useRef<(() => void) | null>(null);
  const successSfxRef = useRef<HTMLAudioElement | null>(null);
  const failSfxRef = useRef<HTMLAudioElement | null>(null);
  const laughSfxRef = useRef<HTMLAudioElement | null>(null);
  const bompSfxRef = useRef<HTMLAudioElement | null>(null);
  const bompAudioCtxRef = useRef<AudioContext | null>(null);
  const bompGainRef = useRef<GainNode | null>(null);
  const winAudioRef = useRef<HTMLAudioElement | null>(null);
  const victoryMusicStartedRef = useRef(false);
  const duckRestoreTimerRef = useRef<number | null>(null);
  const duckCleanupRef = useRef<(() => void) | null>(null);
  const bgmFadeFrameRef = useRef<number | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  const cancelBgmFade = useCallback(() => {
    if (bgmFadeFrameRef.current !== null) {
      cancelAnimationFrame(bgmFadeFrameRef.current);
      bgmFadeFrameRef.current = null;
    }
  }, []);

  const clearQuestBompHandlers = useCallback(() => {
    if (questBompFallbackTimerRef.current !== null) {
      window.clearTimeout(questBompFallbackTimerRef.current);
      questBompFallbackTimerRef.current = null;
    }
    const bomp = bompSfxRef.current;
    const onEnded = questBompEndedHandlerRef.current;
    if (bomp && onEnded) {
      bomp.removeEventListener('ended', onEnded);
    }
    questBompEndedHandlerRef.current = null;
  }, []);

  const clearDuckRestore = useCallback(() => {
    if (duckRestoreTimerRef.current !== null) {
      window.clearTimeout(duckRestoreTimerRef.current);
      duckRestoreTimerRef.current = null;
    }
    duckCleanupRef.current?.();
    duckCleanupRef.current = null;
    cancelBgmFade();
  }, [cancelBgmFade]);

  const fadeBgmVolumeTo = useCallback(
    (targetVolume: number, durationMs: number) => {
      const bgm = audioRef.current;
      if (!bgm || loadFailed) return;

      cancelBgmFade();
      const startVolume = bgm.volume;
      const startedAt = performance.now();

      const step = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / durationMs);
        bgm.volume = startVolume + (targetVolume - startVolume) * progress;
        if (progress < 1) {
          bgmFadeFrameRef.current = requestAnimationFrame(step);
        } else {
          bgmFadeFrameRef.current = null;
        }
      };

      bgmFadeFrameRef.current = requestAnimationFrame(step);
    },
    [loadFailed, cancelBgmFade],
  );

  const restoreBgmVolume = useCallback(() => {
    const bgm = audioRef.current;
    if (!bgm || loadFailed) return;
    bgm.volume = DEFAULT_BGM_VOLUME;
  }, [loadFailed]);

  useEffect(() => {
    const bgm = createBgmAudio();
    audioRef.current = bgm;
    const detachBgm = attachBgmErrorHandler(bgm, () => setLoadFailed(true));

    const battleBgm = createBattleBgmAudio();
    battleBgmRef.current = battleBgm;
    const onBattleError = () =>
      console.warn('[audio] 戰鬥 BGM 載入失敗：/music/battle.mp3');
    battleBgm.addEventListener('error', onBattleError);

    const successSfx = createSfxAudio('success');
    const failSfx = createSfxAudio('fail');
    const laughSfx = createSfxAudio('laugh');
    const bompSfx = createBompAudio();
    successSfxRef.current = successSfx;
    failSfxRef.current = failSfx;
    laughSfxRef.current = laughSfx;
    bompSfxRef.current = bompSfx;
    const detachSuccess = attachSfxErrorHandler(successSfx, 'success', () => {});
    const detachFail = attachSfxErrorHandler(failSfx, 'fail', () => {});
    const detachLaugh = attachSfxErrorHandler(laughSfx, 'laugh', () => {});
    const onBompError = () => console.warn('[audio] 音效載入失敗：/music/bomp.mp3');
    bompSfx.addEventListener('error', onBompError);
    const detachBomp = () => bompSfx.removeEventListener('error', onBompError);

    const routed = routeAudioThroughGain(bompSfx, BOMP_GAIN);
    if (routed) {
      bompAudioCtxRef.current = routed.context;
      bompGainRef.current = routed.gain;
    }

    const winAudio = createWinAudio();
    winAudioRef.current = winAudio;
    const onWinError = () => console.warn('[audio] 勝利配樂載入失敗：/music/win.mp3');
    winAudio.addEventListener('error', onWinError);

    return () => {
      clearQuestBompHandlers();
      clearDuckRestore();
      detachBgm();
      battleBgm.removeEventListener('error', onBattleError);
      battleBgm.pause();
      battleBgm.src = '';
      battleBgmRef.current = null;
      questBattleActiveRef.current = false;
      detachSuccess();
      detachFail();
      detachLaugh();
      laughSfx.src = '';
      detachBomp();
      winAudio.removeEventListener('error', onWinError);
      winAudio.pause();
      winAudio.src = '';
      void bompAudioCtxRef.current?.close();
      bgm.pause();
      bgm.src = '';
      successSfx.src = '';
      failSfx.src = '';
      bompSfx.src = '';
      audioRef.current = null;
      successSfxRef.current = null;
      failSfxRef.current = null;
      laughSfxRef.current = null;
      bompSfxRef.current = null;
      bompAudioCtxRef.current = null;
      bompGainRef.current = null;
      winAudioRef.current = null;
      victoryMusicStartedRef.current = false;
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

  const enterQuestBattleBgm = useCallback(() => {
    if (questBattleActiveRef.current) return;
    questBattleActiveRef.current = true;
    clearDuckRestore();

    const bgm = audioRef.current;
    const battle = battleBgmRef.current;
    if (bgm && !loadFailed) {
      bgm.pause();
    }
    if (!enabled || !battle) return;

    battle.volume = DEFAULT_BATTLE_BGM_VOLUME;
    battle.currentTime = 0;
    void battle.play().catch((error) => {
      console.warn('[audio] 戰鬥 BGM 播放失敗：', error);
    });
  }, [enabled, loadFailed, clearDuckRestore]);

  const exitQuestBattleBgm = useCallback(() => {
    if (!questBattleActiveRef.current) return;
    questBattleActiveRef.current = false;

    const battle = battleBgmRef.current;
    if (battle) {
      battle.pause();
      battle.currentTime = 0;
    }

    if (!enabled || !unlocked || loadFailed || victoryMusicStartedRef.current) {
      return;
    }

    const bgm = audioRef.current;
    if (!bgm) return;
    bgm.volume = DEFAULT_BGM_VOLUME;
    void safePlayBgm(bgm);
  }, [enabled, unlocked, loadFailed]);

  const onQuestDialogOpened = useCallback(() => {
    clearQuestBompHandlers();
    clearDuckRestore();
    enterQuestBattleBgm();
  }, [clearQuestBompHandlers, clearDuckRestore, enterQuestBattleBgm]);

  const onQuestDialogClosed = useCallback(() => {
    clearQuestBompHandlers();
    exitQuestBattleBgm();
  }, [clearQuestBompHandlers, exitQuestBattleBgm]);

  useEffect(() => {
    if (!unlocked) return;
    const bgm = audioRef.current;
    if (!bgm || loadFailed) return;

    if (enabled) {
      if (!questBattleActiveRef.current && !victoryMusicStartedRef.current) {
        bgm.volume = DEFAULT_BGM_VOLUME;
        void safePlayBgm(bgm);
      }
    } else {
      clearDuckRestore();
      clearQuestBompHandlers();
      bgm.pause();
      battleBgmRef.current?.pause();
      questBattleActiveRef.current = false;
    }
  }, [enabled, unlocked, loadFailed, clearDuckRestore, clearQuestBompHandlers]);

  const playSfx = useCallback(
    (type: SfxType) => {
      if (!enabled) return;

      const sfx =
        type === 'success'
          ? successSfxRef.current
          : type === 'fail'
            ? failSfxRef.current
            : laughSfxRef.current;
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

  const beginVictoryMusic = useCallback(() => {
    if (victoryMusicStartedRef.current) return;
    victoryMusicStartedRef.current = true;
    clearQuestBompHandlers();
    clearDuckRestore();
    questBattleActiveRef.current = false;
    battleBgmRef.current?.pause();

    const bgm = audioRef.current;
    const win = winAudioRef.current;

    if (bgm && !loadFailed && !bgm.paused) {
      fadeBgmVolumeTo(0, BGM_FADE_OUT_MS);
      window.setTimeout(() => {
        bgm.pause();
        if (!enabled || !win) return;
        win.currentTime = 0;
        void win.play().catch((e) => console.warn('[audio] win 播放失敗：', e));
      }, BGM_FADE_OUT_MS);
    } else if (enabled && win) {
      win.currentTime = 0;
      void win.play().catch((e) => console.warn('[audio] win 播放失敗：', e));
    }
  }, [enabled, loadFailed, clearDuckRestore, fadeBgmVolumeTo]);

  const stopVictoryMusic = useCallback(() => {
    const win = winAudioRef.current;
    if (win) {
      win.pause();
      win.currentTime = 0;
    }
    victoryMusicStartedRef.current = false;
  }, []);

  const playRatUnlockBomp = useCallback(() => {
    if (!enabled) return;

    const bomp = bompSfxRef.current;
    if (!bomp) return;

    clearDuckRestore();

    const bgm = audioRef.current;
    const shouldDuck = Boolean(bgm && !loadFailed && !bgm.paused);

    if (shouldDuck && bgm) {
      bgm.volume = getDuckedBgmVolume(DEFAULT_BGM_VOLUME);
    }

    const bompCtx = bompAudioCtxRef.current;
    const bompGain = bompGainRef.current;
    if (bompGain) bompGain.gain.value = BOMP_GAIN;
    if (bompCtx && bompCtx.state === 'suspended') {
      void bompCtx.resume();
    }

    bomp.currentTime = 0;
    void bomp.play().catch((error) => {
      console.warn('[audio] bomp 播放失敗：', error);
      if (shouldDuck && enabled) restoreBgmVolume();
    });

    duckRestoreTimerRef.current = window.setTimeout(() => {
      duckRestoreTimerRef.current = null;
      if (!enabled) return;
      if (shouldDuck && bgm && !loadFailed) {
        fadeBgmVolumeTo(DEFAULT_BGM_VOLUME, BOMP_FADE_RESTORE_MS);
      } else {
        restoreBgmVolume();
      }
    }, BOMP_DUCK_HOLD_MS);
  }, [
    enabled,
    loadFailed,
    clearDuckRestore,
    restoreBgmVolume,
    fadeBgmVolumeTo,
  ]);

  const value = useMemo(
    () => ({
      enabled,
      unlocked,
      loadFailed,
      unlock,
      toggle,
      playSfx,
      playIntroSting,
      playRatUnlockBomp,
      beginVictoryMusic,
      stopVictoryMusic,
      onQuestDialogOpened,
      onQuestDialogClosed,
    }),
    [
      enabled,
      unlocked,
      loadFailed,
      unlock,
      toggle,
      playSfx,
      playIntroSting,
      playRatUnlockBomp,
      beginVictoryMusic,
      stopVictoryMusic,
      onQuestDialogOpened,
      onQuestDialogClosed,
    ],
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
