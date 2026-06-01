import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NPCS, type TargetNPC } from '../constants/gameData';
import {
  getNpcPortraitPath,
  getNpcPortraitFallback,
} from '../constants/characterAssets';
import { Crown } from 'lucide-react';

const VICTORY_SCRIPT: { npcId: TargetNPC; text: string }[] = [
  {
    npcId: 'Chef',
    text:
      '太厲害了！廚房的每一個死角都變得乾乾淨淨，一隻老鼠都不剩啦！今晚我要為你辦一場盛大的滿漢全席慶功宴！',
  },
  {
    npcId: 'Doctor',
    text:
      '吉林小鎮的危機解除了！你熟練的漢他病毒防疫知識，成功阻止了疫情的傳播。身為鎮守醫師，我為你感到驕傲！',
  },
  {
    npcId: 'Captain',
    text:
      '防護裝備穿得標準，漂白水比例也調得完美！你是我見過最優秀的菜鳥...不，是最優秀的「特級衛生稽查員」！',
  },
];

interface VictoryCutsceneProps {
  onComplete: () => void;
}

export default function VictoryCutscene({ onComplete }: VictoryCutsceneProps) {
  const [lineIndex, setLineIndex] = useState(0);
  const line = VICTORY_SCRIPT[lineIndex];
  const npc = NPCS.find((n) => n.id === line.npcId)!;
  const isLast = lineIndex >= VICTORY_SCRIPT.length - 1;

  const advance = useCallback(() => {
    if (isLast) {
      onComplete();
    } else {
      setLineIndex((i) => i + 1);
    }
  }, [isLast, onComplete]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        advance();
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [advance]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[280] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="大結局加冕劇碼"
    >
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.15)_0%,rgba(2,6,23,0.92)_70%)]"
        aria-hidden
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={line.npcId}
          initial={{ opacity: 0, y: 28, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          className="relative max-w-lg w-full rounded-2xl border-2 border-amber-400/90
            bg-linear-to-b from-amber-950/95 via-slate-900/95 to-slate-950
            shadow-[0_0_60px_rgba(251,191,36,0.35)] p-6 sm:p-8 text-center"
        >
          <div className="flex justify-center mb-3">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-widest text-amber-300 uppercase">
              <Crown size={14} className="text-amber-400" />
              榮譽加冕 · {lineIndex + 1} / {VICTORY_SCRIPT.length}
            </span>
          </div>

          <div className="mx-auto mb-4 w-24 h-28 rounded-xl border-2 border-amber-500/50 bg-black/50 overflow-hidden shadow-lg">
            <img
              src={getNpcPortraitPath(npc.id)}
              alt={npc.name}
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = getNpcPortraitFallback(npc.id);
              }}
            />
          </div>

          <h3 className="text-lg font-black text-amber-200 mb-3">{npc.name}</h3>
          <p className="text-sm sm:text-base text-white/95 leading-relaxed font-medium min-h-[4.5rem]">
            {line.text}
          </p>

          <button
            type="button"
            onClick={advance}
            className="mt-6 w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-black text-sm
              shadow-lg transition-colors animate-pulse"
          >
            {isLast ? '頒發榮譽獎狀 ▶' : '下一句（空白鍵）'}
          </button>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
