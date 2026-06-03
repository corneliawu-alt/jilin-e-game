import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award } from 'lucide-react';
import { QUEST_POINTS, TOTAL_QUESTS } from '../constants/gameData';
import type { RatType } from '../constants/ratAssets';
import RatSprite from './RatSprite';

interface QuestProgressBarProps {
  completedQuests: number;
  completedQuestIds: ReadonlySet<number>;
  lastCapturedQuestId: number | null;
  showBadgeBurst: boolean;
  currentScore?: number;
  className?: string;
}

function RatCollectionSlot({
  questId,
  ratType,
  captured,
  justCaptured,
}: {
  questId: number;
  ratType: RatType;
  captured: boolean;
  justCaptured: boolean;
}) {
  return (
    <motion.div
      title={captured ? `已捕獲老鼠 #${questId}` : `待捕獲 #${questId}`}
      className={`relative flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-lg border-2 shrink-0
        ${captured
          ? 'border-amber-500 bg-gradient-to-b from-amber-50 to-amber-100 shadow-[0_0_8px_rgba(251,191,36,0.55)]'
          : 'border-stone-400/80 bg-stone-200/90 opacity-50 grayscale'
        }
        ${justCaptured ? 'rat-slot-capture' : ''}`}
      animate={justCaptured ? { scale: [1, 1.3, 1.05, 1], rotate: [0, -8, 8, 0] } : {}}
      transition={{ duration: 0.55, ease: 'easeOut' }}
    >
      <RatSprite
        ratType={ratType}
        variant={captured ? 'normal' : 'muted'}
        direction="down"
        animateWalk={false}
        className={`!w-5 !h-5 sm:!w-6 sm:!h-6 pointer-events-none !ring-0 !animate-none
          ${captured ? 'drop-shadow-md' : ''}
          ${justCaptured ? '!animate-bounce' : ''}`}
      />
      {captured && (
        <span
          className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border border-white
            text-[7px] font-black text-white flex items-center justify-center shadow-sm"
          aria-hidden
        >
          ✓
        </span>
      )}
    </motion.div>
  );
}

/** 任務進度條 + 10 格老鼠收集槽 */
export default function QuestProgressBar({
  completedQuests,
  completedQuestIds,
  lastCapturedQuestId,
  showBadgeBurst,
  currentScore,
  className = '',
}: QuestProgressBarProps) {
  const progressPct = Math.min(100, Math.max(0, (completedQuests / TOTAL_QUESTS) * 100));

  return (
    <div className={`relative flex-1 min-w-[88px] ${className}`}>
      <div className="flex items-center justify-between gap-1 mb-0.5">
        <span className="text-[9px] font-black text-amber-950/90 tabular-nums whitespace-nowrap transition-all duration-300">
          防疫任務 {completedQuests}/{TOTAL_QUESTS}
        </span>
        {currentScore !== undefined && (
          <span
            className="text-[8px] font-bold text-emerald-800 tabular-nums transition-all duration-300
              px-1.5 py-0.5 rounded bg-emerald-100/90 border border-emerald-300/70"
            title="防疫積分"
          >
            防疫積分 {currentScore}
          </span>
        )}
      </div>

      <div className="relative h-2.5 sm:h-3 rounded-full border border-amber-800 bg-amber-900 overflow-hidden shadow-inner mb-1.5">
        <motion.div
          className="h-full rounded-full quest-progress-fill min-w-[2px]"
          initial={false}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-300 border border-amber-700 shadow-sm pointer-events-none transition-[left] duration-[650ms] ease-out"
          style={{ left: `clamp(2px, calc(${progressPct}% - 4px), calc(100% - 10px))` }}
          aria-hidden
        />
      </div>

      <div
        className="flex items-center justify-between gap-0.5 sm:gap-1 px-0.5"
        role="list"
        aria-label="老鼠收集槽"
      >
        {Array.from({ length: TOTAL_QUESTS }, (_, i) => {
          const questId = i + 1;
          const captured = completedQuestIds.has(questId);
          const justCaptured = lastCapturedQuestId === questId;
          const ratType =
            QUEST_POINTS.find((p) => p.questionId === questId)?.ratType ?? 1;
          return (
            <RatCollectionSlot
              key={questId}
              questId={questId}
              ratType={ratType}
              captured={captured}
              justCaptured={justCaptured}
            />
          );
        })}
      </div>

      <AnimatePresence>
        {showBadgeBurst && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: -20 }}
            exit={{ opacity: 0, scale: 0.5, y: -28 }}
            transition={{ duration: 0.4 }}
            className="absolute left-1/2 -translate-x-1/2 -top-2 z-[120] flex items-center gap-1
              bg-emerald-600 text-white px-2 py-0.5 rounded-full text-[9px] font-black shadow-md whitespace-nowrap"
          >
            <Award size={12} className="badge-pop shrink-0" />
            防鼠徽章 +1
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
