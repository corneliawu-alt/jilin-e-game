import React, { useEffect, useCallback, useState } from 'react';
import { NpcProfile } from '../constants/gameData';
import type { NpcDialogMode } from '../lib/npcFollowUpDialogue';
import {
  getNpcPortraitPath,
  getNpcPortraitFallback,
} from '../constants/characterAssets';
import RpgDialogBox from './RpgDialogBox';

interface NpcDialogProps {
  npc: NpcProfile;
  mode: NpcDialogMode;
  lines: string[];
  lineIndex: number;
  isClueMode: boolean;
  farewellMessage?: string;
  onNext: () => void;
  /** learningComplete=true 表示首次學習段落讀畢 */
  onClose: (learningComplete: boolean) => void;
  onChooseReview: () => void;
  onChooseLeave: () => void;
}

export default function NpcDialog({
  npc,
  mode,
  lines,
  lineIndex,
  isClueMode,
  farewellMessage = '',
  onNext,
  onClose,
  onChooseReview,
  onChooseLeave,
}: NpcDialogProps) {
  const [menuFocus, setMenuFocus] = useState<0 | 1>(0);

  const isOnLastIntroLine = lineIndex >= lines.length - 1;
  const effectiveMode: NpcDialogMode = isClueMode ? 'review' : mode;

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

  const advanceIntro = useCallback(() => {
    if (isOnLastIntroLine) {
      onClose(true);
    } else {
      onNext();
    }
  }, [isOnLastIntroLine, onClose, onNext]);

  const advanceReviewOrClue = useCallback(() => {
    onClose(false);
  }, [onClose]);

  const advanceFarewell = useCallback(() => {
    onClose(false);
  }, [onClose]);

  const confirmMenuChoice = useCallback(() => {
    if (menuFocus === 0) {
      onChooseReview();
    } else {
      onChooseLeave();
    }
  }, [menuFocus, onChooseReview, onChooseLeave]);

  useEffect(() => {
    setMenuFocus(0);
  }, [npc.id, effectiveMode]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (effectiveMode === 'menu') {
        const key = e.key.toLowerCase();

        if (key === 'a') {
          e.preventDefault();
          e.stopPropagation();
          onChooseReview();
          return;
        }
        if (key === 'b') {
          e.preventDefault();
          e.stopPropagation();
          onChooseLeave();
          return;
        }
        if (e.key === 'ArrowUp' || key === '1') {
          e.preventDefault();
          e.stopPropagation();
          setMenuFocus(0);
          return;
        }
        if (e.key === 'ArrowDown' || key === '2') {
          e.preventDefault();
          e.stopPropagation();
          setMenuFocus(1);
          return;
        }
        if (key === ' ' || key === 'enter') {
          e.preventDefault();
          e.stopPropagation();
          confirmMenuChoice();
        }
        return;
      }

      if (e.key !== ' ' && e.key !== 'Enter') return;
      e.preventDefault();
      e.stopPropagation();

      if (effectiveMode === 'intro') {
        advanceIntro();
      } else if (effectiveMode === 'review') {
        advanceReviewOrClue();
      } else if (effectiveMode === 'farewell') {
        advanceFarewell();
      }
    };

    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [
    effectiveMode,
    advanceIntro,
    advanceReviewOrClue,
    advanceFarewell,
    confirmMenuChoice,
    onChooseReview,
    onChooseLeave,
  ]);

  const speakerBadge = isClueMode ? (
    <span className="text-[10px] bg-rose-500/40 text-rose-100 px-2 py-0.5 rounded border border-rose-400/60 font-bold">
      線索提示
    </span>
  ) : effectiveMode === 'menu' ? (
    <span className="text-[10px] bg-violet-500/35 text-violet-100 px-2 py-0.5 rounded border border-violet-400/50 font-bold">
      請選擇
    </span>
  ) : effectiveMode === 'review' && !isClueMode ? (
    <span className="text-[10px] bg-amber-500/35 text-amber-100 px-2 py-0.5 rounded border border-amber-400/50 font-bold">
      重點複習
    </span>
  ) : effectiveMode === 'review' ? (
    <span className="text-[10px] bg-rose-500/40 text-rose-100 px-2 py-0.5 rounded border border-rose-400/60 font-bold">
      線索提示
    </span>
  ) : effectiveMode === 'farewell' ? (
    <span className="text-[10px] bg-emerald-500/35 text-emerald-100 px-2 py-0.5 rounded border border-emerald-400/50 font-bold">
      出發提示
    </span>
  ) : (
    <span className="text-[10px] bg-sky-500/30 text-sky-100 px-2 py-0.5 rounded border border-sky-400/50 font-bold tabular-nums">
      {lineIndex + 1} / {lines.length}
    </span>
  );

  if (effectiveMode === 'menu') {
    const optionClass = (focused: boolean) =>
      `w-full text-left px-3 py-2.5 rounded-lg border-2 font-bold text-sm transition-all
        ${
          focused
            ? 'border-amber-400 bg-amber-500/25 text-amber-50 shadow-[0_0_12px_rgba(251,191,36,0.35)]'
            : 'border-white/15 bg-black/30 text-white/85 hover:border-amber-500/40'
        }`;

    return (
      <RpgDialogBox
        speakerName={npc.name}
        speakerBadge={speakerBadge}
        portrait={portrait}
        footer={
          <p className="text-[10px] text-amber-200/70">
            按 <span className="text-amber-300 font-bold">A</span>／
            <span className="text-amber-300 font-bold">B</span> 直接選擇 • ↑↓ 切換 • 空白鍵確認
          </p>
        }
      >
        <p className="text-white text-sm sm:text-base leading-relaxed font-medium mb-3">
          又見面啦，特級稽查員！接下來你想怎麼做？
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            className={optionClass(menuFocus === 0)}
            onClick={onChooseReview}
            onMouseEnter={() => setMenuFocus(0)}
          >
            <span className="block text-[10px] text-amber-200/70 font-bold mb-0.5">按 A 鍵</span>
            A. 我想重點複習
          </button>
          <button
            type="button"
            className={optionClass(menuFocus === 1)}
            onClick={onChooseLeave}
            onMouseEnter={() => setMenuFocus(1)}
          >
            <span className="block text-[10px] text-amber-200/70 font-bold mb-0.5">按 B 鍵</span>
            B. 我接下來該做什麼？
          </button>
        </div>
      </RpgDialogBox>
    );
  }

  const bodyText =
    effectiveMode === 'review'
      ? isClueMode
        ? npc.clueDialogue
        : npc.summary
      : effectiveMode === 'farewell'
        ? farewellMessage
        : lines[lineIndex];

  const isLastLine =
    effectiveMode === 'review' ||
    effectiveMode === 'farewell' ||
    (effectiveMode === 'intro' && isOnLastIntroLine);

  const actionLabel =
    isClueMode || effectiveMode === 'review' || effectiveMode === 'farewell' || isOnLastIntroLine
      ? effectiveMode === 'farewell'
        ? '出發！'
        : '我知道了'
      : '繼續';

  const handleAdvance = () => {
    if (effectiveMode === 'intro') advanceIntro();
    else if (effectiveMode === 'review') advanceReviewOrClue();
    else if (effectiveMode === 'farewell') advanceFarewell();
  };

  return (
    <RpgDialogBox
      speakerName={npc.name}
      speakerBadge={speakerBadge}
      portrait={portrait}
      onClick={handleAdvance}
      footer={
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] text-amber-200/70 hidden sm:block">
            按空白鍵 (Space) 或點擊對話框繼續
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleAdvance();
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
        {bodyText}
      </p>
    </RpgDialogBox>
  );
}
