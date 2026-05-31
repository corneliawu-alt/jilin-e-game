import React from 'react';
import { useBgm } from '../contexts/BgmContext';

interface BgmToggleButtonProps {
  className?: string;
}

export default function BgmToggleButton({ className = '' }: BgmToggleButtonProps) {
  const { enabled, loadFailed, toggle } = useBgm();

  const title = loadFailed
    ? '背景音樂檔案不可用'
    : enabled
      ? '關閉背景音樂'
      : '開啟背景音樂';

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loadFailed}
      title={title}
      aria-label={title}
      className={`inline-flex items-center justify-center w-7 h-7 rounded-md
        border text-sm leading-none transition-colors
        ${
          loadFailed
            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-70'
            : enabled
              ? 'bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100 hover:border-orange-300 active:scale-95'
              : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200 hover:border-slate-300 active:scale-95'
        }
        ${className}`}
    >
      {loadFailed ? '🔇' : enabled ? '🔊' : '🔇'}
    </button>
  );
}
