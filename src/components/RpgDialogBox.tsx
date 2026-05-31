import React from 'react';
import { motion } from 'motion/react';

interface RpgDialogBoxProps {
  speakerName: string;
  speakerBadge?: React.ReactNode;
  portrait: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onClick?: () => void;
}

/** RPG Maker 風格底部對話框外框 */
export default function RpgDialogBox({
  speakerName,
  speakerBadge,
  portrait,
  children,
  footer,
  onClick,
}: RpgDialogBoxProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.2 }}
      className="fixed bottom-0 left-0 right-0 z-[110] px-2 pb-2 sm:px-4 sm:pb-3 pointer-events-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rpg-dialog-speaker"
    >
      <div className="max-w-4xl mx-auto pointer-events-auto">
        <div
          role={onClick ? 'button' : undefined}
          tabIndex={onClick ? 0 : undefined}
          onClick={onClick}
          onKeyDown={
            onClick
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick();
                  }
                }
              : undefined
          }
          className={`rounded-xl border-2 border-amber-400/90 shadow-[0_0_24px_rgba(251,191,36,0.25)]
            bg-black/80 backdrop-blur-md ring-1 ring-white/20
            ${onClick ? 'cursor-pointer select-none hover:border-amber-300 transition-colors' : ''}`}
        >
          <div className="flex gap-3 sm:gap-4 p-3 sm:p-4">
            <div
              className="shrink-0 w-[72px] h-[72px] sm:w-20 sm:h-20 rounded-lg
                border-2 border-amber-300/80 bg-black/60 overflow-hidden
                shadow-[inset_0_0_12px_rgba(255,255,255,0.08)] flex items-center justify-center"
            >
              {portrait}
            </div>

            <div className="flex-1 min-w-0 flex flex-col">
              <div className="flex flex-wrap items-center gap-2 mb-1.5 border-b border-white/15 pb-1.5">
                <h3
                  id="rpg-dialog-speaker"
                  className="text-amber-300 font-black text-sm sm:text-base tracking-wide"
                >
                  {speakerName}
                </h3>
                {speakerBadge}
              </div>
              {children}
            </div>
          </div>

          {footer && (
            <div className="border-t border-amber-500/30 px-3 py-2 sm:px-4 bg-black/40 rounded-b-[10px]">
              {footer}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function RpgContinueHint({ className = '', showClick = false }: { className?: string; showClick?: boolean }) {
  return (
    <p
      className={`text-center text-xs sm:text-sm text-amber-200/90 font-medium animate-pulse ${className}`}
    >
      {showClick ? (
        <>
          按{' '}
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/30 text-white font-bold">
            空白鍵
          </kbd>{' '}
          或點擊對話框繼續
        </>
      ) : (
        <>
          按{' '}
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/30 text-white font-bold">
            空白鍵
          </kbd>{' '}
          (Space) 繼續
        </>
      )}
    </p>
  );
}

export const QUIZ_OPTION_KEYS = ['a', 'b', 'c', 'd'] as const;

export function optionKeyToIndex(key: string): number | null {
  const idx = QUIZ_OPTION_KEYS.indexOf(key.toLowerCase() as (typeof QUIZ_OPTION_KEYS)[number]);
  return idx >= 0 ? idx : null;
}
