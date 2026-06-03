import React from 'react';

type RatCatchNetIndicatorProps = {
  /** 滑鼠懸停：框線發光／偏紅 */
  hovered?: boolean;
  /** 相鄰可抓捕：網子更醒目 */
  adjacent?: boolean;
};

/**
 * 懸浮在任務鼠上方的捕鼠網（SVG + CSS 動畫）
 */
export default function RatCatchNetIndicator({
  hovered = false,
  adjacent = false,
}: RatCatchNetIndicatorProps) {
  const meshStroke = hovered ? '#ef4444' : adjacent ? '#fbbf24' : '#94a3b8';
  const rimStroke = hovered ? '#fca5a5' : adjacent ? '#fde68a' : '#cbd5e1';

  return (
    <div
      className={`rat-catch-net pointer-events-none flex flex-col items-center
        ${hovered ? 'rat-catch-net--hovered' : ''}
        ${adjacent ? 'rat-catch-net--adjacent' : ''}`}
      aria-hidden
    >
      <svg
        width="28"
        height="32"
        viewBox="0 0 28 32"
        className="rat-catch-net-svg drop-shadow-md"
        role="presentation"
      >
        {/* 棍柄 */}
        <line
          x1="14"
          y1="2"
          x2="14"
          y2="11"
          stroke={hovered ? '#b45309' : '#78716c'}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="14" cy="2" r="2" fill={hovered ? '#f59e0b' : '#a8a29e'} />
        {/* 網圈外框 */}
        <ellipse
          cx="14"
          cy="21"
          rx="11"
          ry="9"
          fill="rgba(255,251,235,0.35)"
          stroke={rimStroke}
          strokeWidth="1.5"
          className="rat-catch-net-rim"
        />
        {/* 網格 */}
        <g className="rat-catch-net-mesh" stroke={meshStroke} strokeWidth="0.85" opacity="0.9">
          <ellipse cx="14" cy="21" rx="11" ry="9" fill="none" />
          <path d="M3 21 H25" />
          <path d="M14 12 V30" />
          <path d="M6 16 Q14 21 22 16" fill="none" />
          <path d="M6 26 Q14 21 22 26" fill="none" />
          <path d="M8 14 Q14 24 20 14" fill="none" />
          <path d="M8 28 Q14 18 20 28" fill="none" />
        </g>
      </svg>
      {adjacent && (
        <span
          className="mt-0.5 px-1.5 py-0.5 rounded-md bg-slate-900/90 border text-[8px] font-black
            whitespace-nowrap shadow-md
            border-amber-400/80 text-amber-100"
        >
          Enter
        </span>
      )}
    </div>
  );
}
