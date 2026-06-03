export const GRID_WIDTH = 40;
export const GRID_HEIGHT = 30;
export const TILE_SIZE = 32;
/** 玩家起始座標由 tilemap.getPlayerSpawnPoint() 動態決定（主城門正上方幹道） */

/** NPC 固定於三區地標建築門口（餐廳／診所／倉庫） */
export const NPC_GRID_POSITIONS: Record<'Chef' | 'Doctor' | 'Captain', { x: number; y: number }> = {
  Chef: { x: 6, y: 8 },
  Doctor: { x: 21, y: 9 },
  Captain: { x: 30, y: 23 },
};

export const MAP_PIXEL_WIDTH = GRID_WIDTH * TILE_SIZE;
export const MAP_PIXEL_HEIGHT = GRID_HEIGHT * TILE_SIZE;

export type GridPosition = { x: number; y: number };
