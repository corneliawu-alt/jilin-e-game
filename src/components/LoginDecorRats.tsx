import React from 'react';
import RatSprite from './RatSprite';
import type { RatType } from '../constants/ratAssets';
import type { SpriteDirection } from '../constants/characterAssets';

type DecorRat = {
  ratType: RatType;
  direction: SpriteDirection;
  positionClass: string;
  animClass?: string;
  animateWalk?: boolean;
  spriteClass: string;
};

const DECOR_RATS: DecorRat[] = [
  {
    ratType: 1,
    direction: 'right',
    positionClass: 'login-decor-rat login-decor-rat--crawl-top',
    animateWalk: true,
    spriteClass: 'w-14 h-14 sm:w-16 sm:h-16',
  },
  {
    ratType: 2,
    direction: 'left',
    positionClass: 'login-decor-rat login-decor-rat--crawl-mid',
    animateWalk: true,
    spriteClass: 'w-12 h-12 sm:w-14 sm:h-14',
  },
  {
    ratType: 3,
    direction: 'right',
    positionClass: 'login-decor-rat login-decor-rat--crawl',
    animateWalk: true,
    spriteClass: 'w-11 h-11 sm:w-12 sm:h-12',
  },
  {
    ratType: 1,
    direction: 'down',
    positionClass: 'login-decor-rat login-decor-rat--peek-br',
    animClass: 'login-rat-float-y login-rat-float-y--delayed',
    spriteClass: 'w-10 h-10 sm:w-12 sm:h-12',
  },
];

/** 登入頁純裝飾老鼠（精靈圖裁切 + CSS 動畫） */
export default function LoginDecorRats() {
  return (
    <div
      className="login-decor-rats absolute inset-0 overflow-x-hidden overflow-y-visible pointer-events-none z-20"
      aria-hidden
    >
      {DECOR_RATS.map((rat, i) => (
        <div key={i} className={rat.positionClass}>
          {rat.animClass ? (
            <div className={rat.animClass}>
              <RatSprite
                ratType={rat.ratType}
                direction={rat.direction}
                className={rat.spriteClass}
                animateWalk={rat.animateWalk}
                decorative
              />
            </div>
          ) : (
            <RatSprite
              ratType={rat.ratType}
              direction={rat.direction}
              className={rat.spriteClass}
              animateWalk={rat.animateWalk}
              decorative
            />
          )}
        </div>
      ))}
    </div>
  );
}
