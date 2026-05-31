import React, { useEffect, useCallback } from 'react';
import { NpcProfile } from '../constants/gameData';
import {
  getNpcPortraitPath,
  getNpcPortraitFallback,
} from '../constants/characterAssets';
import RpgDialogBox from './RpgDialogBox';

interface NpcDialogProps {
  npc: NpcProfile;
  lines: string[];
  lineIndex: number;
  isClueMode: boolean;
  onNext: () => void;
  /** learningComplete=true 表示已讀完所有學習段落 */
  onClose: (learningComplete: boolean) => void;
}

export default function NpcDialog({
  npc,
  lines,
  lineIndex,
  isClueMode,
  onNext,
  onClose,
}: NpcDialogProps) {
  const isOnLastSegment = lineIndex >= lines.length - 1;
  const isLastLine = isClueMode || isOnLastSegment;
  const currentLine = isClueMode ? npc.clueDialogue : lines[lineIndex];

  const advance = useCallback(() => {
    if (isClueMode) {
      onClose(false);
    } else if (isOnLastSegment) {
      onClose(true);
    } else {
      onNext();
    }
  }, [isClueMode, isOnLastSegment, onClose, onNext]);

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

  const portrait = (
    <img
      src={getNpcPortraitPath(npc.id)}
      alt={npc.name}
      className="w-full h-full object-contain drop-shadow-md"
      referrerPolicy="no-referrer"
      onError={(e) => {
        (e.target as HTMLImageElement).src = getNpcPortraitFallback(npc.id);
      }}
    />
  );

  const actionLabel = isClueMode
    ? '我知道了'
    : isOnLastSegment
      ? '我知道了'
      : '繼續';

  return (
    <RpgDialogBox
      speakerName={npc.name}
      speakerBadge={
        isClueMode ? (
          <span className="text-[10px] bg-rose-500/40 text-rose-100 px-2 py-0.5 rounded border border-rose-400/60 font-bold">
            線索提示
          </span>
        ) : (
          <span className="text-[10px] bg-sky-500/30 text-sky-100 px-2 py-0.5 rounded border border-sky-400/50 font-bold tabular-nums">
            {lineIndex + 1} / {lines.length}
          </span>
        )
      }
      portrait={portrait}
      onClick={advance}
      footer={
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] text-amber-200/70 hidden sm:block">
            按空白鍵 (Space) 或點擊對話框繼續
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              advance();
            }}
            className={`ml-auto px-4 py-1.5 rounded-lg font-black text-xs sm:text-sm
              transition-all duration-200 shadow-md
              ${
                isLastLine
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-amber-500 hover:bg-amber-400 text-amber-950'
              }`}
          >
            {actionLabel} ▶
          </button>
        </div>
      }
    >
      <p className="text-white text-sm sm:text-base leading-relaxed font-medium whitespace-pre-wrap">
        {currentLine}
      </p>
    </RpgDialogBox>
  );
}
