import React, { useEffect, useState } from 'react';
import type { TargetNPC } from '../constants/gameData';
import {
  getNpcSpritePath,
  getNpcSpriteFallback,
  getSpriteSheetBackgroundPosition,
  getSpriteSheetBackgroundSize,
  type SpriteDirection,
} from '../constants/characterAssets';

interface NpcMapSpriteProps {
  npcId: TargetNPC;
  direction: SpriteDirection;
  className?: string;
  animate?: boolean;
}

/** 地圖用 NPC 行走圖（Actor1_x_1.png 4×2 方向小圖） */
export default function NpcMapSprite({
  npcId,
  direction,
  className = 'w-full h-full',
  animate = true,
}: NpcMapSpriteProps) {
  const [src, setSrc] = useState(() => getNpcSpritePath(npcId));
  const [frame, setFrame] = useState<0 | 1>(0);

  useEffect(() => {
    const primary = getNpcSpritePath(npcId);
    setSrc(primary);
    const img = new Image();
    img.src = primary;
    img.onerror = () => setSrc(getNpcSpriteFallback(npcId));
  }, [npcId]);

  useEffect(() => {
    if (!animate) {
      setFrame(0);
      return;
    }
    const timer = setInterval(() => setFrame((f) => (f === 0 ? 1 : 0)), 450);
    return () => clearInterval(timer);
  }, [animate, direction]);

  return (
    <div
      role="img"
      aria-hidden
      className={`${className} bg-no-repeat drop-shadow-md pointer-events-none`}
      style={{
        backgroundImage: `url(${src})`,
        backgroundSize: getSpriteSheetBackgroundSize(),
        backgroundPosition: getSpriteSheetBackgroundPosition(direction, frame),
        imageRendering: 'pixelated',
      }}
    />
  );
}
