import React from 'react';

interface EnemyRatProps {
  color?: string;
  className?: string;
}

export default function EnemyRat({ color = '#71717a', className = '' }: EnemyRatProps) {
  return (
    <div className={`relative w-10 h-10 ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full animate-[bounce_2s_infinite]"
        style={{ filter: 'drop-shadow(0px 4px 2px rgba(0,0,0,0.4))' }}
        aria-hidden
      >
        <path
          d="M 80 80 Q 110 90, 95 60"
          fill="none"
          stroke="#f472b6"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="30" cy="35" r="15" fill={color} />
        <circle cx="30" cy="35" r="8" fill="#fbcfe8" />
        <circle cx="70" cy="35" r="15" fill={color} />
        <circle cx="70" cy="35" r="8" fill="#fbcfe8" />
        <ellipse cx="50" cy="65" rx="35" ry="30" fill={color} />
        <circle cx="38" cy="55" r="6" fill="white" />
        <circle cx="62" cy="55" r="6" fill="white" />
        <circle cx="38" cy="53" r="2" fill="black" />
        <circle cx="62" cy="53" r="2" fill="black" />
        <circle cx="50" cy="65" r="4" fill="#f472b6" />
        <path d="M 20 60 L 40 65" fill="none" stroke="black" strokeWidth="1.5" />
        <path d="M 20 70 L 40 67" fill="none" stroke="black" strokeWidth="1.5" />
        <path d="M 80 60 L 60 65" fill="none" stroke="black" strokeWidth="1.5" />
        <path d="M 80 70 L 60 67" fill="none" stroke="black" strokeWidth="1.5" />
        <path
          d="M 50 10 L 50 25 M 50 30 L 50 32"
          fill="none"
          stroke="#ef4444"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
