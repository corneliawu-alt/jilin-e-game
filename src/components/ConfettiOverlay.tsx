import React, { useMemo } from 'react';
import { motion } from 'motion/react';

const COLORS = ['#fbbf24', '#f97316', '#34d399', '#38bdf8', '#f472b6', '#fde047', '#a78bfa'];

/** 滿版彩帶粒子（純 CSS / motion，無外部套件） */
export default function ConfettiOverlay() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => ({
        id: i,
        left: `${(i * 17 + 7) % 100}%`,
        delay: (i % 12) * 0.18,
        duration: 3.2 + (i % 5) * 0.45,
        color: COLORS[i % COLORS.length],
        size: 6 + (i % 4) * 2,
        rotate: (i * 47) % 360,
      })),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0" aria-hidden>
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute top-0 rounded-sm opacity-90"
          style={{
            left: p.left,
            width: p.size,
            height: p.size * 1.6,
            backgroundColor: p.color,
            rotate: `${p.rotate}deg`,
          }}
          initial={{ y: '-12%', opacity: 0 }}
          animate={{
            y: ['0vh', '105vh'],
            opacity: [0, 1, 1, 0.6],
            rotate: [p.rotate, p.rotate + 180, p.rotate + 360],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.22)_0%,transparent_55%)]"
        aria-hidden
      />
    </div>
  );
}
