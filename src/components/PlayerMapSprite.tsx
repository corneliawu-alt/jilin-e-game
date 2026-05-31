import React, { useEffect, useState } from 'react';
import {
  getPlayerSpritePath,
  getPlayerSpriteFallback,
  getSpriteSheetBackgroundPosition,
  getSpriteSheetBackgroundSize,
  type SpriteDirection,
  type PlayerCharacterId,
} from '../constants/characterAssets';

interface PlayerMapSpriteProps {
  characterId: PlayerCharacterId | string;
  direction: SpriteDirection;
  className?: string;
  animate?: boolean;
}

/** 地圖用玩家行走圖（Actor1_1_1 / Actor1_2_1，4×2 方向小圖） */
export default function PlayerMapSprite({
  characterId,
  direction,
  className = 'w-full h-full',
  animate = true,
}: PlayerMapSpriteProps) {
  const [src, setSrc] = useState(() => getPlayerSpritePath(characterId));
  const [frame, setFrame] = useState<0 | 1>(0);

  useEffect(() => {
    const primary = getPlayerSpritePath(characterId);
    setSrc(primary);
    const img = new Image();
    img.src = primary;
    img.onerror = () => setSrc(getPlayerSpriteFallback(characterId));
  }, [characterId]);

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
      aria-label="稽查員"
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
