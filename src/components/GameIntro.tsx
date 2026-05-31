import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useBgm } from '../contexts/BgmContext';
import {
  formatPlayerNameTag,
  getPlayerCharacter,
  getPlayerPortraitFallback,
  getPlayerPortraitPath,
  type PlayerCharacterId,
} from '../constants/characterAssets';
import { GAME_TITLE } from '../constants/gameData';

const INTRO_LINES = [
  '曾經以美食聞名的吉林小鎮，近期爆發了不明的發燒與出血疫情...',
  '傳聞是廚房與下水道的變異老鼠帶來了可怕的「漢他病毒」。',
  '身為特級衛生稽查員，你的任務是找出隱藏在鎮上的 10 隻變異老鼠！',
  '記住！在抓老鼠前，請先尋找【餐廳大廚】、【鎮守醫師】與【清潔隊長】學習防疫知識！',
] as const;

const CHAR_MS = 38;

function TypewriterLine({
  text,
  onComplete,
}: {
  text: string;
  onComplete: () => void;
}) {
  const [visible, setVisible] = useState('');

  useEffect(() => {
    setVisible('');
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setVisible(text.slice(0, index));
      if (index >= text.length) {
        window.clearInterval(timer);
        onComplete();
      }
    }, CHAR_MS);

    return () => window.clearInterval(timer);
  }, [text, onComplete]);

  return (
    <motion.p
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="text-sm sm:text-base leading-relaxed text-slate-100/95 font-medium"
    >
      {visible}
      {visible.length < text.length && (
        <span className="inline-block w-[2px] h-[1em] ml-0.5 bg-amber-400/90 align-[-2px] animate-pulse" />
      )}
    </motion.p>
  );
}

interface GameIntroProps {
  characterId: PlayerCharacterId;
  playerName: string;
  onContinue: () => void;
}

export default function GameIntro({ characterId, playerName, onContinue }: GameIntroProps) {
  const { playIntroSting } = useBgm();
  const [lineIndex, setLineIndex] = useState(0);
  const character = getPlayerCharacter(characterId);
  const nameTag = formatPlayerNameTag(playerName, characterId);

  useEffect(() => {
    playIntroSting();
  }, [playIntroSting]);

  const handleLineComplete = useCallback(() => {
    setLineIndex((prev) => Math.min(prev + 1, INTRO_LINES.length));
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== ' ' && e.key !== 'Enter') return;
      e.preventDefault();
      e.stopPropagation();
      onContinue();
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [onContinue]);

  return (
    <button
      type="button"
      onClick={onContinue}
      className="relative flex flex-col w-full h-full min-h-[min(92vh,820px)] overflow-hidden
        bg-slate-950 text-left cursor-pointer select-none focus:outline-none"
      aria-label="開始任務，進入地圖"
    >
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(127,29,29,0.22)_0%,rgba(2,6,23,0.96)_55%,#020617_100%)]"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-30 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[24px_24px]"
        aria-hidden
      />

      <div className="relative z-10 flex flex-col flex-1 px-6 sm:px-10 py-8 sm:py-10">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <p className="text-[10px] sm:text-xs font-bold tracking-[0.35em] text-rose-400/80 uppercase mb-2">
              Mission Briefing
            </p>
            <h1 className="text-xl sm:text-2xl font-black text-amber-50 leading-tight">
              {GAME_TITLE}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">任務簡報 · 漢他病毒防衛戰</p>
          </div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 18 }}
            className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl
              bg-rose-950/60 border border-rose-500/40 flex items-center justify-center
              text-3xl sm:text-4xl shadow-[0_0_24px_rgba(244,63,94,0.25)]"
            aria-hidden
          >
            ⚠️
          </motion.div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
          <div className="flex-1 space-y-4 sm:space-y-5 max-w-2xl">
            {INTRO_LINES.map((line, idx) => {
              if (idx < lineIndex) {
                return (
                  <motion.p
                    key={line}
                    initial={{ opacity: 0.6 }}
                    animate={{ opacity: 1 }}
                    className="text-sm sm:text-base leading-relaxed text-slate-100/95 font-medium"
                  >
                    {line}
                  </motion.p>
                );
              }
              if (idx === lineIndex && lineIndex < INTRO_LINES.length) {
                return (
                  <TypewriterLine
                    key={line}
                    text={line}
                    onComplete={handleLineComplete}
                  />
                );
              }
              return null;
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="shrink-0 flex flex-col items-center lg:items-end justify-center lg:justify-start lg:pt-2"
          >
            <div
              className="relative w-36 h-44 sm:w-44 sm:h-52 rounded-2xl overflow-hidden
                border-2 border-amber-500/30 bg-slate-900/80 shadow-2xl shadow-black/40"
            >
              <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-transparent z-10" />
              <img
                src={getPlayerPortraitPath(characterId)}
                alt={character.name}
                className="w-full h-full object-contain object-bottom p-2 drop-shadow-lg"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getPlayerPortraitFallback(characterId);
                }}
              />
            </div>
            <p className="mt-3 text-sm font-black text-amber-100">{nameTag}</p>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-1">
              <span className="text-base" aria-hidden>🛡️</span>
              {character.name} · 待命中
            </p>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-6 right-6 sm:bottom-8 sm:right-10
            text-xs sm:text-sm font-bold text-amber-300/90 tracking-wide pointer-events-none"
        >
          按 空白鍵 (Space) 或點擊此處開始任務 ▶
        </motion.p>
      </div>
    </button>
  );
}
