import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'motion/react';
import { QuestQuestion } from '../constants/gameData';
import RpgDialogBox, { optionKeyToIndex, QUIZ_OPTION_KEYS } from './RpgDialogBox';
const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;

export type QuestAnswerOutcome =
  | { kind: 'correct' }
  | { kind: 'retry'; message: string }
  | { kind: 'locked'; message: string };

interface QuestQuizDialogProps {
  question: QuestQuestion;
  questNumber: number;
  portraitSrc: string;
  portraitFallback?: string;
  portraitAlt: string;
  onAnswer: (selectedIndex: number) => QuestAnswerOutcome;
  onCompleteCorrect: () => void;
  onDismissLocked: () => void;
}

export default function QuestQuizDialog({
  question,
  questNumber,
  portraitSrc,
  portraitFallback,
  portraitAlt,
  onAnswer,
  onCompleteCorrect,
  onDismissLocked,
}: QuestQuizDialogProps) {
  const [phase, setPhase] = useState<'choose' | 'feedback'>('choose');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [outcome, setOutcome] = useState<QuestAnswerOutcome | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [hoverOption, setHoverOption] = useState<number | null>(null);

  const resetToChoose = useCallback(() => {
    setPhase('choose');
    setSelectedOption(null);
    setOutcome(null);
    setFeedbackText('');
    setHoverOption(null);
  }, []);

  const handleOptionSelect = useCallback(
    (index: number) => {
      if (phase !== 'choose') return;
      const result = onAnswer(index);
      setSelectedOption(index);
      setOutcome(result);
      setFeedbackText(
        result.kind === 'correct' ? question.successMsg : result.message,
      );
      setPhase('feedback');
    },
    [phase, onAnswer, question.successMsg],
  );

  const handleContinue = useCallback(() => {
    if (phase !== 'feedback' || !outcome) return;
    if (outcome.kind === 'correct') {
      onCompleteCorrect();
    } else if (outcome.kind === 'retry') {
      resetToChoose();
    } else {
      onDismissLocked();
    }
  }, [phase, outcome, onCompleteCorrect, resetToChoose, onDismissLocked]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (phase === 'choose') {
        const idx = optionKeyToIndex(key);
        if (idx === null || idx >= question.options.length) return;
        e.preventDefault();
        e.stopPropagation();
        handleOptionSelect(idx);
        return;
      }

      if (phase === 'feedback' && (key === ' ' || key === 'enter')) {
        e.preventDefault();
        e.stopPropagation();
        handleContinue();
      }
    };

    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [phase, question.options.length, handleOptionSelect, handleContinue]);

  const portrait = (
    <img
      src={portraitSrc}
      alt={portraitAlt}
      className="w-full h-full object-contain drop-shadow-md"
      referrerPolicy="no-referrer"
      onError={(e) => {
        if (portraitFallback) {
          (e.target as HTMLImageElement).src = portraitFallback;
        }
      }}
    />
  );

  const isCorrectFeedback = outcome?.kind === 'correct';
  const showOptionReview =
    phase === 'feedback' && selectedOption !== null && outcome?.kind !== 'retry';

  return (
    <RpgDialogBox
      speakerName={`防疫任務 · 第 ${questNumber} 項檢驗`}
      speakerBadge={
        <span className="text-[10px] bg-amber-500/30 text-amber-100 px-2 py-0.5 rounded border border-amber-400/50 font-bold">
          衛教問答
        </span>
      }
      portrait={portrait}
      footer={
        phase === 'feedback' ? (
          <div className="flex justify-end">
            {isCorrectFeedback ? (
              <button
                type="button"
                onClick={handleContinue}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white
                  font-black text-xs sm:text-sm transition-colors duration-200 shadow-md"
              >
                繼續 ▶
              </button>
            ) : outcome?.kind === 'retry' ? (
              <button
                type="button"
                onClick={handleContinue}
                className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white
                  font-black text-xs sm:text-sm transition-all duration-200 shadow-md"
              >
                再試一次 ▶
              </button>
            ) : (
              <button
                type="button"
                onClick={handleContinue}
                className="px-4 py-1.5 rounded-lg bg-slate-600 hover:bg-slate-500 text-white
                  font-black text-xs sm:text-sm transition-all duration-200 shadow-md"
              >
                離開 ▶
              </button>
            )}
          </div>
        ) : undefined
      }
    >
      <p
        className={`text-sm sm:text-base leading-relaxed font-medium mb-3 min-h-[2.5rem] transition-colors duration-300
          ${phase === 'feedback' && !isCorrectFeedback ? 'text-rose-100' : 'text-white'}`}
      >
        {phase === 'choose' ? question.question : feedbackText}
      </p>

      <AnimatePresence mode="wait">
        {phase === 'choose' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" key="options">
            {question.options.map((option, idx) => {
              const label = OPTION_LABELS[idx];
              const keyHint = QUIZ_OPTION_KEYS[idx].toUpperCase();
              const highlighted = hoverOption === idx;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleOptionSelect(idx)}
                  onMouseEnter={() => setHoverOption(idx)}
                  onMouseLeave={() => setHoverOption(null)}
                  className={`text-left flex items-start gap-2 p-2.5 rounded-lg border-2 transition-all duration-200 cursor-pointer
                    ${
                      highlighted
                        ? 'border-amber-300 bg-amber-500/25 shadow-[0_0_12px_rgba(251,191,36,0.35)]'
                        : 'border-white/25 bg-white/5 hover:border-amber-400/70 hover:bg-white/10'
                    }`}
                >
                  <span
                    className="shrink-0 w-7 h-7 flex items-center justify-center rounded
                      bg-amber-500/40 border border-amber-300/80 text-amber-100 font-black text-xs"
                  >
                    ({label})
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[10px] text-amber-200/70 font-bold mb-0.5">
                      按 {keyHint} 鍵
                    </span>
                    <span className="text-white text-xs sm:text-sm leading-snug">{option}</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {showOptionReview && (
          <div key="result" className="flex flex-wrap gap-2">
            {question.options.map((option, idx) => {
              const label = OPTION_LABELS[idx];
              const isAnswer = idx === question.correctAnswer;
              const wasPicked = idx === selectedOption;

              let boxClass = 'border-white/20 bg-white/5 text-white/50';
              if (isAnswer) boxClass = 'border-emerald-400 bg-emerald-500/20 text-emerald-100';
              else if (wasPicked) boxClass = 'border-rose-400 bg-rose-500/20 text-rose-100';

              return (
                <div
                  key={idx}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs sm:text-sm transition-colors duration-300 ${boxClass}`}
                >
                  <span className="font-black">({label})</span>
                  <span className="truncate max-w-[200px] sm:max-w-none">{option}</span>
                  {isAnswer && <span className="text-emerald-300 font-bold">✓</span>}
                  {wasPicked && !isAnswer && <span className="text-rose-300 font-bold">✗</span>}
                </div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </RpgDialogBox>
  );
}
