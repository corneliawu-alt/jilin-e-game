import React, { useState } from 'react';
import { SPRITE_IMG_CLASS } from '../constants/characterAssets';

interface CharacterSpriteProps {
  src: string;
  fallbackSrc: string;
  alt: string;
  className?: string;
  imgClassName?: string;
}

/** 方便替換去背 PNG：<img src="/player.png" className="w-full h-full object-contain drop-shadow-md" /> */
export default function CharacterSprite({
  src,
  fallbackSrc,
  alt,
  className = '',
  imgClassName = SPRITE_IMG_CLASS,
}: CharacterSpriteProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [triedFallback, setTriedFallback] = useState(false);

  return (
    <div className={`overflow-visible ${className}`}>
      <img
        src={currentSrc}
        alt={alt}
        className={imgClassName}
        referrerPolicy="no-referrer"
        onError={() => {
          if (!triedFallback) {
            setTriedFallback(true);
            setCurrentSrc(fallbackSrc);
          }
        }}
      />
    </div>
  );
}
