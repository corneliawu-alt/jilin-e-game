import React from 'react';
import { motion } from 'motion/react';
import { TILE_SIZE } from '../../constants/gameData';

interface TreasureRadarPingProps {
  x: number;
  y: number;
}

/** 尋寶雷達：發光光圈 + 指引箭頭 */
export default function TreasureRadarPing({ x, y }: TreasureRadarPingProps) {
  return (
    <div
      className="absolute pointer-events-none z-[14] flex items-center justify-center"
      style={{
        left: x * TILE_SIZE,
        top: y * TILE_SIZE,
        width: TILE_SIZE,
        height: TILE_SIZE,
      }}
    >
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-amber-400/90 bg-amber-300/25"
        initial={{ scale: 0.4, opacity: 0.9 }}
        animate={{ scale: [0.4, 1.8, 2.2], opacity: [0.9, 0.35, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
      />
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-yellow-300/80"
        initial={{ scale: 0.5, opacity: 0.7 }}
        animate={{ scale: [0.5, 1.5, 1.9], opacity: [0.7, 0.2, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut', delay: 0.35 }}
      />
      <motion.span
        className="relative z-10 text-xl leading-none drop-shadow-[0_0_8px_rgba(251,191,36,0.95)]"
        animate={{ y: [0, -4, 0] }}
        transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut' }}
        aria-hidden
      >
        ⬇️
      </motion.span>
    </div>
  );
}
