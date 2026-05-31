import React, { useCallback, useEffect } from 'react';
import { motion } from 'motion/react';
import EnemyRat from './EnemyRat';
import RpgDialogBox from './RpgDialogBox';

interface RatTauntDialogProps {
  message: string;
  onClose: () => void;
}

/** 學習期碰到老鼠時的嘲諷對話（依尚未互動的 NPC 給予暗示） */
export default function RatTauntDialog({ message, onClose }: RatTauntDialogProps) {
  const dismiss = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== ' ' && e.key !== 'Enter') return;
      e.preventDefault();
      e.stopPropagation();
      dismiss();
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [dismiss]);

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
        portrait={
          <div className="w-full h-full flex items-center justify-center scale-110">
            <EnemyRat color="#78716c" className="drop-shadow-lg" />
          </div>
        }
        onClick={dismiss}
        footer={
          <div className="flex justify-end">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                dismiss();
              }}
              className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-black text-xs sm:text-sm transition-colors"
            >
              我知道了 (Space)
            </button>
          </div>
        }
      >
        <p className="text-rose-100 text-sm sm:text-base leading-relaxed font-medium italic">
          {message}
        </p>
      </RpgDialogBox>
    </motion.div>
  );
}
