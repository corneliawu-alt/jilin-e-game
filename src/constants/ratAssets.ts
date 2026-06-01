import {
  getSpriteSheetBackgroundPosition,
  getSpriteSheetBackgroundSize,
  type SpriteDirection,
} from './characterAssets';

/** 任務老鼠行走圖（public/enemyrat/rat1.png，4 欄 × 2 列） */
export const RAT_SPRITE_SRC = '/enemyrat/rat1.png';

/** 欄位順序：下、左、右、上（與 RPG Maker / 本專案行走圖一致） */
export const RAT_SPRITE_COL_ORDER: readonly SpriteDirection[] = [
  'down',
  'left',
  'right',
  'up',
];

const IDLE_DIRECTIONS: SpriteDirection[] = ['down', 'left', 'right', 'up'];

/** 平時預設面向（依任務 id 穩定分配，避免每幀亂跳） */
export function getRatDefaultFacing(questId: number): SpriteDirection {
  return IDLE_DIRECTIONS[(questId - 1) % IDLE_DIRECTIONS.length] ?? 'down';
}

/**
 * 玩家進入九宮格時：依相對座標讓老鼠面向玩家（先比 X，同欄再比 Y）
 */
export function resolveRatFacingTowardPlayer(
  ratX: number,
  ratY: number,
  playerX: number,
  playerY: number,
): SpriteDirection {
  if (playerX < ratX) return 'left';
  if (playerX > ratX) return 'right';
  if (playerY < ratY) return 'up';
  if (playerY > ratY) return 'down';
  return 'down';
}

/** 稽查員面向任務鼠（先比 X，同欄再比 Y，與老鼠面向玩家的規則對稱） */
export function resolvePlayerFacingTowardRat(
  playerX: number,
  playerY: number,
  ratX: number,
  ratY: number,
): SpriteDirection {
  if (ratX < playerX) return 'left';
  if (ratX > playerX) return 'right';
  if (ratY < playerY) return 'up';
  if (ratY > playerY) return 'down';
  return 'down';
}

export function getRatSpriteBackgroundSize(): string {
  return getSpriteSheetBackgroundSize();
}

export function getRatSpriteBackgroundPosition(
  direction: SpriteDirection,
  frame: 0 | 1 = 0,
): string {
  return getSpriteSheetBackgroundPosition(direction, frame);
}
