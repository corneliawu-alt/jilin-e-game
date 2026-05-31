import {
  GRID_WIDTH,
  GRID_HEIGHT,
  PLAYER_START,
  NPC_GRID_POSITIONS,
} from './mapConfig';

export enum TileId {
  Grass = 0,
  Road = 1,
  Sidewalk = 2,
  RoofHome = 3,
  RoofShop = 4,
  Wall = 5,
  Tree = 6,
  Pond = 7,
  GrassDark = 8,
  FlowerBed = 9,
  Path = 10,
  Window = 11,
  Door = 12,
  RoadDashH = 13,
  RoadDashV = 14,
  Plaza = 15,
  Fountain = 16,
}

export type BuildingPart = 'roof' | 'wall' | 'window' | 'door';
/** 店門朝向（面向道路的一側） */
export type BuildingFacing = 'south' | 'north' | 'east' | 'west';
export type RoadDetail = 'zebra-h' | 'zebra-v' | 'manhole';

export type ShopThemeId =
  | 'home'
  | 'house_red'
  | 'house_blue'
  | 'bakery'
  | 'cafe'
  | 'grocery'
  | 'flower'
  | 'bookstore'
  | 'diner'
  | 'restaurant'
  | 'clinic'
  | 'warehouse';

export type BuildingCellMeta = {
  theme: ShopThemeId;
  part: BuildingPart;
  buildingId: string;
  footprintX: number;
  footprintY: number;
  footprintW: number;
  footprintH: number;
  doorFacing: BuildingFacing;
  isAwningRow?: boolean;
  showSign?: boolean;
  hasWallLamp?: boolean;
};

/** 地圖外圍森林帶（generateMap 時填入） */
let MAP_EDGE_FOREST = new Set<string>();

const MAP_EDGE_DEPTH = 2;

export const SHOP_THEMES: Record<
  ShopThemeId,
  {
    roofGradient: string;
    wallClass: string;
    awningClass: string;
    emoji: string;
    label: string;
    isShop: boolean;
  }
> = {
  home: {
    roofGradient: 'bg-gradient-to-br from-stone-400 to-stone-600',
    wallClass: 'bg-stone-200',
    awningClass: '',
    emoji: '🏠',
    label: '民宅',
    isShop: false,
  },
  house_red: {
    roofGradient: 'bg-gradient-to-br from-red-500 to-red-800',
    wallClass: 'bg-stone-100',
    awningClass: '',
    emoji: '🏠',
    label: '民宅',
    isShop: false,
  },
  house_blue: {
    roofGradient: 'bg-gradient-to-br from-blue-500 to-blue-800',
    wallClass: 'bg-stone-100',
    awningClass: '',
    emoji: '🏠',
    label: '民宅',
    isShop: false,
  },
  bakery: {
    roofGradient: 'bg-gradient-to-br from-orange-400 to-orange-700',
    wallClass: 'bg-orange-100',
    awningClass: 'awning-strip-bakery',
    emoji: '🥐',
    label: '麵包店',
    isShop: true,
  },
  cafe: {
    roofGradient: 'bg-gradient-to-br from-amber-600 to-amber-900',
    wallClass: 'bg-amber-100',
    awningClass: 'awning-strip-cafe',
    emoji: '☕',
    label: '咖啡廳',
    isShop: true,
  },
  grocery: {
    roofGradient: 'bg-gradient-to-br from-blue-400 to-blue-700',
    wallClass: 'bg-blue-100',
    awningClass: 'awning-strip-grocery',
    emoji: '🏪',
    label: '雜貨店',
    isShop: true,
  },
  flower: {
    roofGradient: 'bg-gradient-to-br from-pink-400 to-emerald-600',
    wallClass: 'bg-pink-50',
    awningClass: 'awning-strip-flower',
    emoji: '🌸',
    label: '花店',
    isShop: true,
  },
  bookstore: {
    roofGradient: 'bg-gradient-to-br from-amber-700 to-slate-800',
    wallClass: 'bg-amber-100',
    awningClass: 'awning-strip-bookstore',
    emoji: '📚',
    label: '書店',
    isShop: true,
  },
  diner: {
    roofGradient: 'bg-gradient-to-br from-red-500 to-yellow-600',
    wallClass: 'bg-yellow-50',
    awningClass: 'awning-strip-diner',
    emoji: '🍔',
    label: '速食店',
    isShop: true,
  },
  restaurant: {
    roofGradient: 'bg-gradient-to-br from-orange-500 to-red-800',
    wallClass: 'bg-orange-100',
    awningClass: 'awning-strip-bakery',
    emoji: '🍳',
    label: '餐廳',
    isShop: true,
  },
  clinic: {
    roofGradient: 'bg-gradient-to-br from-sky-400 to-sky-700',
    wallClass: 'bg-sky-50',
    awningClass: 'awning-strip-grocery',
    emoji: '🏥',
    label: '診所',
    isShop: true,
  },
  warehouse: {
    roofGradient: 'bg-gradient-to-br from-stone-500 to-stone-800',
    wallClass: 'bg-stone-200',
    awningClass: 'awning-strip-neutral',
    emoji: '📦',
    label: '倉庫',
    isShop: true,
  },
};

const COMMERCIAL_POOL: ShopThemeId[] = [
  'bakery', 'cafe', 'grocery', 'flower', 'bookstore', 'diner', 'restaurant',
];
const HOUSE_POOL: ShopThemeId[] = ['house_red', 'house_blue', 'home', 'home'];

export const TILE_CLASSES: Record<TileId, string> = {
  [TileId.Grass]: 'tile-grass',
  [TileId.GrassDark]: 'tile-grass-dark',
  [TileId.Road]: 'tile-road-lane',
  [TileId.RoadDashH]: 'tile-road-center-h',
  [TileId.RoadDashV]: 'tile-road-center-v',
  [TileId.Plaza]: 'tile-plaza',
  [TileId.Fountain]: 'tile-fountain',
  [TileId.Sidewalk]: 'tile-sidewalk',
  [TileId.RoofHome]: 'tile-roof-home',
  [TileId.RoofShop]: 'tile-roof-shop',
  [TileId.Wall]: 'tile-wall',
  [TileId.Window]: 'tile-window',
  [TileId.Door]: 'tile-door',
  [TileId.Tree]: 'tile-tree-base',
  [TileId.Pond]: 'tile-pond',
  [TileId.FlowerBed]: 'tile-flower-bed',
  [TileId.Path]: 'tile-dirt',
};

const STRUCTURE_TILES = new Set<TileId>([
  TileId.RoofHome, TileId.RoofShop, TileId.Wall, TileId.Window, TileId.Door,
]);
const BLOCKING_TILES = new Set<TileId>([TileId.Tree, TileId.Fountain, ...STRUCTURE_TILES]);
const BUILDING_TILES = STRUCTURE_TILES;
const WALKABLE_TILES = new Set<TileId>([
  TileId.Grass, TileId.GrassDark, TileId.Sidewalk, TileId.Road, TileId.RoadDashH,
  TileId.RoadDashV, TileId.FlowerBed, TileId.Path, TileId.Plaza,
]);

const MAIN_ROAD_H = [8, 15, 22];
const MAIN_ROAD_V = [10, 20, 30];

/** 老鼠可生成的地面：草地、石磚人行道／廣場／巷弄 */
const RAT_GROUND_TILES = new Set<TileId>([
  TileId.Grass,
  TileId.GrassDark,
  TileId.Sidewalk,
  TileId.Path,
  TileId.Plaza,
]);

/** 公園樹叢區（有機聚集，非網格果園） */
const PARK_CLUSTERS: { cx: number; cy: number; r: number; id: string }[] = [
  { cx: 4, cy: 26, r: 2, id: 'park-sw' },
  { cx: 34, cy: 11, r: 2, id: 'park-ne' },
  { cx: 14, cy: 19, r: 2, id: 'park-mid' },
];

const STREET_TREE_SPACING = 7;

/** 次要巷弄座標（供垃圾桶與老鼠生成判斷） */
const ALLEY_SEGMENTS: [number, number, number, number][] = [
  [14, 9, 14, 14],
  [12, 11, 17, 11],
  [25, 10, 25, 14],
  [15, 16, 15, 21],
  [28, 16, 28, 21],
  [33, 23, 33, 24],
  [11, 17, 11, 21],
  [23, 17, 23, 21],
];

/** 資源回收總部（右下封閉園區，含圍欄 + 單一入口） */
const RECYCLING_CENTER = {
  ox: 30,
  oy: 24,
  w: 8,
  h: 6,
  entranceX: 33,
  entranceY: 24,
};

function isInRecyclingCenter(x: number, y: number, interiorOnly = false): boolean {
  const { ox, oy, w, h } = RECYCLING_CENTER;
  if (x < ox || x >= ox + w || y < oy || y >= oy + h) return false;
  if (!interiorOnly) return true;
  return x > ox && x < ox + w - 1 && y > oy && y < oy + h - 1;
}

function isRecyclingFenceCell(x: number, y: number): boolean {
  const { ox, oy, w, h, entranceX, entranceY } = RECYCLING_CENTER;
  if (!isInRecyclingCenter(x, y)) return false;
  const onEdge = x === ox || x === ox + w - 1 || y === oy || y === oy + h - 1;
  if (!onEdge) return false;
  return !(x === entranceX && y === entranceY);
}

/** 主幹道交會點 — 圓環噴水池廣場中心 */
const ROUNDABOUT_CENTER = { x: 20, y: 15 };
const ROUNDABOUT_RADIUS = 3;

let buildingMetaGrid: (BuildingCellMeta | null)[][] = [];
let roadDetailGrid: (RoadDetail | null)[][] = [];

export function getBuildingMeta(x: number, y: number): BuildingCellMeta | null {
  if (!isInMap(x, y)) return null;
  return buildingMetaGrid[y]?.[x] ?? null;
}

export function getRoadDetail(x: number, y: number): RoadDetail | null {
  if (!isInMap(x, y)) return null;
  return roadDetailGrid[y]?.[x] ?? null;
}

export type MapDecorationKind =
  | 'lamp'
  | 'traffic'
  | 'flowers'
  | 'bench'
  | 'mailbox'
  | 'signpost'
  | 'trash'
  | 'box'
  | 'emoji';

export type MapDecoration = {
  id: string;
  x: number;
  y: number;
  kind: MapDecorationKind;
  label?: string;
  emoji?: string;
  variant?: number;
};

export type QuestPoint = {
  questionId: number;
  x: number;
  y: number;
};

export type TreasureVariant = 'chest' | 'sparkle';

import type { ItemId } from './items';
import { PREVENTION_ITEMS_BY_ID, shuffledTreasureItemOrder, treasureItemIdForSpot } from './items';

export type TreasureSpot = {
  id: string;
  x: number;
  y: number;
  variant: TreasureVariant;
  itemId: ItemId;
  label: string;
};

export let MAP_DECORATIONS: MapDecoration[] = [];
export let QUEST_POINTS: QuestPoint[] = [];
export let TREASURE_SPOTS: TreasureSpot[] = [];

export const SCENERY_PROPS: { id: string; x: number; y: number; emoji: string }[] = [];
export const BUILDING_DECORATIONS: { id: string; x: number; y: number; emoji: string }[] = [];
export const BUILDING_SIGNS = [] as const;

type DirtySpot = {
  id: string;
  x: number;
  y: number;
  zone: 'restaurant' | 'clinic' | 'warehouse';
};

const TRASH_MAX_PER_ZONE: Record<DirtySpot['zone'], number> = {
  restaurant: 2,
  clinic: 2,
  warehouse: 0,
};

type RatCandidate = {
  x: number;
  y: number;
  score: number;
  zone: 'restaurant' | 'clinic' | 'warehouse';
  hint: 'door' | 'corner' | 'dirty' | 'alley';
  dirtyId?: string;
};

function isInMap(x: number, y: number) {
  return x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT;
}

function hash(x: number, y: number, s = 0) {
  return Math.abs((x * 374761 + y * 668265 + s * 982451) % 2147483647);
}

function createEmptyMap(): TileId[][] {
  return Array.from({ length: GRID_HEIGHT }, () =>
    Array.from({ length: GRID_WIDTH }, () => TileId.Grass),
  );
}

function createEmptyMeta<T>(): T[][] {
  return Array.from({ length: GRID_HEIGHT }, () =>
    Array.from({ length: GRID_WIDTH }, () => null as T),
  );
}

function setTile(map: TileId[][], x: number, y: number, tile: TileId) {
  if (isInMap(x, y)) map[y][x] = tile;
}

function setMeta(meta: (BuildingCellMeta | null)[][], x: number, y: number, cell: BuildingCellMeta | null) {
  if (isInMap(x, y)) meta[y][x] = cell;
}

function setRoadDetail(x: number, y: number, detail: RoadDetail | null) {
  if (isInMap(x, y)) roadDetailGrid[y][x] = detail;
}

function isNature(tile: TileId) {
  return tile === TileId.Grass || tile === TileId.GrassDark || tile === TileId.FlowerBed;
}

function isRoadFamily(tile: TileId) {
  return tile === TileId.Road || tile === TileId.RoadDashH || tile === TileId.RoadDashV;
}

function isNetworkTile(tile: TileId) {
  return isRoadFamily(tile) || tile === TileId.Sidewalk || tile === TileId.Path;
}

function isShopTheme(theme: ShopThemeId) {
  return SHOP_THEMES[theme].isShop;
}

function isBuildingTileId(tile: TileId) {
  return BUILDING_TILES.has(tile);
}

function isWallLikeTile(tile: TileId) {
  return tile === TileId.Wall || tile === TileId.Window || tile === TileId.Door;
}

function canPaveEntrance(tile: TileId) {
  return (
    tile === TileId.Grass ||
    tile === TileId.GrassDark ||
    tile === TileId.Path ||
    tile === TileId.FlowerBed
  );
}

function paveEntranceTile(map: TileId[][], x: number, y: number) {
  if (!isInMap(x, y)) return;
  const t = map[y][x];
  if (canPaveEntrance(t)) setTile(map, x, y, TileId.Sidewalk);
}

/** 從店門口向外鋪人行道直到接上路網 */
function paintDoorFrontage(
  map: TileId[][],
  doorX: number,
  doorY: number,
  doorFacing: BuildingFacing,
  footprintW: number,
  footprintX: number,
) {
  const maxSteps = 8;

  if (doorFacing === 'south') {
    for (let dx = 0; dx < footprintW; dx++) paveEntranceTile(map, footprintX + dx, doorY + 1);
    for (let step = 1; step <= maxSteps; step++) {
      const py = doorY + step;
      if (!isInMap(doorX, py)) break;
      const t = map[py][doorX];
      if (isRoadFamily(t)) {
        if (step > 1) paveEntranceTile(map, doorX, py - 1);
        break;
      }
      if (isBuildingTileId(t) || t === TileId.Sidewalk) {
        if (t === TileId.Sidewalk) break;
        break;
      }
      paveEntranceTile(map, doorX, py);
    }
    return;
  }

  if (doorFacing === 'north') {
    for (let dx = 0; dx < footprintW; dx++) paveEntranceTile(map, footprintX + dx, doorY - 1);
    for (let step = 1; step <= maxSteps; step++) {
      const py = doorY - step;
      if (!isInMap(doorX, py)) break;
      const t = map[py][doorX];
      if (isRoadFamily(t)) {
        if (step > 1) paveEntranceTile(map, doorX, py + 1);
        break;
      }
      if (isBuildingTileId(t) || t === TileId.Sidewalk) break;
      paveEntranceTile(map, doorX, py);
    }
    return;
  }

  if (doorFacing === 'east') {
    paveEntranceTile(map, doorX + 1, doorY);
    for (let step = 1; step <= maxSteps; step++) {
      const px = doorX + step;
      if (!isInMap(px, doorY)) break;
      const t = map[doorY][px];
      if (isRoadFamily(t)) {
        if (step > 1) paveEntranceTile(map, px - 1, doorY);
        break;
      }
      if (isBuildingTileId(t) || t === TileId.Sidewalk) break;
      paveEntranceTile(map, px, doorY);
    }
    return;
  }

  if (doorFacing === 'west') {
    paveEntranceTile(map, doorX - 1, doorY);
    for (let step = 1; step <= maxSteps; step++) {
      const px = doorX - step;
      if (!isInMap(px, doorY)) break;
      const t = map[doorY][px];
      if (isRoadFamily(t)) {
        if (step > 1) paveEntranceTile(map, px + 1, doorY);
        break;
      }
      if (isBuildingTileId(t) || t === TileId.Sidewalk) break;
      paveEntranceTile(map, px, doorY);
    }
  }
}

type CellBlueprint = { tile: TileId; part: BuildingPart };

function classifyBuildingCell(
  dx: number,
  dy: number,
  w: number,
  h: number,
  doorFacing: BuildingFacing,
  doorCol: number,
  doorRow: number,
  shop: boolean,
): CellBlueprint {
  const roofRow = doorFacing === 'north' ? h - 1 : 0;
  const groundRow = doorFacing === 'north' ? 0 : h - 1;

  if (doorFacing === 'south' || doorFacing === 'north') {
    if (dy === roofRow) {
      return {
        tile: shop ? TileId.RoofShop : TileId.RoofHome,
        part: 'roof',
      };
    }
    if (dy === groundRow) {
      if (dx === doorCol) return { tile: TileId.Door, part: 'door' };
      return { tile: TileId.Window, part: 'window' };
    }
    if (dx === 0 || dx === w - 1) return { tile: TileId.Window, part: 'window' };
    return { tile: TileId.Wall, part: 'wall' };
  }

  const faceCol = doorFacing === 'east' ? w - 1 : 0;
  if (dy === 0) {
    return { tile: shop ? TileId.RoofShop : TileId.RoofHome, part: 'roof' };
  }
  if (dx === faceCol) {
    if (dy === doorRow) return { tile: TileId.Door, part: 'door' };
    return { tile: TileId.Window, part: 'window' };
  }
  if (dy === h - 1 || dx === 0 || dx === w - 1) {
    return { tile: TileId.Window, part: 'window' };
  }
  return { tile: TileId.Wall, part: 'wall' };
}

function getZone(x: number): 'restaurant' | 'clinic' | 'warehouse' {
  if (x <= 12) return 'restaurant';
  if (x <= 26) return 'clinic';
  return 'warehouse';
}

function isOnMainRoadSurface(map: TileId[][], x: number, y: number): boolean {
  const t = map[y][x];
  if (isRoadFamily(t)) return true;
  if (t !== TileId.Sidewalk) return false;
  return [[0, -1], [0, 1], [-1, 0], [1, 0]].some(([dx, dy]) => {
    const nt = map[y + dy]?.[x + dx];
    return nt !== undefined && isRoadFamily(nt);
  });
}

function isAdjacentToWall(map: TileId[][], x: number, y: number): boolean {
  return [[0, -1], [0, 1], [-1, 0], [1, 0]].some(([dx, dy]) => {
    const nx = x + dx;
    const ny = y + dy;
    return isInMap(nx, ny) && isWallLikeTile(map[ny][nx]);
  });
}

function isAdjacentToTrashDeco(x: number, y: number, deco: MapDecoration[]): boolean {
  return deco.some(
    (d) =>
      (d.kind === 'trash' || d.kind === 'box') &&
      Math.abs(d.x - x) + Math.abs(d.y - y) === 1,
  );
}

function isAlleyCell(map: TileId[][], x: number, y: number): boolean {
  if (map[y][x] !== TileId.Path) return false;
  return ALLEY_SEGMENTS.some(([x1, y1, x2, y2]) => {
    if (x1 === x2) return x === x1 && y >= Math.min(y1, y2) && y <= Math.max(y1, y2);
    if (y1 === y2) return y === y1 && x >= Math.min(x1, x2) && x <= Math.max(x1, x2);
    return false;
  });
}

function isValidTrashGround(map: TileId[][], x: number, y: number): boolean {
  const t = map[y][x];
  if (t === TileId.Path || t === TileId.Grass || t === TileId.GrassDark) {
    return !isOnMainRoadSurface(map, x, y);
  }
  if (t === TileId.Plaza && isInRecyclingCenter(x, y, true)) return true;
  return false;
}

function countWallNeighbors(map: TileId[][], x: number, y: number): number {
  return [[0, -1], [0, 1], [-1, 0], [1, 0]].filter(([dx, dy]) => {
    const nx = x + dx;
    const ny = y + dy;
    return isInMap(nx, ny) && isWallLikeTile(map[ny][nx]);
  }).length;
}

/** 老鼠生成：可行走地面 + 緊鄰牆壁或髒亂物，絕不在建築／道路／屋頂上 */
function isValidRatSpawn(
  map: TileId[][],
  meta: (BuildingCellMeta | null)[][],
  x: number,
  y: number,
  deco: MapDecoration[],
  reserved: Set<string>,
): boolean {
  if (!isInMap(x, y)) return false;
  if (reserved.has(`${x},${y}`)) return false;
  if (meta[y][x]) return false;

  const t = map[y][x];
  if (!RAT_GROUND_TILES.has(t)) return false;
  if (isRoadFamily(t)) return false;
  if (t === TileId.Tree || t === TileId.Fountain || t === TileId.FlowerBed) return false;

  if (!isAdjacentToWall(map, x, y) && !isAdjacentToTrashDeco(x, y, deco)) return false;

  return true;
}

function buildReserved(): Set<string> {
  const r = new Set<string>();
  r.add(`${PLAYER_START.x},${PLAYER_START.y}`);
  Object.values(NPC_GRID_POSITIONS).forEach((p) => r.add(`${p.x},${p.y}`));
  return r;
}

function markReservedFootprint(reserved: Set<string>, x: number, y: number, w: number, h: number) {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) reserved.add(`${x + dx},${y + dy}`);
  }
}

function canPlaceFootprint(
  map: TileId[][], x: number, y: number, w: number, h: number,
  reserved: Set<string>,
): boolean {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      const px = x + dx;
      const py = y + dy;
      if (!isInMap(px, py)) return false;
      if (reserved.has(`${px},${py}`)) return false;
      const t = map[py][px];
      if (isRoadFamily(t) || t === TileId.Sidewalk || t === TileId.Plaza || t === TileId.Fountain) return false;
      if (STRUCTURE_TILES.has(t)) return false;
    }
  }
  return true;
}

function forEachLine(x1: number, y1: number, x2: number, y2: number, fn: (x: number, y: number) => void) {
  if (x1 === x2) {
    const [ya, yb] = y1 <= y2 ? [y1, y2] : [y2, y1];
    for (let y = ya; y <= yb; y++) fn(x1, y);
    return;
  }
  if (y1 === y2) {
    const [xa, xb] = x1 <= x2 ? [x1, x2] : [x2, x1];
    for (let x = xa; x <= xb; x++) fn(x, y1);
  }
}

/** 主幹道：筆直橫向 + 縱向貫穿，自然形成十字路口（中心虛線由 renderTile 統一繪製） */
function paintMainRoadGrid(map: TileId[][]) {
  MAIN_ROAD_H.forEach((y) => {
    for (let x = 0; x < GRID_WIDTH; x++) {
      setTile(map, x, y, TileId.Road);
      if (y > 0 && isNature(map[y - 1][x])) setTile(map, x, y - 1, TileId.Sidewalk);
      if (y < GRID_HEIGHT - 1 && isNature(map[y + 1][x])) setTile(map, x, y + 1, TileId.Sidewalk);
    }
  });

  MAIN_ROAD_V.forEach((x) => {
    for (let y = 0; y < GRID_HEIGHT; y++) {
      setTile(map, x, y, TileId.Road);
      if (x > 0 && isNature(map[y][x - 1])) setTile(map, x - 1, y, TileId.Sidewalk);
      if (x < GRID_WIDTH - 1 && isNature(map[y][x + 1])) setTile(map, x + 1, y, TileId.Sidewalk);
    }
  });
}

/** 城鎮入口通道：外圍森林不覆蓋此區，保留進城路 */
function isTownEntranceGap(x: number, y: number): boolean {
  return y >= GRID_HEIGHT - MAP_EDGE_DEPTH - 1 && x >= 7 && x <= 12;
}

function isNaturalBorderTile(t: TileId): boolean {
  return t === TileId.Grass || t === TileId.GrassDark || t === TileId.FlowerBed;
}

/** 地圖最外圍 1–2 格：密集樹木 + 深綠草地，營造小鎮被森林包圍感 */
function paintMapEdgeForest(map: TileId[][]) {
  MAP_EDGE_FOREST = new Set<string>();

  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      const dist = Math.min(x, y, GRID_WIDTH - 1 - x, GRID_HEIGHT - 1 - y);
      if (dist >= MAP_EDGE_DEPTH) continue;
      if (isTownEntranceGap(x, y)) continue;
      if (!isNaturalBorderTile(map[y][x])) continue;

      if (dist === 0) {
        setTile(map, x, y, TileId.Tree);
      } else if (hash(x, y, 200) % 4 === 0) {
        setTile(map, x, y, TileId.Tree);
      } else {
        setTile(map, x, y, TileId.GrassDark);
      }
      MAP_EDGE_FOREST.add(`${x},${y}`);
    }
  }
}

export function isMapEdgeForestCell(x: number, y: number): boolean {
  return MAP_EDGE_FOREST.has(`${x},${y}`);
}

/** 城鎮入口：左下方廣場，沿主幹道 x=10 往北（須於地圖生成最後呼叫） */
function paintTownEntrance(map: TileId[][], deco: MapDecoration[]) {
  for (let x = 8; x <= 11; x++) {
    if (x === 10) continue;
    setTile(map, x, 28, x === 9 ? TileId.Plaza : TileId.Sidewalk);
  }
  for (let y = 26; y <= 27; y++) {
    for (let x = 8; x <= 11; x++) {
      if (x === 10) continue;
      const t = map[y][x];
      if (!isRoadFamily(t) && !BUILDING_TILES.has(t)) {
        setTile(map, x, y, TileId.Sidewalk);
      }
    }
  }
  if (!deco.some((d) => d.id === 'town-entrance')) {
    deco.push({
      id: 'town-entrance',
      x: 9,
      y: 27,
      kind: 'emoji',
      emoji: '🏛️',
      label: '城鎮入口',
    });
  }
}

/** 次要巷弄：每段至少 2 格，端點必須接主幹道或已連接的步道 */
function paintSecondaryAlleys(map: TileId[][]) {
  ALLEY_SEGMENTS.forEach(([x1, y1, x2, y2]) => {
    forEachLine(x1, y1, x2, y2, (x, y) => {
      if (!isInMap(x, y)) return;
      const t = map[y][x];
      if (isNature(t)) setTile(map, x, y, TileId.Path);
    });
  });
}

/** 移除未連接主幹道的孤立 Path / 單格道路 */
function cleanupDisconnectedPaths(map: TileId[][]) {
  const connected = new Set<string>();
  const queue: [number, number][] = [];

  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      if (isRoadFamily(map[y][x])) queue.push([x, y]);
    }
  }

  while (queue.length > 0) {
    const [x, y] = queue.shift()!;
    const key = `${x},${y}`;
    if (connected.has(key)) continue;
    connected.add(key);

    [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(([dx, dy]) => {
      const nx = x + dx;
      const ny = y + dy;
      if (!isInMap(nx, ny)) return;
      const t = map[ny][nx];
      if (isNetworkTile(t) && !connected.has(`${nx},${ny}`)) queue.push([nx, ny]);
    });
  }

  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      if (map[y][x] === TileId.Path && !connected.has(`${x},${y}`)) {
        map[y][x] = TileId.Grass;
      }
    }
  }
}

function paintSmallBuilding(
  map: TileId[][], meta: (BuildingCellMeta | null)[][],
  x: number,
  y: number,
  w: number,
  h: number,
  theme: ShopThemeId,
  doorFacing: BuildingFacing,
  reserved: Set<string>,
  doorSlot?: number,
): boolean {
  if (!canPlaceFootprint(map, x, y, w, h, reserved)) return false;
  const shop = isShopTheme(theme);
  const buildingId = `b-${x}-${y}-${hash(x, y, 31)}`;

  const doorCol =
    doorFacing === 'east'
      ? w - 1
      : doorFacing === 'west'
        ? 0
        : Math.min(w - 1, Math.max(0, doorSlot ?? Math.floor(w / 2)));
  const doorRow =
    doorFacing === 'south'
      ? y + h - 1
      : doorFacing === 'north'
        ? y
        : y + Math.min(h - 1, Math.max(0, doorSlot ?? Math.floor(h / 2)));

  let doorX = x + doorCol;
  let doorY = doorRow;

  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      const px = x + dx;
      const py = y + dy;
      const { tile, part } = classifyBuildingCell(dx, dy, w, h, doorFacing, doorCol, doorRow - y, shop);

      if (part === 'door') {
        doorX = px;
        doorY = py;
      }

      const awningRow =
        (doorFacing === 'south' && dy === 1) ||
        (doorFacing === 'north' && dy === h - 2) ||
        (doorFacing === 'east' && dx === w - 2 && dy > 0) ||
        (doorFacing === 'west' && dx === 1 && dy > 0);

      const besideDoor =
        part !== 'door' &&
        part !== 'roof' &&
        Math.abs(px - doorX) + Math.abs(py - doorY) === 1;

      setTile(map, px, py, tile);
      setMeta(meta, px, py, {
        theme,
        part,
        buildingId,
        footprintX: x,
        footprintY: y,
        footprintW: w,
        footprintH: h,
        doorFacing,
        isAwningRow: shop && awningRow && part !== 'door' && part !== 'roof',
        showSign: shop && part === 'door',
        hasWallLamp: shop && besideDoor && hash(px, py, 77) % 2 === 0,
      });
    }
  }

  paintDoorFrontage(map, doorX, doorY, doorFacing, w, x);
  markReservedFootprint(reserved, x, y, w, h);
  return true;
}

function paintLShapedBuilding(
  map: TileId[][], meta: (BuildingCellMeta | null)[][],
  x: number, y: number, theme: ShopThemeId, reserved: Set<string>,
) {
  const ok1 = paintSmallBuilding(map, meta, x, y, 2, 3, theme, 'south', reserved);
  if (!ok1) return false;
  paintSmallBuilding(map, meta, x + 2, y + 1, 2, 2, theme, 'east', reserved);
  return true;
}

function paintMiniPark(
  map: TileId[][], deco: MapDecoration[], reserved: Set<string>,
  x: number, y: number, size: number, id: string,
) {
  if (!canPlaceFootprint(map, x, y, size, size, reserved)) return;
  for (let dy = 0; dy < size; dy++) {
    for (let dx = 0; dx < size; dx++) {
      const px = x + dx;
      const py = y + dy;
      const dist = Math.max(Math.abs(dx - Math.floor(size / 2)), Math.abs(dy - Math.floor(size / 2)));
      if (dist === 0) setTile(map, px, py, TileId.FlowerBed);
      else if (dist === Math.floor(size / 2) && hash(px, py, 55) % 3 !== 0) {
        setTile(map, px, py, TileId.Tree);
        reserved.add(`${px},${py}`);
      } else setTile(map, px, py, TileId.GrassDark);
    }
  }
  markReservedFootprint(reserved, x, y, size, size);
  if (size >= 2) {
    deco.push({ id: `${id}-fl`, x: x + 1, y: y + size - 1, kind: 'flowers', variant: hash(x, y) % 4 });
  }
}

function pickTheme(idx: number, side: 'shop' | 'home'): ShopThemeId {
  if (side === 'home') return HOUSE_POOL[idx % HOUSE_POOL.length];
  return COMMERCIAL_POOL[idx % COMMERCIAL_POOL.length];
}

function paintOrganicDistricts(
  map: TileId[][], meta: (BuildingCellMeta | null)[][],
  deco: MapDecoration[], reserved: Set<string>,
) {
  let idx = 0;

  MAIN_ROAD_H.forEach((roadY) => {
    for (let x = 3; x < GRID_WIDTH - 5; ) {
      const roll = hash(x, roadY, 10) % 10;
      const gap = hash(x, roadY, 11) % 3;

      if (roll === 0) {
        paintMiniPark(map, deco, reserved, x, roadY - 5, 2, `park-n-${x}`);
        x += 3;
        continue;
      }
      if (roll === 1) {
        paintMiniPark(map, deco, reserved, x, roadY + 3, 3, `park-s-${x}`);
        x += 4;
        continue;
      }

      const w = 2 + (hash(x, roadY, 12) % 3);
      const h = 2 + (hash(x, roadY, 13) % 2);
      const offset = hash(x, roadY, 14) % 2;

      const northY = roadY - 2 - h - offset;
      if (northY >= 1) {
        const theme = pickTheme(idx++, roll % 3 === 0 ? 'home' : 'shop');
        if (roll % 5 === 0) {
          paintLShapedBuilding(map, meta, x, northY, theme, reserved);
        } else {
          paintSmallBuilding(map, meta, x, northY, w, h, theme, 'south', reserved);
        }
      }

      if (hash(x, roadY, 15) % 3 !== 0) {
        const southY = roadY + 2 + offset;
        if (southY + h < GRID_HEIGHT - 2) {
          const theme2 = pickTheme(idx++, 'home');
          paintSmallBuilding(map, meta, x + (gap % 2), southY, w, h, theme2, 'north', reserved);
        }
      }

      x += w + 1 + gap;
    }
  });

  MAIN_ROAD_V.forEach((roadX) => {
    for (let y = 4; y < GRID_HEIGHT - 5; y += 2 + (hash(roadX, y, 16) % 3)) {
      if (hash(roadX, y, 17) % 6 === 0) {
        paintMiniPark(map, deco, reserved, roadX - 4, y, 2, `park-w-${roadX}-${y}`);
        continue;
      }
      const theme = pickTheme(idx++, hash(roadX, y, 18) % 2 === 0 ? 'shop' : 'home');
      const w = 2 + (hash(roadX, y, 19) % 2);
      const h = 3;
      paintSmallBuilding(map, meta, roadX - 2 - w, y, w, h, theme, 'east', reserved);
    }
  });
}

function paintLandmarks(
  map: TileId[][], meta: (BuildingCellMeta | null)[][], reserved: Set<string>,
) {
  paintSmallBuilding(map, meta, 5, 5, 4, 3, 'restaurant', 'south', reserved, 1);
  paintSmallBuilding(map, meta, 19, 5, 5, 4, 'clinic', 'south', reserved, 2);
  paintSmallBuilding(map, meta, 28, 19, 5, 4, 'warehouse', 'south', reserved, 2);
}

function isInRoundaboutFootprint(x: number, y: number, margin = 0): boolean {
  const dx = Math.abs(x - ROUNDABOUT_CENTER.x);
  const dy = Math.abs(y - ROUNDABOUT_CENTER.y);
  return Math.max(dx, dy) <= ROUNDABOUT_RADIUS + margin;
}

function roundaboutRing(x: number, y: number): number | null {
  const dx = x - ROUNDABOUT_CENTER.x;
  const dy = y - ROUNDABOUT_CENTER.y;
  const ring = Math.max(Math.abs(dx), Math.abs(dy));
  if (ring > ROUNDABOUT_RADIUS) return null;
  return ring;
}

/** 中心圓環噴水池：噴水池 → 廣場/花圃 → 圓環車道 → 外圈人行道 → 接四向主幹道 */
function paintRoundaboutPlaza(map: TileId[][], deco: MapDecoration[]) {
  const { x: cx, y: cy } = ROUNDABOUT_CENTER;

  for (let dy = -ROUNDABOUT_RADIUS; dy <= ROUNDABOUT_RADIUS; dy++) {
    for (let dx = -ROUNDABOUT_RADIUS; dx <= ROUNDABOUT_RADIUS; dx++) {
      const x = cx + dx;
      const y = cy + dy;
      if (!isInMap(x, y)) continue;

      const ring = Math.max(Math.abs(dx), Math.abs(dy));

      if (ring === 0) {
        setTile(map, x, y, TileId.Fountain);
      } else if (ring === 1) {
        if (Math.abs(dx) === 1 && Math.abs(dy) === 1) {
          setTile(map, x, y, TileId.FlowerBed);
        } else {
          setTile(map, x, y, TileId.Plaza);
        }
      } else if (ring === 2) {
        setTile(map, x, y, TileId.Road);
      } else if (ring === 3) {
        setTile(map, x, y, TileId.Sidewalk);
      }
    }
  }

  [[19, 15], [21, 15], [20, 14], [20, 16]].forEach(([x, y], i) => {
    if (isInMap(x, y) && map[y][x] === TileId.Plaza) {
      deco.push({ id: `rb-plaza-fl-${i}`, x, y, kind: 'flowers', variant: i % 4 });
    }
  });

  [[19, 14], [21, 14], [19, 16], [21, 16]].forEach(([x, y], i) => {
    if (isInMap(x, y) && map[y][x] === TileId.FlowerBed) {
      deco.push({ id: `rb-corner-fl-${i}`, x, y, kind: 'flowers', variant: (i + 2) % 4 });
    }
  });

  [[20, 14], [20, 16], [19, 15], [21, 15]].forEach(([x, y], i) => {
    if (isInMap(x, y) && map[y][x] === TileId.Plaza) {
      deco.push({ id: `rb-bench-${i}`, x, y, kind: 'bench' });
    }
  });

  reconnectRoundaboutSpokes(map);
}

/** 將四向主幹道中心線接入圓環車道（外圈不再以人行道截斷） */
function reconnectRoundaboutSpokes(map: TileId[][]) {
  const { x: cx, y: cy } = ROUNDABOUT_CENTER;

  if (MAIN_ROAD_H.includes(cy)) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      const ring = roundaboutRing(x, cy);
      if (ring !== null && ring <= 1) continue;
      setTile(map, x, cy, TileId.Road);
    }
    for (let x = 0; x < GRID_WIDTH; x++) {
      for (const sy of [cy - 1, cy + 1]) {
        if (!isInMap(x, sy)) continue;
        const sideRing = roundaboutRing(x, sy);
        if (sideRing !== null && sideRing <= 2) continue;
        const t = map[sy][x];
        if (t === TileId.Grass || t === TileId.GrassDark) {
          setTile(map, x, sy, TileId.Sidewalk);
        }
      }
    }
  }

  if (MAIN_ROAD_V.includes(cx)) {
    for (let y = 0; y < GRID_HEIGHT; y++) {
      const ring = roundaboutRing(cx, y);
      if (ring !== null && ring <= 1) continue;
      setTile(map, cx, y, TileId.Road);
    }
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (const sx of [cx - 1, cx + 1]) {
        if (!isInMap(sx, y)) continue;
        const sideRing = roundaboutRing(sx, y);
        if (sideRing !== null && sideRing <= 2) continue;
        const t = map[y][sx];
        if (t === TileId.Grass || t === TileId.GrassDark) {
          setTile(map, sx, y, TileId.Sidewalk);
        }
      }
    }
  }

  for (let dy = -ROUNDABOUT_RADIUS; dy <= ROUNDABOUT_RADIUS; dy++) {
    for (let dx = -ROUNDABOUT_RADIUS; dx <= ROUNDABOUT_RADIUS; dx++) {
      const x = cx + dx;
      const y = cy + dy;
      if (!isInMap(x, y)) continue;
      const ring = Math.max(Math.abs(dx), Math.abs(dy));
      if (ring !== 3) continue;
      if (dx === 0 || dy === 0) continue;
      setTile(map, x, y, TileId.Sidewalk);
    }
  }
}

/** 資源回收總部：封閉園區 + 集中造景 + 倉庫區髒亂點 */
function paintRecyclingCenterBase(
  map: TileId[][],
  deco: MapDecoration[],
  reserved: Set<string>,
): DirtySpot[] {
  const { ox, oy, w, h, entranceX, entranceY } = RECYCLING_CENTER;
  const captain = NPC_GRID_POSITIONS.Captain;
  const spots: DirtySpot[] = [];

  for (let y = oy; y < oy + h; y++) {
    for (let x = ox; x < ox + w; x++) {
      if (!isInMap(x, y)) continue;
      if (isRecyclingFenceCell(x, y)) {
        setTile(map, x, y, TileId.Wall);
        deco.push({ id: `rc-fence-${x}-${y}`, x, y, kind: 'emoji', emoji: '🚧' });
        continue;
      }
      if (x === entranceX && y === entranceY) {
        setTile(map, x, y, TileId.Path);
        continue;
      }
      if (isInRecyclingCenter(x, y, true)) {
        const truckBay = x <= ox + 2 && y <= oy + 2;
        setTile(map, x, y, truckBay ? TileId.Path : TileId.Plaza);
      }
    }
  }

  if (isInMap(entranceX, entranceY - 1)) {
    const t = map[entranceY - 1][entranceX];
    if (!isRoadFamily(t) && !BUILDING_TILES.has(t)) {
      setTile(map, entranceX, entranceY - 1, TileId.Sidewalk);
    }
  }

  deco.push(
    { id: 'rc-sign-main', x: entranceX, y: entranceY + 1, kind: 'emoji', emoji: '🪧', label: '回收總部' },
    { id: 'rc-truck', x: ox + 1, y: oy + 1, kind: 'emoji', emoji: '🚛', label: '清潔車' },
    { id: 'rc-recycle', x: ox + 4, y: oy + 1, kind: 'emoji', emoji: '♻️', label: '資源回收' },
    { id: 'rc-broom', x: ox + 5, y: oy + 2, kind: 'emoji', emoji: '🧹' },
  );

  const dirtySpecs: { id: string; x: number; y: number; trash: boolean; box: boolean }[] = [
    { id: 'dirty-rc-trash', x: ox + 2, y: oy + h - 2, trash: true, box: false },
    { id: 'dirty-rc-box', x: ox + 5, y: oy + h - 2, trash: false, box: true },
    { id: 'dirty-rc-pile', x: ox + 6, y: oy + h - 3, trash: true, box: true },
  ];

  dirtySpecs.forEach(({ id, x, y, trash, box }) => {
    if (!isInRecyclingCenter(x, y, true)) return;
    reserved.add(`${x},${y}`);
    if (trash) deco.push({ id: `${id}-trash`, x, y, kind: 'trash' });
    if (box) {
      const bx = trash ? x + 1 : x;
      if (isInRecyclingCenter(bx, y, true)) {
        deco.push({ id: `${id}-box`, x: bx, y, kind: 'box' });
      }
    }
    spots.push({ id, x, y, zone: 'warehouse' });
  });

  reserved.add(`${captain.x},${captain.y}`);

  return spots;
}

/** 衛教主題髒亂點：僅商店牆角、死巷、回收基地 */
function paintDirtySpots(
  map: TileId[][],
  deco: MapDecoration[],
  reserved: Set<string>,
): DirtySpot[] {
  const spots: DirtySpot[] = [];
  const zoneCounts: Record<DirtySpot['zone'], number> = {
    restaurant: 0,
    clinic: 0,
    warehouse: 0,
  };
  const usedCells = new Set<string>();

  const tryPlaceTrash = (
    x: number,
    y: number,
    zone: DirtySpot['zone'],
    id: string,
    withBox = false,
  ): boolean => {
    const key = `${x},${y}`;
    if (usedCells.has(key)) return false;
    if (zoneCounts[zone] >= TRASH_MAX_PER_ZONE[zone]) return false;
    if (!isValidTrashGround(map, x, y)) return false;
    if (!isAdjacentToWall(map, x, y) && !isAlleyCell(map, x, y)) return false;
    if (reserved.has(key)) return false;

    usedCells.add(key);
    zoneCounts[zone]++;
    reserved.add(key);
    deco.push({ id: `${id}-trash`, x, y, kind: 'trash' });
    if (withBox) {
      const bx = x + 1;
      if (
        isInMap(bx, y) &&
        isValidTrashGround(map, bx, y) &&
        !usedCells.has(`${bx},${y}`) &&
        !reserved.has(`${bx},${y}`)
      ) {
        usedCells.add(`${bx},${y}`);
        reserved.add(`${bx},${y}`);
        deco.push({ id: `${id}-box`, x: bx, y, kind: 'box' });
      }
    }
    spots.push({ id, x, y, zone });
    return true;
  };

  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      if (map[y][x] !== TileId.Wall) continue;
      const zone = getZone(x);
      if (zoneCounts[zone] >= TRASH_MAX_PER_ZONE[zone]) continue;

      [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(([dx, dy], i) => {
        const nx = x + dx;
        const ny = y + dy;
        if (!isInMap(nx, ny)) return;
        if (!isValidTrashGround(map, nx, ny)) return;
        if (!isAdjacentToWall(map, nx, ny)) return;
        tryPlaceTrash(nx, ny, zone, `dirty-${zone}-wall-${x}-${y}-${i}`, hash(nx, ny, 70) % 2 === 0);
      });
    }
  }

  ALLEY_SEGMENTS.forEach(([x1, y1, x2, y2], segIdx) => {
    forEachLine(x1, y1, x2, y2, (x, y) => {
      if (map[y][x] !== TileId.Path) return;
      const zone = getZone(x);
      if (zoneCounts[zone] >= TRASH_MAX_PER_ZONE[zone]) return;
      if (!countWallNeighbors(map, x, y) && !isAdjacentToWall(map, x, y)) return;
      tryPlaceTrash(x, y, zone, `dirty-alley-${segIdx}-${x}-${y}`, hash(x, y, 71) % 3 === 0);
    });
  });

  return spots;
}

/** 公園樹叢：有機聚集 */
function paintParkClusters(map: TileId[][], deco: MapDecoration[], reserved: Set<string>) {
  PARK_CLUSTERS.forEach(({ cx, cy, r, id }) => {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const x = cx + dx;
        const y = cy + dy;
        if (!isInMap(x, y)) continue;
        if (reserved.has(`${x},${y}`)) continue;
        const t = map[y][x];
        if (isRoadFamily(t) || t === TileId.Sidewalk || BUILDING_TILES.has(t)) continue;

        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        if (dist === 0) {
          setTile(map, x, y, TileId.FlowerBed);
          reserved.add(`${x},${y}`);
        } else if (dist === r && hash(x, y, 80) % 4 !== 0) {
          setTile(map, x, y, TileId.Tree);
          reserved.add(`${x},${y}`);
        } else if (dist === r - 1 && hash(x, y, 81) % 5 === 0) {
          setTile(map, x, y, TileId.Tree);
          reserved.add(`${x},${y}`);
        } else if (t === TileId.Grass || t === TileId.GrassDark) {
          setTile(map, x, y, TileId.GrassDark);
        }
      }
    }
    deco.push({
      id: `${id}-bench`,
      x: cx + r,
      y: cy,
      kind: 'bench',
    });
  });
}

/** 行道樹：沿主幹道人行道外側草地，等距排列 */
function paintStreetTrees(map: TileId[][], reserved: Set<string>) {
  MAIN_ROAD_H.forEach((roadY) => {
    for (let x = 5; x < GRID_WIDTH - 5; x += STREET_TREE_SPACING) {
      if (isMainRoadIntersection(x, roadY)) continue;
      if (isInRoundaboutFootprint(x, roadY, 1)) continue;

      for (const sy of [roadY - 1, roadY + 1]) {
        if (!isInMap(x, sy) || map[sy][x] !== TileId.Sidewalk) continue;
        const gy = sy < roadY ? sy - 1 : sy + 1;
        if (!isInMap(x, gy)) continue;
        if (reserved.has(`${x},${gy}`)) continue;
        const gt = map[gy][x];
        if (gt === TileId.Grass || gt === TileId.GrassDark) {
          setTile(map, x, gy, TileId.Tree);
          reserved.add(`${x},${gy}`);
        }
      }
    }
  });

  MAIN_ROAD_V.forEach((roadX) => {
    for (let y = 5; y < GRID_HEIGHT - 5; y += STREET_TREE_SPACING) {
      if (isMainRoadIntersection(roadX, y)) continue;
      if (isInRoundaboutFootprint(roadX, y, 1)) continue;

      for (const sx of [roadX - 1, roadX + 1]) {
        if (!isInMap(sx, y) || map[y][sx] !== TileId.Sidewalk) continue;
        const gx = sx < roadX ? sx - 1 : sx + 1;
        if (!isInMap(gx, y)) continue;
        if (reserved.has(`${gx},${y}`)) continue;
        const gt = map[y][gx];
        if (gt === TileId.Grass || gt === TileId.GrassDark) {
          setTile(map, gx, y, TileId.Tree);
          reserved.add(`${gx},${y}`);
        }
      }
    }
  });
}

/** 有組織的花圃：窗下、花店門口 */
function paintOrganizedFlowers(
  map: TileId[][],
  meta: (BuildingCellMeta | null)[][],
  deco: MapDecoration[],
  reserved: Set<string>,
) {
  for (let y = 1; y < GRID_HEIGHT - 1; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      const cell = meta[y][x];
      if (!cell || cell.part !== 'window') continue;

      const belowY = y + 1;
      if (!isInMap(x, belowY)) continue;
      const below = map[belowY][x];
      if (below !== TileId.Grass && below !== TileId.GrassDark && below !== TileId.Sidewalk && below !== TileId.Path) continue;
      if (reserved.has(`${x},${belowY}`)) continue;
      if (hash(x, y, 50) % 3 !== 0) continue;

      setTile(map, x, belowY, TileId.FlowerBed);
      reserved.add(`${x},${belowY}`);
    }
  }

  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      const cell = meta[y][x];
      if (!cell || cell.part !== 'door' || cell.theme !== 'flower') continue;
      [[x - 1, y + 1], [x + 1, y + 1]].forEach(([fx, fy], i) => {
        if (!isInMap(fx, fy)) return;
        if (reserved.has(`${fx},${fy}`)) return;
        const t = map[fy][fx];
        if (t === TileId.Grass || t === TileId.GrassDark || t === TileId.Sidewalk || t === TileId.Path) {
          deco.push({ id: `flower-shop-${x}-${i}`, x: fx, y: fy, kind: 'flowers', variant: i });
        }
      });
    }
  }
}

function isIntersection(x: number, y: number, map: TileId[][]) {
  if (!isInMap(x, y)) return false;
  if (!isRoadFamily(map[y][x])) return false;
  let roadNeighbors = 0;
  [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(([dx, dy]) => {
    const t = map[y + dy]?.[x + dx];
    if (t !== undefined && isRoadFamily(t)) roadNeighbors++;
  });
  return roadNeighbors >= 3;
}

function isMainRoadIntersection(x: number, y: number): boolean {
  return MAIN_ROAD_H.includes(y) && MAIN_ROAD_V.includes(x);
}

/** 主幹道車道中心線方向（路口與廣場內不畫） */
export function getMainRoadLaneMark(x: number, y: number, tileId: TileId): 'h' | 'v' | null {
  if (!isRoadFamily(tileId)) return null;
  if (isMainRoadIntersection(x, y)) return null;

  /* 噴水池圓環（含環狀車道）不畫主幹道黃色中心線 */
  if (roundaboutRing(x, y) !== null) return null;

  if (MAIN_ROAD_H.includes(y)) return 'h';
  if (MAIN_ROAD_V.includes(x)) return 'v';
  return null;
}

const MANHOLE_SPACING = 12;
const LAMP_SPACING = 6;

function paintPlannedStreetMarkings(map: TileId[][]) {
  MAIN_ROAD_H.forEach((roadY) => {
    for (let x = 3; x < GRID_WIDTH - 3; x += MANHOLE_SPACING) {
      if (isMainRoadIntersection(x, roadY)) continue;
      if (isInRoundaboutFootprint(x, roadY)) continue;
      if (!isRoadFamily(map[roadY][x])) continue;
      setRoadDetail(x, roadY, 'manhole');
    }
  });

  MAIN_ROAD_V.forEach((roadX) => {
    for (let y = 3; y < GRID_HEIGHT - 3; y += MANHOLE_SPACING) {
      if (isMainRoadIntersection(roadX, y)) continue;
      if (isInRoundaboutFootprint(roadX, y)) continue;
      if (!isRoadFamily(map[y][roadX])) continue;
      setRoadDetail(roadX, y, 'manhole');
    }
  });

  MAIN_ROAD_H.forEach((hy) => {
    MAIN_ROAD_V.forEach((vx) => {
      const setZebra = (sx: number, sy: number, detail: RoadDetail) => {
        if (!isInMap(sx, sy)) return;
        if (map[sy][sx] !== TileId.Sidewalk) return;
        setRoadDetail(sx, sy, detail);
      };
      setZebra(vx, hy - 1, 'zebra-h');
      setZebra(vx, hy + 1, 'zebra-h');
      setZebra(vx - 1, hy, 'zebra-v');
      setZebra(vx + 1, hy, 'zebra-v');
    });
  });
}

function paintStreetInfrastructure(map: TileId[][], deco: MapDecoration[]) {
  const occupied = new Set(deco.map((d) => `${d.x},${d.y}`));

  const placeLamp = (x: number, y: number, id: string) => {
    const key = `${x},${y}`;
    if (occupied.has(key)) return;
    if (!isInMap(x, y)) return;
    if (map[y][x] !== TileId.Sidewalk) return;
    if (isInRecyclingCenter(x, y)) return;
    const detail = getRoadDetail(x, y);
    if (detail === 'zebra-h' || detail === 'zebra-v') return;
    occupied.add(key);
    deco.push({ id, x, y, kind: 'lamp' });
  };

  MAIN_ROAD_H.forEach((roadY) => {
    let northSide = roadY % 2 === 0;
    for (let x = 4; x < GRID_WIDTH - 4; x += LAMP_SPACING) {
      if (isMainRoadIntersection(x, roadY)) continue;
      if (isInRoundaboutFootprint(x, roadY, 1)) continue;
      const sy = northSide ? roadY - 1 : roadY + 1;
      placeLamp(x, sy, `lamp-h-${x}-${sy}`);
      northSide = !northSide;
    }
  });

  MAIN_ROAD_V.forEach((roadX) => {
    let westSide = roadX % 2 === 0;
    for (let y = 4; y < GRID_HEIGHT - 4; y += LAMP_SPACING) {
      if (isMainRoadIntersection(roadX, y)) continue;
      if (isInRoundaboutFootprint(roadX, y, 1)) continue;
      const sx = westSide ? roadX - 1 : roadX + 1;
      placeLamp(sx, y, `lamp-v-${sx}-${y}`);
      westSide = !westSide;
    }
  });

  const { x: cx, y: cy } = ROUNDABOUT_CENTER;
  placeLamp(cx, cy - 3, 'lamp-rb-n');
  placeLamp(cx, cy + 3, 'lamp-rb-s');
  placeLamp(cx - 3, cy, 'lamp-rb-w');
  placeLamp(cx + 3, cy, 'lamp-rb-e');

  MAIN_ROAD_H.forEach((hy) => {
    MAIN_ROAD_V.forEach((vx) => {
      const corners: [number, number][] = [
        [vx - 1, hy - 1],
        [vx + 1, hy - 1],
        [vx - 1, hy + 1],
        [vx + 1, hy + 1],
      ];
      for (const [tx, ty] of corners) {
        const key = `${tx},${ty}`;
        if (occupied.has(key)) continue;
        if (!isInMap(tx, ty)) continue;
        if (map[ty][tx] !== TileId.Sidewalk) continue;
        occupied.add(key);
        deco.push({ id: `traffic-${vx}-${hy}`, x: tx, y: ty, kind: 'traffic' });
        break;
      }
    });
  });
}

function isSidewalkGrassEdge(map: TileId[][], x: number, y: number): boolean {
  if (map[y][x] !== TileId.Sidewalk) return false;
  return [[0, -1], [0, 1], [-1, 0], [1, 0]].some(([dx, dy]) => {
    const t = map[y + dy]?.[x + dx];
    return t === TileId.Grass || t === TileId.GrassDark;
  });
}

function paintBenches(map: TileId[][], deco: MapDecoration[]) {
  const occupied = new Set(deco.map((d) => `${d.x},${d.y}`));

  const tryBench = (x: number, y: number, id: string) => {
    const key = `${x},${y}`;
    if (occupied.has(key)) return;
    if (!isInMap(x, y)) return;
    const t = map[y][x];
    if (t !== TileId.Sidewalk && t !== TileId.Plaza) return;
    if (t === TileId.Sidewalk && !isSidewalkGrassEdge(map, x, y)) return;
    occupied.add(key);
    deco.push({ id, x, y, kind: 'bench' });
  };

  MAIN_ROAD_H.forEach((roadY) => {
    for (let x = 6; x < GRID_WIDTH - 6; x += 12) {
      if (isMainRoadIntersection(x, roadY)) continue;
      tryBench(x, roadY - 1, `bench-h-n-${x}-${roadY}`);
      tryBench(x, roadY + 1, `bench-h-s-${x}-${roadY}`);
    }
  });
}

function paintStreetProps(map: TileId[][], deco: MapDecoration[]) {
  const occupied = new Set(deco.map((d) => `${d.x},${d.y}`));

  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      if (map[y][x] !== TileId.Sidewalk) continue;
      if (occupied.has(`${x},${y}`)) continue;
      if (isInRoundaboutFootprint(x, y)) continue;
      if (!isSidewalkGrassEdge(map, x, y)) continue;
      if (getRoadDetail(x, y) || getRoadDetail(x, y - 1) || getRoadDetail(x, y + 1)) continue;
      if (isIntersection(x, y, map) || isIntersection(x, y - 1, map) || isIntersection(x, y + 1, map)) continue;

      const h = hash(x, y, 30);
      if (h % 53 === 0) {
        deco.push({ id: `mail-${x}-${y}`, x, y, kind: 'mailbox' });
      } else if (h % 59 === 0) {
        deco.push({ id: `sign-${x}-${y}`, x, y, kind: 'signpost' });
      }
    }
  }

  deco.push(
    { id: 'school', x: 2, y: 6, kind: 'emoji', emoji: '🏫', label: '學校' },
  );
}

function paintGrassVariation(map: TileId[][]) {
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      if (map[y][x] === TileId.Grass && hash(x, y) % 5 === 0) {
        map[y][x] = TileId.GrassDark;
      }
    }
  }
}

function countBuildingNeighbors(map: TileId[][], x: number, y: number): number {
  return [[0, -1], [0, 1], [-1, 0], [1, 0]].filter(([dx, dy]) => {
    const nx = x + dx;
    const ny = y + dy;
    return isInMap(nx, ny) && isBuildingTileId(map[ny][nx]);
  }).length;
}

function isAdjacentToDoor(map: TileId[][], x: number, y: number): boolean {
  return [[0, -1], [0, 1], [-1, 0], [1, 0]].some(([dx, dy]) => {
    const nx = x + dx;
    const ny = y + dy;
    return isInMap(nx, ny) && map[ny][nx] === TileId.Door;
  });
}

function isAdjacentToDirtySpot(x: number, y: number, dirtySpots: DirtySpot[]): boolean {
  return dirtySpots.some((s) => Math.abs(s.x - x) + Math.abs(s.y - y) === 1);
}

function findRecyclingRatSpot(
  map: TileId[][],
  meta: (BuildingCellMeta | null)[][],
  spot: DirtySpot,
  deco: MapDecoration[],
  reserved: Set<string>,
  used: Set<string>,
): RatCandidate | null {
  const neighbors: RatCandidate[] = [];
  [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(([dx, dy]) => {
    const x = spot.x + dx;
    const y = spot.y + dy;
    const key = `${x},${y}`;
    if (!isInRecyclingCenter(x, y, true)) return;
    if (!isValidRatSpawn(map, meta, x, y, deco, reserved)) return;
    if (used.has(key)) return;
    neighbors.push({ x, y, score: 100, zone: 'warehouse', hint: 'dirty', dirtyId: spot.id });
  });
  neighbors.sort((a, b) => hash(b.x, b.y, 60) - hash(a.x, a.y, 60));
  return neighbors[0] ?? null;
}

function collectRatCandidates(
  map: TileId[][],
  meta: (BuildingCellMeta | null)[][],
  deco: MapDecoration[],
  dirtySpots: DirtySpot[],
  reserved: Set<string>,
): RatCandidate[] {
  const candidates: RatCandidate[] = [];

  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      if (!isValidRatSpawn(map, meta, x, y, deco, reserved)) continue;

      const zone = getZone(x);
      let score = 40;
      let hint: RatCandidate['hint'] = 'alley';

      if (isAdjacentToTrashDeco(x, y, deco) || isAdjacentToDirtySpot(x, y, dirtySpots)) {
        score = 100;
        hint = 'dirty';
      } else if (countWallNeighbors(map, x, y) >= 2) {
        score = 80;
        hint = 'corner';
      } else if (isAdjacentToWall(map, x, y)) {
        score = 60;
        hint = 'alley';
      }

      if (map[y][x] === TileId.Path && isAlleyCell(map, x, y)) {
        score += 10;
        hint = 'alley';
      }

      candidates.push({ x, y, score, zone, hint });
    }
  }

  return candidates.sort((a, b) => b.score - a.score || hash(a.x, a.y) - hash(b.x, b.y));
}

function pickCandidate(
  pool: RatCandidate[],
  zone: RatCandidate['zone'],
  used: Set<string>,
  preferHint?: RatCandidate['hint'],
): RatCandidate | null {
  const filtered = pool.filter(
    (c) => c.zone === zone && !used.has(`${c.x},${c.y}`) && (!preferHint || c.hint === preferHint),
  );
  if (filtered.length === 0) {
    const fallback = pool.find((c) => c.zone === zone && !used.has(`${c.x},${c.y}`));
    return fallback ?? null;
  }
  return filtered[0];
}

/** 任務老鼠：僅可行走地面且緊鄰牆壁或髒亂物 */
function generateQuestPoints(
  map: TileId[][],
  meta: (BuildingCellMeta | null)[][],
  dirtySpots: DirtySpot[],
  reserved: Set<string>,
  deco: MapDecoration[],
): QuestPoint[] {
  const used = new Set<string>();
  const points: QuestPoint[] = [];
  const candidates = collectRatCandidates(map, meta, deco, dirtySpots, reserved);

  const zoneQuests: { questionId: number; zone: RatCandidate['zone']; prefer?: RatCandidate['hint'] }[] = [
    { questionId: 1, zone: 'clinic', prefer: 'corner' },
    { questionId: 2, zone: 'clinic', prefer: 'corner' },
    { questionId: 3, zone: 'clinic', prefer: 'alley' },
    { questionId: 4, zone: 'clinic', prefer: 'alley' },
    { questionId: 5, zone: 'restaurant', prefer: 'alley' },
    { questionId: 6, zone: 'restaurant', prefer: 'dirty' },
    { questionId: 7, zone: 'restaurant', prefer: 'corner' },
    { questionId: 8, zone: 'warehouse', prefer: 'dirty' },
    { questionId: 9, zone: 'warehouse', prefer: 'dirty' },
    { questionId: 10, zone: 'warehouse', prefer: 'dirty' },
  ];

  const warehouseDirty = dirtySpots.filter((s) => s.zone === 'warehouse');
  const forcedDirty = [8, 9, 10];

  forcedDirty.forEach((qId, i) => {
    const spot = warehouseDirty[i];
    if (!spot) return;
    const rat = findRecyclingRatSpot(map, meta, spot, deco, reserved, used);
    if (!rat) return;
    used.add(`${rat.x},${rat.y}`);
    reserved.add(`${rat.x},${rat.y}`);
    points.push({ questionId: qId, x: rat.x, y: rat.y });
  });

  zoneQuests.forEach(({ questionId, zone, prefer }) => {
    if (points.some((p) => p.questionId === questionId)) return;
    const pick = pickCandidate(candidates, zone, used, prefer)
      ?? pickCandidate(candidates, zone, used);
    if (!pick) return;
    if (!isValidRatSpawn(map, meta, pick.x, pick.y, deco, new Set())) return;
    used.add(`${pick.x},${pick.y}`);
    reserved.add(`${pick.x},${pick.y}`);
    points.push({ questionId, x: pick.x, y: pick.y });
  });

  return points
    .filter((p) => isValidRatSpawn(map, meta, p.x, p.y, deco, new Set()))
    .sort((a, b) => a.questionId - b.questionId);
}

function isDeadEndSpot(map: TileId[][], x: number, y: number): boolean {
  const t = map[y][x];
  if (t !== TileId.Path && t !== TileId.Grass && t !== TileId.GrassDark) return false;
  let exits = 0;
  [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(([dx, dy]) => {
    const nx = x + dx;
    const ny = y + dy;
    if (!isInMap(nx, ny)) return;
    const nt = map[ny][nx];
    if (WALKABLE_TILES.has(nt) && !isRoadFamily(nt) && nt !== TileId.Tree && nt !== TileId.Fountain) {
      exits++;
    }
  });
  return exits <= 1;
}

function isBehindBuildingWall(
  map: TileId[][],
  meta: (BuildingCellMeta | null)[][],
  x: number,
  y: number,
): boolean {
  return [[0, -1], [0, 1], [-1, 0], [1, 0]].some(([dx, dy]) => {
    const nx = x + dx;
    const ny = y + dy;
    if (!isInMap(nx, ny)) return false;
    if (map[ny][nx] === TileId.Wall) return true;
    const part = meta[ny][nx]?.part;
    return part === 'wall' || part === 'window';
  });
}

function isDeepParkSpot(map: TileId[][], x: number, y: number): boolean {
  const t = map[y][x];
  if (t !== TileId.Grass && t !== TileId.GrassDark) return false;
  return [[0, -1], [0, 1], [-1, 0], [1, 0]].filter(([dx, dy]) => {
    const nx = x + dx;
    const ny = y + dy;
    return isInMap(nx, ny) && map[ny][nx] === TileId.Tree;
  }).length >= 2;
}

/** 隱藏寶物：建築後方、死巷、樹叢深處 */
function generateTreasures(
  map: TileId[][],
  meta: (BuildingCellMeta | null)[][],
  questPoints: QuestPoint[],
  reserved: Set<string>,
): TreasureSpot[] {
  const blocked = new Set(reserved);
  questPoints.forEach((p) => blocked.add(`${p.x},${p.y}`));
  Object.values(NPC_GRID_POSITIONS).forEach((p) => blocked.add(`${p.x},${p.y}`));
  blocked.add(`${PLAYER_START.x},${PLAYER_START.y}`);

  const candidates: { x: number; y: number; score: number }[] = [];

  for (let y = 1; y < GRID_HEIGHT - 1; y++) {
    for (let x = 1; x < GRID_WIDTH - 1; x++) {
      const key = `${x},${y}`;
      if (blocked.has(key)) continue;
      if (meta[y][x]) continue;

      const t = map[y][x];
      if (t !== TileId.Grass && t !== TileId.GrassDark && t !== TileId.Path) continue;
      if (isRoadFamily(t) || isOnMainRoadSurface(map, x, y)) continue;

      let score = 0;
      if (isDeadEndSpot(map, x, y)) score += 55;
      if (isBehindBuildingWall(map, meta, x, y)) score += 45;
      if (isAlleyCell(map, x, y)) score += 35;
      if (isDeepParkSpot(map, x, y)) score += 40;
      if (countWallNeighbors(map, x, y) >= 2) score += 25;

      if (score >= 35) candidates.push({ x, y, score });
    }
  }

  candidates.sort((a, b) => b.score - a.score || hash(a.x, a.y, 90) - hash(b.x, b.y, 90));

  const targetCount = Math.max(3, 3 + (hash(42, 99, 7) % 3));
  const requiredItemOrder = shuffledTreasureItemOrder(hash(42, 99, 7));
  const spots: TreasureSpot[] = [];
  const used = new Set<string>();

  for (const c of candidates) {
    if (spots.length >= targetCount) break;
    const key = `${c.x},${c.y}`;
    if (used.has(key)) continue;
    const tooClose = spots.some((s) => Math.abs(s.x - c.x) + Math.abs(s.y - c.y) < 4);
    if (tooClose) continue;

    used.add(key);
    const variant: TreasureVariant = hash(c.x, c.y, 91) % 2 === 0 ? 'chest' : 'sparkle';
    const itemId = treasureItemIdForSpot(spots.length, c.x, c.y, requiredItemOrder);
    const item = PREVENTION_ITEMS_BY_ID[itemId];
    spots.push({
      id: `treasure-${spots.length + 1}`,
      x: c.x,
      y: c.y,
      variant,
      itemId,
      label: item.name,
    });
  }

  return spots;
}

export function generateMap(): TileId[][] {
  const map = createEmptyMap();
  const meta = createEmptyMeta<BuildingCellMeta | null>();
  const deco: MapDecoration[] = [];
  const reserved = buildReserved();

  roadDetailGrid = createEmptyMeta<RoadDetail | null>();

  paintMainRoadGrid(map);
  paintSecondaryAlleys(map);
  cleanupDisconnectedPaths(map);
  paintOrganicDistricts(map, meta, deco, reserved);
  paintLandmarks(map, meta, reserved);
  paintRoundaboutPlaza(map, deco);
  const recycleDirtySpots = paintRecyclingCenterBase(map, deco, reserved);
  const dirtySpots = [...paintDirtySpots(map, deco, reserved), ...recycleDirtySpots];
  paintOrganizedFlowers(map, meta, deco, reserved);
  paintParkClusters(map, deco, reserved);
  paintStreetTrees(map, reserved);
  paintPlannedStreetMarkings(map);
  paintStreetInfrastructure(map, deco);
  paintBenches(map, deco);
  paintStreetProps(map, deco);
  paintGrassVariation(map);
  paintTownEntrance(map, deco);
  paintMapEdgeForest(map);

  buildingMetaGrid = meta;
  MAP_DECORATIONS = deco;
  QUEST_POINTS = generateQuestPoints(map, meta, dirtySpots, reserved, deco);
  TREASURE_SPOTS = generateTreasures(map, meta, QUEST_POINTS, reserved);
  return map;
}

export const TILEMAP = generateMap();

export function getTileId(x: number, y: number): TileId {
  if (!isInMap(x, y)) return TileId.Grass;
  return TILEMAP[y][x];
}

export function getTileClassName(x: number, y: number): string {
  return TILE_CLASSES[getTileId(x, y)] ?? 'tile-grass';
}

export function isRoadTile(x: number, y: number): boolean {
  const id = getTileId(x, y);
  return WALKABLE_TILES.has(id) && id !== TileId.Grass && id !== TileId.GrassDark;
}

export function isTreeTile(x: number, y: number): boolean {
  return getTileId(x, y) === TileId.Tree;
}

export function isBuildingTile(x: number, y: number): boolean {
  return BUILDING_TILES.has(getTileId(x, y));
}

export function isBlockedTile(x: number, y: number): boolean {
  return BLOCKING_TILES.has(getTileId(x, y));
}

export function isWalkableGround(x: number, y: number): boolean {
  return WALKABLE_TILES.has(getTileId(x, y));
}

export function touchesRoadOrSidewalk(x: number, y: number): boolean {
  const neighbors = [[0, -1], [0, 1], [-1, 0], [1, 0]] as const;
  return neighbors.some(([dx, dy]) => {
    const t = getTileId(x + dx, y + dy);
    return isRoadFamily(t) || t === TileId.Sidewalk || t === TileId.Path;
  });
}

export function touchesGrass(x: number, y: number): boolean {
  const neighbors = [[0, -1], [0, 1], [-1, 0], [1, 0]] as const;
  return neighbors.some(([dx, dy]) => {
    const t = getTileId(x + dx, y + dy);
    return t === TileId.Grass || t === TileId.GrassDark || t === TileId.FlowerBed;
  });
}

function isRoadFamilyTile(t: TileId): boolean {
  return t === TileId.Road || t === TileId.RoadDashH || t === TileId.RoadDashV;
}

export function touchesRoad(x: number, y: number): boolean {
  const neighbors = [[0, -1], [0, 1], [-1, 0], [1, 0]] as const;
  return neighbors.some(([dx, dy]) => isRoadFamilyTile(getTileId(x + dx, y + dy)));
}

export function isRoundaboutTile(x: number, y: number): boolean {
  return isInRoundaboutFootprint(x, y);
}

export function getRoundaboutRing(x: number, y: number): number | null {
  return roundaboutRing(x, y);
}
