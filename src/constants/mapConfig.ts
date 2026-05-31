export const GRID_WIDTH = 40;
export const GRID_HEIGHT = 30;
export const TILE_SIZE = 32;
/** 玩家起始座標由 tilemap.getPlayerSpawnPoint() 動態決定（主城門正上方幹道） */

/** NPC 散落在店門口、噴水池旁等 */
export const NPC_GRID_POSITIONS: Record<'Chef' | 'Doctor' | 'Captain', { x: number; y: number }> = {
  Chef: { x: 7, y: 10 },
  Doctor: { x: 22, y: 12 },
  Captain: { x: 34, y: 27 },
};

export const MAP_PIXEL_WIDTH = GRID_WIDTH * TILE_SIZE;
export const MAP_PIXEL_HEIGHT = GRID_HEIGHT * TILE_SIZE;

export type GridPosition = { x: number; y: number };
