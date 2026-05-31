import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import EnemyRat from './EnemyRat';
import RpgDialogBox from './RpgDialogBox';

const TAUNT_LINES = [
  '吱吱！你這個菜鳥稽查員，根本不知道怎麼對付我！',
  '快去把鎮上的 3 位防疫專家找齊再來挑戰我吧！吱吱！',
];

interface RatTauntDialogProps {
  onClose: () => void;
}

/** 學習期碰到老鼠時的嘲諷對話 */
export default function RatTauntDialog({ onClose }: RatTauntDialogProps) {
  const [lineIndex, setLineIndex] = useState(0);
  const isLast = lineIndex >= TAUNT_LINES.length - 1;

  const advance = useCallback(() => {
    if (isLast) onClose();
    else setLineIndex((i) => i + 1);
  }, [isLast, onClose]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== ' ' && e.key !== 'Enter') return;
      e.preventDefault();
      e.stopPropagation();
      advance();
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [advance]);

  return (
    <motion.div
      key="rat-taunt-root"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] pointer-events-none"
    >
    <RpgDialogBox
      speakerName="變異老鼠"
      speakerBadge={
        <span className="text-[10px] bg-rose-600/50 text-rose-100 px-2 py-0.5 rounded border border-rose-400/70 font-bold tabular-nums">
          {lineIndex + 1} / {TAUNT_LINES.length}
        </span>
      }
      portrait={
        <div className="w-full h-full flex items-center justify-center scale-110">
          <EnemyRat color="#78716c" className="drop-shadow-lg" />
        </div>
      }
      onClick={advance}
      footer={
        <div className="flex justify-end">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              advance();
            }}
            className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-black text-xs sm:text-sm transition-colors"
          >
            {isLast ? '我知道了 ▶' : '繼續 ▶'}
          </button>
        </div>
      }
    >
      <p className="text-rose-100 text-sm sm:text-base leading-relaxed font-medium italic">
        {TAUNT_LINES[lineIndex]}
      </p>
    </RpgDialogBox>
    </motion.div>
  );
}
