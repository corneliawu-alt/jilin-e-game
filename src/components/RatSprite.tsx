import React, { useEffect, useState } from 'react';
import {
  RAT_SPRITE_SRC,
  getRatSpriteBackgroundPosition,
  getRatSpriteBackgroundSize,
} from '../constants/ratAssets';
import type { SpriteDirection } from '../constants/characterAssets';

export type RatSpriteVariant = 'normal' | 'boss' | 'muted';

interface RatSpriteProps {
  direction?: SpriteDirection;
  className?: string;
  /** 行走圖兩格輪播（地圖用）；UI 小圖可關閉 */
  animateWalk?: boolean;
  variant?: RatSpriteVariant;
  ariaLabel?: string;
}

export default function RatSprite({
  direction = 'down',
  className = '',
  animateWalk = false,
  variant = 'normal',
  ariaLabel = '變異老鼠',
}: RatSpriteProps) {
  const [frame, setFrame] = useState<0 | 1>(0);

  const bossGlow =
    variant === 'boss'
      ? 'drop-shadow-[0_0_8px_rgba(239,68,68,0.55)]'
      : '';
  const mutedClass = variant === 'muted' ? 'opacity-80 grayscale-[0.12]' : '';

  useEffect(() => {
    if (!animateWalk) {
      setFrame(0);
      return;
    }
    const timer = setInterval(() => setFrame((f) => (f === 0 ? 1 : 0)), 400);
    return () => clearInterval(timer);
  }, [animateWalk, direction]);

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={`w-9 h-9 shrink-0 bg-no-repeat drop-shadow-md select-none
        ${bossGlow} ${mutedClass} ${className}`}
      style={{
        backgroundImage: `url(${RAT_SPRITE_SRC})`,
        backgroundSize: getRatSpriteBackgroundSize(),
        backgroundPosition: getRatSpriteBackgroundPosition(direction, frame),
        imageRendering: 'pixelated',
      }}
    />
  );
}
