import {
  GRID_WIDTH,
  GRID_HEIGHT,
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
  /** 城鎮邊界石牆（非建築牆） */
  TownWall = 17,
  /** 城牆上的封閉城門（幹道邊界） */
  TownGate = 18,
  /** 護城河／水域屏障 */
  Moat = 19,
  /** 道路遇護城河時，城門外側的木橋（視覺通道，仍不可通行） */
  Pier = 20,
  /** 城門外側護城河上的木橋 */
  Bridge = 21,
  /** 南側主城門（唯一進城起點地標） */
  MainGate = 22,
  /** 農田／菜園 */
  Farmland = 23,
}

export type BuildingPart = 'roof' | 'wall' | 'window' | 'door';
/** 店門朝向（面向道路的一側） */
export type BuildingFacing = 'south' | 'north' | 'east' | 'west';
export type RoadDetail = 'zebra-h' | 'zebra-v' | 'manhole';

export type ShopThemeId =
  | 'home'
  | 'house_red'
  | 'house_blue'
  | 'house_gray'
  | 'bakery'
  | 'cafe'
  | 'grocery'
  | 'flower'
  | 'bookstore'
  | 'magic_library'
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

const MAP_EDGE_WALL_DEPTH = 1;
/** 護城河環帶（緊鄰城牆內側） */
const MAP_MOAT_DEPTH = 1;
/** 城牆+護城河以外的森林過渡深度 */
const MAP_FOREST_FRINGE_DEPTH = 4;
/** 城鎮南側進城通道保留深度 */
const TOWN_ENTRANCE_DEPTH = 3;

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
  house_gray: {
    roofGradient: 'bg-gradient-to-br from-slate-400 to-slate-700',
    wallClass: 'bg-stone-200',
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
    roofGradient: 'bg-gradient-to-br from-green-400 to-emerald-700',
    wallClass: 'bg-emerald-50',
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
  magic_library: {
    roofGradient: 'bg-gradient-to-br from-violet-500 to-purple-900',
    wallClass: 'bg-purple-50',
    awningClass: 'awning-strip-bookstore',
    emoji: '🔮',
    label: '魔法圖書館',
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
  'bakery', 'cafe', 'grocery', 'flower', 'bookstore', 'magic_library', 'diner', 'restaurant',
];
const HOUSE_POOL: ShopThemeId[] = ['house_red', 'house_blue', 'house_gray', 'home', 'home', 'house_gray'];

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
  [TileId.TownWall]: 'tile-town-wall',
  [TileId.TownGate]: 'tile-town-gate',
  [TileId.Moat]: 'tile-moat',
  [TileId.Pier]: 'tile-pier',
  [TileId.Bridge]: 'tile-bridge',
  [TileId.MainGate]: 'tile-main-gate',
  [TileId.Farmland]: 'tile-farmland',
};

const BORDER_BARRIER_TILES = new Set<TileId>([
  TileId.TownWall,
  TileId.TownGate,
  TileId.Moat,
  TileId.Bridge,
  TileId.Pier,
  TileId.MainGate,
]);

const STRUCTURE_TILES = new Set<TileId>([
  TileId.RoofHome, TileId.RoofShop, TileId.Wall, TileId.Window, TileId.Door,
]);
const BLOCKING_TILES = new Set<TileId>([
  TileId.Tree,
  TileId.Fountain,
  ...STRUCTURE_TILES,
  ...BORDER_BARRIER_TILES,
]);
const BUILDING_TILES = STRUCTURE_TILES;
const WALKABLE_TILES = new Set<TileId>([
  TileId.Grass, TileId.GrassDark, TileId.Sidewalk, TileId.Road, TileId.RoadDashH,
  TileId.RoadDashV, TileId.FlowerBed, TileId.Path, TileId.Plaza, TileId.Farmland,
]);

const MAIN_ROAD_H = [8, 15, 22];
const MAIN_ROAD_V = [10, 20, 30];

/** 南側主城門所在縱向幹道（地圖正下方進城主路） */
export const MAIN_GATE_ROAD_X = MAIN_ROAD_V[0];

export function getMainGateWallY(): number {
  return GRID_HEIGHT - 2;
}

export function getMainGatePosition(): { x: number; y: number } {
  return { x: MAIN_GATE_ROAD_X, y: getMainGateWallY() };
}

/** 主城門正上方、門內幹道起點 */
export function getPlayerSpawnPoint(): { x: number; y: number } {
  return { x: MAIN_GATE_ROAD_X, y: getMainGateWallY() - 1 };
}

/** 老鼠可生成的地面：草地、石磚人行道／廣場／巷弄 */
const RAT_GROUND_TILES = new Set<TileId>([
  TileId.Grass,
  TileId.GrassDark,
  TileId.Sidewalk,
  TileId.Path,
  TileId.Plaza,
  TileId.Farmland,
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
  /** 1～3：對應 enemyrat/rat1~3.png 行走圖 */
  ratType: 1 | 2 | 3;
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
  doorRowLocal: number,
  shop: boolean,
): CellBlueprint {
  const roofTile = shop ? TileId.RoofShop : TileId.RoofHome;

  if (doorFacing === 'south' || doorFacing === 'north') {
    const groundRow = doorFacing === 'south' ? h - 1 : 0;

    if (dy !== groundRow) {
      if (h >= 3 && dy === (doorFacing === 'south' ? h - 2 : 1)) {
        if (dx === 0 || dx === w - 1) return { tile: TileId.Window, part: 'window' };
        return { tile: TileId.Wall, part: 'wall' };
      }
      return { tile: roofTile, part: 'roof' };
    }

    if (dx === doorCol) return { tile: TileId.Door, part: 'door' };
    if (dx === 0 || dx === w - 1) return { tile: TileId.Window, part: 'window' };
    return { tile: TileId.Wall, part: 'wall' };
  }

  const faceCol = doorFacing === 'east' ? w - 1 : 0;

  if (dx !== faceCol) {
    return { tile: roofTile, part: 'roof' };
  }

  if (dy === doorRowLocal) return { tile: TileId.Door, part: 'door' };
  if (dy === 0 || dy === h - 1) return { tile: TileId.Window, part: 'window' };
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

  if (!hasAdjacentPlayerStandTile(map, meta, x, y, reserved)) return false;

  return true;
}

/** 老鼠格四周至少有一格可供玩家站立並按空白鍵互動（須用建構中的 map，不可讀全域 TILEMAP） */
function hasAdjacentPlayerStandTile(
  map: TileId[][],
  meta: (BuildingCellMeta | null)[][],
  x: number,
  y: number,
  reserved: Set<string>,
): boolean {
  return [[0, -1], [0, 1], [-1, 0], [1, 0]].some(([dx, dy]) => {
    const nx = x + dx;
    const ny = y + dy;
    if (!isInMap(nx, ny)) return false;
    if (reserved.has(`${nx},${ny}`)) return false;
    if (meta[ny][nx]) return false;
    const t = map[ny][nx];
    if (BLOCKING_TILES.has(t)) return false;
    if (!WALKABLE_TILES.has(t)) return false;
    if (t === TileId.Tree || t === TileId.Fountain || t === TileId.FlowerBed) return false;
    if (BORDER_BARRIER_TILES.has(t)) return false;
    return true;
  });
}

function buildReserved(): Set<string> {
  const r = new Set<string>();
  const spawn = getPlayerSpawnPoint();
  r.add(`${spawn.x},${spawn.y}`);
  Object.values(NPC_GRID_POSITIONS).forEach((p) => {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = p.x + dx;
        const ny = p.y + dy;
        if (isInMap(nx, ny)) r.add(`${nx},${ny}`);
      }
    }
  });
  return r;
}

function markReservedFootprint(reserved: Set<string>, x: number, y: number, w: number, h: number) {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) reserved.add(`${x + dx},${y + dy}`);
  }
}

function canPlaceFootprint(
  map: TileId[][],
  meta: (BuildingCellMeta | null)[][],
  x: number,
  y: number,
  w: number,
  h: number,
  reserved: Set<string>,
): boolean {
  if (w < 2 || h < 2) return false;

  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      const px = x + dx;
      const py = y + dy;
      if (!isInMap(px, py)) return false;
      if (reserved.has(`${px},${py}`)) return false;
      if (meta[py][px]) return false;
      const t = map[py][px];
      if (isRoadFamily(t) || t === TileId.Sidewalk || t === TileId.Plaza || t === TileId.Fountain) {
        return false;
      }
      if (isBuildingTileId(t) || t === TileId.Tree || t === TileId.Pond || t === TileId.Farmland) {
        return false;
      }
      if (BORDER_BARRIER_TILES.has(t)) return false;
    }
  }
  return true;
}

function canReachRoadWithin(map: TileId[][], sx: number, sy: number, maxSteps: number): boolean {
  const visited = new Set<string>();
  const queue: [number, number, number][] = [[sx, sy, 0]];
  visited.add(`${sx},${sy}`);

  while (queue.length > 0) {
    const [x, y, steps] = queue.shift()!;
    const t = map[y][x];
    if (isRoadFamily(t)) return true;
    if (steps >= maxSteps) continue;

    [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(([dx, dy]) => {
      const nx = x + dx;
      const ny = y + dy;
      const key = `${nx},${ny}`;
      if (!isInMap(nx, ny) || visited.has(key)) return;
      const nt = map[ny][nx];
      if (
        isRoadFamily(nt) ||
        nt === TileId.Sidewalk ||
        nt === TileId.Path ||
        isNature(nt)
      ) {
        visited.add(key);
        queue.push([nx, ny, steps + 1]);
      }
    });
  }
  return false;
}

function getDoorColumn(w: number, doorFacing: BuildingFacing, doorSlot?: number): number {
  if (doorFacing === 'east') return w - 1;
  if (doorFacing === 'west') return 0;
  return Math.min(w - 1, Math.max(0, doorSlot ?? Math.floor(w / 2)));
}

function getDoorRowLocal(h: number, doorFacing: BuildingFacing, doorSlot?: number): number {
  if (doorFacing === 'south') return h - 1;
  if (doorFacing === 'north') return 0;
  return Math.min(h - 1, Math.max(0, doorSlot ?? Math.floor(h / 2)));
}

/** 門口外側第一格必須能鋪設人行道並連接車道 */
function canPlaceBuildingFacingRoad(
  map: TileId[][],
  meta: (BuildingCellMeta | null)[][],
  x: number,
  y: number,
  w: number,
  h: number,
  doorFacing: BuildingFacing,
  reserved: Set<string>,
  doorSlot?: number,
): boolean {
  if (!canPlaceFootprint(map, meta, x, y, w, h, reserved)) return false;

  const doorCol = getDoorColumn(w, doorFacing, doorSlot);
  const doorRowLocal = getDoorRowLocal(h, doorFacing, doorSlot);
  const doorX = x + doorCol;
  const doorY = y + doorRowLocal;

  const exterior: { ex: number; ey: number }[] = [];
  if (doorFacing === 'south') {
    for (let dx = 0; dx < w; dx++) exterior.push({ ex: x + dx, ey: doorY + 1 });
  } else if (doorFacing === 'north') {
    for (let dx = 0; dx < w; dx++) exterior.push({ ex: x + dx, ey: doorY - 1 });
  } else if (doorFacing === 'east') {
    exterior.push({ ex: doorX + 1, ey: doorY });
  } else {
    exterior.push({ ex: doorX - 1, ey: doorY });
  }

  return exterior.some(({ ex, ey }) => {
    if (!isInMap(ex, ey)) return false;
    const t = map[ey][ex];
    if (t === TileId.Sidewalk) return canReachRoadWithin(map, ex, ey, 8);
    if (isNature(t) || t === TileId.Path) return canReachRoadWithin(map, ex, ey, 8);
    return false;
  });
}

function paintBuildingLotSurround(
  map: TileId[][],
  x: number,
  y: number,
  w: number,
  h: number,
  doorFacing: BuildingFacing,
) {
  for (let dy = -1; dy <= h; dy++) {
    for (let dx = -1; dx <= w; dx++) {
      const px = x + dx;
      const py = y + dy;
      if (!isInMap(px, py)) continue;
      const onFootprint = dx >= 0 && dx < w && dy >= 0 && dy < h;
      if (onFootprint) continue;

      const isFront =
        (doorFacing === 'south' && dy === h && dx >= 0 && dx < w) ||
        (doorFacing === 'north' && dy === -1 && dx >= 0 && dx < w) ||
        (doorFacing === 'east' && dx === w && dy >= 0 && dy < h) ||
        (doorFacing === 'west' && dx === -1 && dy >= 0 && dy < h);

      const t = map[py][px];
      if (isFront) continue;
      if (isRoadFamily(t) || isBuildingTileId(t) || BORDER_BARRIER_TILES.has(t)) continue;
      if (t === TileId.Sidewalk || t === TileId.Plaza || t === TileId.Fountain) continue;
      if (t === TileId.Tree || t === TileId.Pond) continue;
      setTile(map, px, py, TileId.Grass);
    }
  }
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
  const wallY = getMainGateWallY();
  const maxSidewalkY = wallY - 1;

  MAIN_ROAD_H.forEach((y) => {
    for (let x = 0; x < GRID_WIDTH; x++) {
      setTile(map, x, y, TileId.Road);
      if (y > 0 && y - 1 <= maxSidewalkY && isNature(map[y - 1][x])) {
        setTile(map, x, y - 1, TileId.Sidewalk);
      }
      if (y < GRID_HEIGHT - 1 && y + 1 <= maxSidewalkY && isNature(map[y + 1][x])) {
        setTile(map, x, y + 1, TileId.Sidewalk);
      }
    }
  });

  MAIN_ROAD_V.forEach((x) => {
    for (let y = 0; y < GRID_HEIGHT; y++) {
      if (y > wallY) continue;
      setTile(map, x, y, TileId.Road);
      if (y >= wallY) continue;
      if (x > 0 && isNature(map[y][x - 1])) setTile(map, x - 1, y, TileId.Sidewalk);
      if (x < GRID_WIDTH - 1 && isNature(map[y][x + 1])) setTile(map, x + 1, y, TileId.Sidewalk);
    }
  });
}

/** 城鎮入口通道：外圍森林不覆蓋此區，保留進城路 */
function isTownEntranceGap(x: number, y: number): boolean {
  return y >= GRID_HEIGHT - TOWN_ENTRANCE_DEPTH && x >= 7 && x <= 12;
}

function edgeDistance(x: number, y: number): number {
  return Math.min(x, y, GRID_WIDTH - 1 - x, GRID_HEIGHT - 1 - y);
}

function isNaturalBorderTile(t: TileId): boolean {
  return t === TileId.Grass || t === TileId.GrassDark || t === TileId.FlowerBed;
}

function isBorderWallRing(x: number, y: number): boolean {
  return x === 1 || x === GRID_WIDTH - 2 || y === 1 || y === GRID_HEIGHT - 2;
}

function isBorderMoatRing(x: number, y: number): boolean {
  return x === 0 || x === GRID_WIDTH - 1 || y === 0 || y === GRID_HEIGHT - 1;
}

/** 最外圈護城河 + 第二圈連續城牆（嚴格覆寫邊緣陣列） */
function paintTownBorderBarrier(map: TileId[][]) {
  for (let x = 0; x < GRID_WIDTH; x++) {
    setTile(map, x, 0, TileId.Moat);
    setTile(map, x, GRID_HEIGHT - 1, TileId.Moat);
  }
  for (let y = 1; y < GRID_HEIGHT - 1; y++) {
    setTile(map, 0, y, TileId.Moat);
    setTile(map, GRID_WIDTH - 1, y, TileId.Moat);
  }

  for (let x = 1; x < GRID_WIDTH - 1; x++) {
    setTile(map, x, 1, TileId.TownWall);
    setTile(map, x, GRID_HEIGHT - 2, TileId.TownWall);
  }
  for (let y = 2; y < GRID_HEIGHT - 2; y++) {
    setTile(map, 1, y, TileId.TownWall);
    setTile(map, GRID_WIDTH - 2, y, TileId.TownWall);
  }
}

function forestTreeProbability(dist: number, x: number, y: number): number {
  const innerDist = dist - MAP_MOAT_DEPTH - MAP_EDGE_WALL_DEPTH;
  if (innerDist <= 0) return 0;
  const span = MAP_FOREST_FRINGE_DEPTH - MAP_MOAT_DEPTH - MAP_EDGE_WALL_DEPTH;
  const t = 1 - innerDist / span;
  const falloff = Math.max(0.04, t * 0.55);
  const jitter = (hash(x, y, 201) % 100) / 100 * 0.18;
  return Math.min(0.75, falloff + jitter);
}

/** 護城河內側：稀疏自然樹叢（不覆蓋道路與屏障） */
function paintInteriorForestFringe(map: TileId[][]) {
  MAP_EDGE_FOREST = new Set<string>();
  const fringeStart = MAP_EDGE_WALL_DEPTH + MAP_MOAT_DEPTH;

  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      if (isTownEntranceGap(x, y)) continue;

      const dist = edgeDistance(x, y);
      if (dist < fringeStart || dist >= MAP_FOREST_FRINGE_DEPTH) continue;

      const tile = map[y][x];
      if (
        isNetworkTile(tile) ||
        isBuildingTileId(tile) ||
        BORDER_BARRIER_TILES.has(tile) ||
        tile === TileId.Fountain ||
        tile === TileId.Pond ||
        tile === TileId.Farmland
      ) {
        continue;
      }

      if (!isNaturalBorderTile(tile)) continue;

      MAP_EDGE_FOREST.add(`${x},${y}`);
      const chance = forestTreeProbability(dist, x, y);
      const roll = (hash(x, y, 200) % 1000) / 1000;
      if (roll < chance) {
        setTile(map, x, y, TileId.Tree);
      } else {
        setTile(map, x, y, TileId.Grass);
      }
    }
  }
}

export function isMapEdgeForestCell(x: number, y: number): boolean {
  return MAP_EDGE_FOREST.has(`${x},${y}`);
}

/** 南側唯一主城門：縱向幹道與第二圈城牆交會處 */
function paintMainGate(map: TileId[][]) {
  const { x: gx, y: gy } = getMainGatePosition();

  setTile(map, gx, gy, TileId.MainGate);
  setTile(map, gx, GRID_HEIGHT - 1, TileId.Bridge);

  const spawn = getPlayerSpawnPoint();
  if (!isRoadFamily(map[spawn.y][spawn.x])) {
    setTile(map, spawn.x, spawn.y, TileId.Road);
  }
}

/** 城鎮入口廣場：僅在城牆內側鋪設，不覆蓋城牆列 */
function paintTownEntrance(map: TileId[][]) {
  const gateX = MAIN_GATE_ROAD_X;
  const wallY = getMainGateWallY();

  setTile(map, gateX - 1, wallY - 1, TileId.Plaza);

  for (let y = wallY - 2; y <= wallY - 1; y++) {
    for (let x = gateX - 2; x <= gateX + 1; x++) {
      if (x === gateX) continue;
      const t = map[y][x];
      if (!isRoadFamily(t) && !BUILDING_TILES.has(t) && t !== TileId.Plaza) {
        setTile(map, x, y, TileId.Sidewalk);
      }
    }
  }
}

/** 確保城牆／護城河環帶連續，清除誤蓋在邊界上的道路與人行道 */
function enforceBorderBarrierIntegrity(map: TileId[][]) {
  const gateX = MAIN_GATE_ROAD_X;
  const wallY = getMainGateWallY();

  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      if (isBorderMoatRing(x, y)) {
        if (x === gateX && y === GRID_HEIGHT - 1) {
          setTile(map, x, y, TileId.Bridge);
        } else {
          setTile(map, x, y, TileId.Moat);
        }
        continue;
      }

      if (!isBorderWallRing(x, y)) continue;

      if (x === gateX && y === wallY) {
        setTile(map, x, y, TileId.MainGate);
      } else {
        setTile(map, x, y, TileId.TownWall);
      }
    }
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
  if (w < 2 || h < 2) return false;
  if (!canPlaceBuildingFacingRoad(map, meta, x, y, w, h, doorFacing, reserved, doorSlot)) {
    return false;
  }

  const shop = isShopTheme(theme);
  const buildingId = `b-${x}-${y}-${hash(x, y, 31)}`;
  const doorCol = getDoorColumn(w, doorFacing, doorSlot);
  const doorRowLocal = getDoorRowLocal(h, doorFacing, doorSlot);
  let doorX = x + doorCol;
  let doorY = y + doorRowLocal;

  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      const px = x + dx;
      const py = y + dy;
      const { tile, part } = classifyBuildingCell(
        dx, dy, w, h, doorFacing, doorCol, doorRowLocal, shop,
      );

      if (part === 'door') {
        doorX = px;
        doorY = py;
      }

      const awningRow =
        shop &&
        ((doorFacing === 'south' && dy === 0) ||
          (doorFacing === 'north' && dy === h - 1) ||
          (doorFacing === 'east' && dx === 0) ||
          (doorFacing === 'west' && dx === w - 1));

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
        isAwningRow: awningRow && part !== 'door' && part !== 'roof',
        showSign: shop && part === 'door',
        hasWallLamp: shop && besideDoor && hash(px, py, 77) % 2 === 0,
      });
    }
  }

  paintDoorFrontage(map, doorX, doorY, doorFacing, w, x);
  paintBuildingLotSurround(map, x, y, w, h, doorFacing);
  markReservedFootprint(reserved, x, y, w, h);
  return true;
}

function paintTerracedHouses(
  map: TileId[][],
  meta: (BuildingCellMeta | null)[][],
  x: number,
  y: number,
  units: number,
  theme: ShopThemeId,
  doorFacing: BuildingFacing,
  reserved: Set<string>,
): boolean {
  const unitW = 2;
  const h = 2;
  let placed = 0;
  for (let i = 0; i < units; i++) {
    if (paintSmallBuilding(map, meta, x + i * unitW, y, unitW, h, theme, doorFacing, reserved, 0)) {
      placed++;
    } else {
      break;
    }
  }
  return placed > 0;
}

function paintMiniPark(
  map: TileId[][],
  meta: (BuildingCellMeta | null)[][],
  deco: MapDecoration[],
  reserved: Set<string>,
  x: number, y: number, size: number, id: string,
) {
  if (!canPlaceFootprint(map, meta, x, y, size, size, reserved)) return;

  for (let dy = 0; dy < size; dy++) {
    for (let dx = 0; dx < size; dx++) {
      setTile(map, x + dx, y + dy, TileId.Grass);
    }
  }

  const cx = x + Math.floor(size / 2);
  const cy = y + Math.floor(size / 2);
  setTile(map, cx, cy, TileId.FlowerBed);
  reserved.add(`${cx},${cy}`);

  for (let dy = 0; dy < size; dy++) {
    for (let dx = 0; dx < size; dx++) {
      const px = x + dx;
      const py = y + dy;
      const key = `${px},${py}`;
      if (reserved.has(key)) continue;
      const h = hash(px, py, 55);
      if (h % 5 === 0) {
        setTile(map, px, py, TileId.Tree);
        reserved.add(key);
      } else if (h % 11 === 0 && size >= 3) {
        setTile(map, px, py, TileId.FlowerBed);
        reserved.add(key);
      }
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

/** 茂密森林生態區（地圖角落與城牆內側） */
const DENSE_FOREST_REGIONS: { x0: number; y0: number; x1: number; y1: number; id: string }[] = [
  { x0: 2, y0: 2, x1: 8, y1: 6, id: 'forest-nw' },
  { x0: 32, y0: 2, x1: 37, y1: 6, id: 'forest-ne' },
  { x0: 2, y0: 23, x1: 7, y1: 26, id: 'forest-sw' },
  { x0: 33, y0: 23, x1: 37, y1: 26, id: 'forest-se' },
];

function canPaintBiomeCell(
  map: TileId[][],
  x: number,
  y: number,
  reserved: Set<string>,
): boolean {
  if (!isInMap(x, y) || reserved.has(`${x},${y}`)) return false;
  const t = map[y][x];
  if (isNetworkTile(t) || isBuildingTileId(t) || BORDER_BARRIER_TILES.has(t)) return false;
  if (t === TileId.Fountain || t === TileId.Pond || t === TileId.Farmland) return false;
  return t === TileId.Grass || t === TileId.GrassDark || t === TileId.FlowerBed;
}

function paintDenseForestBiomes(map: TileId[][], reserved: Set<string>) {
  DENSE_FOREST_REGIONS.forEach(({ x0, y0, x1, y1, id }) => {
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        if (!canPaintBiomeCell(map, x, y, reserved)) continue;
        const roll = hash(x, y, 301) % 100;
        if (roll < 82) {
          setTile(map, x, y, TileId.Tree);
          reserved.add(`${x},${y}`);
        } else if (roll < 92) {
          setTile(map, x, y, TileId.GrassDark);
        } else {
          setTile(map, x, y, TileId.Grass);
        }
      }
    }
  });
}

/** 休憩公園、湖泊、農田等特色造景 */
function paintTownFeatureLandmarks(
  map: TileId[][],
  deco: MapDecoration[],
  reserved: Set<string>,
) {
  paintRestTownPark(map, deco, reserved, 11, 16, 5, 4, 'park-rest');
  paintLake(map, deco, reserved, 3, 23, 5, 4, 'lake-sw');
  paintFarmland(map, deco, reserved, 31, 3, 6, 5, 'farm-ne');
}

function paintRestTownPark(
  map: TileId[][],
  deco: MapDecoration[],
  reserved: Set<string>,
  x: number,
  y: number,
  w: number,
  h: number,
  id: string,
) {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      const px = x + dx;
      const py = y + dy;
      if (!canPaintBiomeCell(map, px, py, reserved)) continue;
      const edge = dx === 0 || dx === w - 1 || dy === 0 || dy === h - 1;
      if (edge && (dx + dy) % 2 === 0) {
        setTile(map, px, py, TileId.FlowerBed);
      } else {
        setTile(map, px, py, TileId.Plaza);
      }
      reserved.add(`${px},${py}`);
    }
  }

  const benches: [number, number][] = [
    [x + 1, y + 1],
    [x + w - 2, y + 1],
    [x + 1, y + h - 2],
    [x + w - 2, y + h - 2],
  ];
  benches.forEach(([bx, by], i) => {
    if (isInMap(bx, by) && map[by][bx] === TileId.Plaza) {
      deco.push({ id: `${id}-bench-${i}`, x: bx, y: by, kind: 'bench' });
    }
  });

  for (let dy = 1; dy < h - 1; dy++) {
    for (let dx = 1; dx < w - 1; dx++) {
      const px = x + dx;
      const py = y + dy;
      if (map[py][px] !== TileId.Plaza) continue;
      if (hash(px, py, 88) % 3 === 0) {
        setTile(map, px, py, TileId.FlowerBed);
        deco.push({ id: `${id}-fl-${px}-${py}`, x: px, y: py, kind: 'flowers', variant: hash(px, py, 89) % 4 });
      }
    }
  }
}

function paintLake(
  map: TileId[][],
  deco: MapDecoration[],
  reserved: Set<string>,
  x: number,
  y: number,
  w: number,
  h: number,
  id: string,
) {
  const cx = x + Math.floor(w / 2);
  const cy = y + Math.floor(h / 2);

  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      const px = x + dx;
      const py = y + dy;
      if (!isInMap(px, py)) continue;
      const dist = Math.max(Math.abs(dx - Math.floor(w / 2)), Math.abs(dy - Math.floor(h / 2)));
      if (dist <= Math.min(Math.floor(w / 2), Math.floor(h / 2))) {
        if (canPaintBiomeCell(map, px, py, reserved) || map[py][px] === TileId.Grass) {
          setTile(map, px, py, TileId.Pond);
          reserved.add(`${px},${py}`);
        }
      } else if (canPaintBiomeCell(map, px, py, reserved)) {
        if (hash(px, py, 310) % 3 !== 0) {
          setTile(map, px, py, TileId.Tree);
          reserved.add(`${px},${py}`);
        } else {
          setTile(map, px, py, TileId.GrassDark);
        }
      }
    }
  }

  [[cx - 2, cy], [cx + 2, cy], [cx, cy - 1], [cx, cy + 1]].forEach(([rx, ry], i) => {
    if (isInMap(rx, ry) && map[ry][rx] === TileId.Grass) {
      setTile(map, rx, ry, TileId.GrassDark);
      deco.push({ id: `${id}-rock-${i}`, x: rx, y: ry, kind: 'emoji', emoji: '🪨' });
    }
  });
}

function paintFarmland(
  map: TileId[][],
  deco: MapDecoration[],
  reserved: Set<string>,
  x: number,
  y: number,
  w: number,
  h: number,
  id: string,
) {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      const px = x + dx;
      const py = y + dy;
      if (!canPaintBiomeCell(map, px, py, reserved)) continue;
      setTile(map, px, py, TileId.Farmland);
      reserved.add(`${px},${py}`);
      if (hash(px, py, 320) % 4 === 0) {
        deco.push({ id: `${id}-crop-${px}-${py}`, x: px, y: py, kind: 'emoji', emoji: '🌱' });
      }
    }
  }
}

/** 填補大於 4×4 的空曠草地 */
function fillLargeGrassPatches(map: TileId[][], deco: MapDecoration[], reserved: Set<string>) {
  const visited = new Set<string>();

  for (let y = MAP_FOREST_FRINGE_DEPTH; y < GRID_HEIGHT - MAP_FOREST_FRINGE_DEPTH; y++) {
    for (let x = MAP_FOREST_FRINGE_DEPTH; x < GRID_WIDTH - MAP_FOREST_FRINGE_DEPTH; x++) {
      const key = `${x},${y}`;
      if (visited.has(key)) continue;
      const t = map[y][x];
      if (t !== TileId.Grass && t !== TileId.GrassDark) continue;

      const queue: [number, number][] = [[x, y]];
      const region: [number, number][] = [];
      visited.add(key);

      while (queue.length > 0) {
        const [cx, cy] = queue.shift()!;
        region.push([cx, cy]);
        [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(([dx, dy]) => {
          const nx = cx + dx;
          const ny = cy + dy;
          const nk = `${nx},${ny}`;
          if (!isInMap(nx, ny) || visited.has(nk)) return;
          const nt = map[ny][nx];
          if (nt !== TileId.Grass && nt !== TileId.GrassDark) return;
          visited.add(nk);
          queue.push([nx, ny]);
        });
      }

      if (region.length <= 16) continue;

      let minX = GRID_WIDTH;
      let maxX = 0;
      let minY = GRID_HEIGHT;
      let maxY = 0;
      region.forEach(([rx, ry]) => {
        minX = Math.min(minX, rx);
        maxX = Math.max(maxX, rx);
        minY = Math.min(minY, ry);
        maxY = Math.max(maxY, ry);
      });
      if (maxX - minX + 1 <= 4 && maxY - minY + 1 <= 4) continue;

      region.forEach(([rx, ry], i) => {
        if (reserved.has(`${rx},${ry}`)) return;
        const h = hash(rx, ry, 400 + i);
        if (h % 11 === 0) {
          setTile(map, rx, ry, TileId.Tree);
          reserved.add(`${rx},${ry}`);
        } else if (h % 9 === 0) {
          setTile(map, rx, ry, TileId.FlowerBed);
          reserved.add(`${rx},${ry}`);
        } else if (h % 7 === 0) {
          const ornament = h % 3;
          if (ornament === 0) {
            deco.push({ id: `fill-fl-${rx}-${ry}`, x: rx, y: ry, kind: 'flowers', variant: h % 4 });
          } else if (ornament === 1) {
            deco.push({ id: `fill-dog-${rx}-${ry}`, x: rx, y: ry, kind: 'emoji', emoji: '🐕' });
          } else {
            deco.push({ id: `fill-cat-${rx}-${ry}`, x: rx, y: ry, kind: 'emoji', emoji: '🐈' });
          }
        } else if (h % 17 === 0) {
          deco.push({ id: `fill-fl-${rx}-${ry}`, x: rx, y: ry, kind: 'flowers', variant: h % 4 });
        }
      });
    }
  }
}

function paintOrganicDistricts(
  map: TileId[][], meta: (BuildingCellMeta | null)[][],
  deco: MapDecoration[], reserved: Set<string>,
) {
  let idx = 0;

  MAIN_ROAD_H.forEach((roadY) => {
    for (let x = 3; x < GRID_WIDTH - 5; ) {
      const roll = hash(x, roadY, 10) % 10;

      if (roll === 0) {
        paintMiniPark(map, meta, deco, reserved, x, roadY - 4, 2, `park-n-${x}`);
        x += 3;
        continue;
      }

      const isShop = roll % 3 !== 0;
      const w = isShop ? 3 : 2;
      const h = 2;
      const offset = hash(x, roadY, 14) % 2;
      const theme = pickTheme(idx++, isShop ? 'shop' : 'home');

      const northY = roadY - 2 - h - offset;
      if (northY >= MAP_FOREST_FRINGE_DEPTH) {
        if (!isShop && roll % 4 === 0) {
          paintTerracedHouses(map, meta, x, northY, 2, theme, 'south', reserved);
        } else {
          paintSmallBuilding(map, meta, x, northY, w, h, theme, 'south', reserved);
        }
      }

      const southY = roadY + 2 + offset;
      if (southY + h < GRID_HEIGHT - MAP_FOREST_FRINGE_DEPTH) {
        const homeTheme = pickTheme(idx++, 'home');
        paintSmallBuilding(map, meta, x, southY, 2, 2, homeTheme, 'north', reserved);
      }

      x += w + 1;
    }
  });

  MAIN_ROAD_V.forEach((roadX) => {
    for (let y = MAP_FOREST_FRINGE_DEPTH; y < GRID_HEIGHT - MAP_FOREST_FRINGE_DEPTH; y += 2) {
      if (hash(roadX, y, 17) % 9 === 0) {
        paintMiniPark(map, meta, deco, reserved, roadX - 4, y, 2, `park-w-${roadX}-${y}`);
        continue;
      }

      const isShop = hash(roadX, y, 18) % 3 === 0;
      const w = isShop ? 3 : 2;
      const h = 2;
      const theme = pickTheme(idx++, isShop ? 'shop' : 'home');
      const westX = roadX - 2 - w;

      if (westX >= MAP_FOREST_FRINGE_DEPTH) {
        if (!isShop && hash(roadX, y, 23) % 5 === 0) {
          paintTerracedHouses(map, meta, westX, y, 2, theme, 'east', reserved);
        } else {
          paintSmallBuilding(map, meta, westX, y, w, h, theme, 'east', reserved);
        }
      }
    }
  });
}

function paintLandmarks(
  map: TileId[][], meta: (BuildingCellMeta | null)[][], reserved: Set<string>,
) {
  const landmarks: {
    x: number; y: number; w: number; h: number;
    theme: ShopThemeId; facing: BuildingFacing; slot?: number;
  }[] = [
    { x: 5, y: 5, w: 4, h: 3, theme: 'restaurant', facing: 'south', slot: 1 },
    { x: 19, y: 5, w: 5, h: 3, theme: 'clinic', facing: 'south', slot: 2 },
    { x: 28, y: 19, w: 5, h: 3, theme: 'warehouse', facing: 'south', slot: 2 },
    { x: 14, y: 9, w: 3, h: 2, theme: 'magic_library', facing: 'south' },
    { x: 24, y: 11, w: 3, h: 2, theme: 'flower', facing: 'south' },
    { x: 6, y: 12, w: 2, h: 2, theme: 'house_gray', facing: 'east' },
  ];

  landmarks.forEach(({ x, y, w, h, theme, facing, slot }) => {
    paintSmallBuilding(map, meta, x, y, w, h, theme, facing, reserved, slot);
  });
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

/** 公園綠地：連貫淺草區塊 + 隨機點綴樹木與花圃 */
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

        setTile(map, x, y, TileId.Grass);
      }
    }

    setTile(map, cx, cy, TileId.FlowerBed);
    reserved.add(`${cx},${cy}`);

    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const x = cx + dx;
        const y = cy + dy;
        const key = `${x},${y}`;
        if (!isInMap(x, y) || reserved.has(key)) continue;
        if (isRoadFamily(map[y][x]) || map[y][x] === TileId.Sidewalk || BUILDING_TILES.has(map[y][x])) {
          continue;
        }

        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        const h = hash(x, y, 80);
        if (dist >= 1 && h % 4 === 0) {
          setTile(map, x, y, TileId.Tree);
          reserved.add(key);
        } else if (dist >= 1 && h % 9 === 0) {
          setTile(map, x, y, TileId.FlowerBed);
          reserved.add(key);
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

function countGrassNeighbors(map: TileId[][], x: number, y: number): number {
  return [[0, -1], [0, 1], [-1, 0], [1, 0]].reduce((n, [dx, dy]) => {
    const nx = x + dx;
    const ny = y + dy;
    if (!isInMap(nx, ny)) return n;
    const t = map[ny][nx];
    return n + (t === TileId.Grass || t === TileId.Sidewalk ? 1 : 0);
  }, 0);
}

/** 行道樹：僅種在人行道外側連續淺草地上，避開邊界森林帶 */
function paintStreetTrees(map: TileId[][], reserved: Set<string>) {
  const minEdge = MAP_FOREST_FRINGE_DEPTH + 1;

  MAIN_ROAD_H.forEach((roadY) => {
    for (let x = minEdge; x < GRID_WIDTH - minEdge; x += STREET_TREE_SPACING) {
      if (isMainRoadIntersection(x, roadY)) continue;
      if (isInRoundaboutFootprint(x, roadY, 1)) continue;

      for (const sy of [roadY - 1, roadY + 1]) {
        if (!isInMap(x, sy) || map[sy][x] !== TileId.Sidewalk) continue;
        const gy = sy < roadY ? sy - 1 : sy + 1;
        if (!isInMap(x, gy) || edgeDistance(x, gy) < minEdge) continue;
        if (reserved.has(`${x},${gy}`)) continue;
        if (map[gy][x] !== TileId.Grass) continue;
        if (countGrassNeighbors(map, x, gy) < 2) continue;

        setTile(map, x, gy, TileId.Tree);
        reserved.add(`${x},${gy}`);
      }
    }
  });

  MAIN_ROAD_V.forEach((roadX) => {
    for (let y = minEdge; y < GRID_HEIGHT - minEdge; y += STREET_TREE_SPACING) {
      if (isMainRoadIntersection(roadX, y)) continue;
      if (isInRoundaboutFootprint(roadX, y, 1)) continue;

      for (const sx of [roadX - 1, roadX + 1]) {
        if (!isInMap(sx, y) || map[y][sx] !== TileId.Sidewalk) continue;
        const gx = sx < roadX ? sx - 1 : sx + 1;
        if (!isInMap(gx, y) || edgeDistance(gx, y) < minEdge) continue;
        if (reserved.has(`${gx},${y}`)) continue;
        if (map[y][gx] !== TileId.Grass) continue;
        if (countGrassNeighbors(map, gx, y) < 2) continue;

        setTile(map, gx, y, TileId.Tree);
        reserved.add(`${gx},${y}`);
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

function touchesRoadOrSidewalkOnMap(map: TileId[][], x: number, y: number): boolean {
  const neighbors = [[0, -1], [0, 1], [-1, 0], [1, 0]] as const;
  return neighbors.some(([dx, dy]) => {
    const t = map[y + dy]?.[x + dx];
    return t !== undefined && (isRoadFamily(t) || t === TileId.Sidewalk || t === TileId.Path);
  });
}

function paintGrassVariation(map: TileId[][]) {
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      if (map[y][x] !== TileId.Grass) continue;
      if (edgeDistance(x, y) < MAP_FOREST_FRINGE_DEPTH) continue;
      if (touchesRoadOrSidewalkOnMap(map, x, y)) continue;
      if (hash(x, y) % 9 === 0) {
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

/** 任務鼠出生點最小曼哈頓距離（避免多隻擠在同一區塊） */
const MIN_QUEST_RAT_MANHATTAN_GAP = 8;

function manhattanCellDist(
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  return Math.abs(ax - bx) + Math.abs(ay - by);
}

function isFarEnoughFromQuests(
  x: number,
  y: number,
  placed: readonly QuestPoint[],
  minGap: number,
): boolean {
  return placed.every((p) => manhattanCellDist(x, y, p.x, p.y) >= minGap);
}

function pickCandidate(
  pool: RatCandidate[],
  zone: RatCandidate['zone'],
  used: Set<string>,
  preferHint?: RatCandidate['hint'],
): RatCandidate | null {
  return pickCandidateWithSpacing(pool, zone, used, [], 0, preferHint);
}

/** 優先選與已放置任務鼠距離最遠的候選格 */
function pickCandidateWithSpacing(
  pool: RatCandidate[],
  zone: RatCandidate['zone'],
  used: Set<string>,
  placed: readonly QuestPoint[],
  minGap: number,
  preferHint?: RatCandidate['hint'],
): RatCandidate | null {
  const tryPick = (gap: number, hint?: RatCandidate['hint']) => {
    const filtered = pool.filter(
      (c) =>
        c.zone === zone &&
        !used.has(`${c.x},${c.y}`) &&
        (gap <= 0 || isFarEnoughFromQuests(c.x, c.y, placed, gap)) &&
        (!hint || c.hint === hint),
    );
    if (filtered.length === 0) return null;

    if (placed.length === 0 || gap <= 0) {
      return filtered.sort((a, b) => b.score - a.score)[0] ?? null;
    }

    return (
      [...filtered].sort((a, b) => {
        const minA = Math.min(
          ...placed.map((p) => manhattanCellDist(a.x, a.y, p.x, p.y)),
        );
        const minB = Math.min(
          ...placed.map((p) => manhattanCellDist(b.x, b.y, p.x, p.y)),
        );
        return minB - minA || b.score - a.score;
      })[0] ?? null
    );
  };

  let pick =
    tryPick(minGap, preferHint) ??
    (preferHint ? tryPick(minGap) : null);

  for (let gap = minGap - 1; gap >= 5 && !pick; gap--) {
    pick = tryPick(gap, preferHint) ?? (preferHint ? tryPick(gap) : null);
  }

  if (!pick) {
    pick = tryPick(0, preferHint) ?? tryPick(0);
  }

  return pick;
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
    { questionId: 2, zone: 'clinic', prefer: 'alley' },
    { questionId: 3, zone: 'clinic', prefer: 'dirty' },
    { questionId: 4, zone: 'clinic', prefer: 'corner' },
    { questionId: 5, zone: 'restaurant', prefer: 'corner' },
    { questionId: 6, zone: 'restaurant', prefer: 'alley' },
    { questionId: 7, zone: 'restaurant', prefer: 'dirty' },
    { questionId: 8, zone: 'warehouse', prefer: 'dirty' },
    { questionId: 9, zone: 'warehouse', prefer: 'dirty' },
    { questionId: 10, zone: 'warehouse', prefer: 'dirty' },
  ];

  const warehouseDirty = dirtySpots.filter((s) => s.zone === 'warehouse');
  const forcedDirty = [8, 9, 10];

  forcedDirty.forEach((qId, i) => {
    const spot = warehouseDirty[i];
    let pick: RatCandidate | null = null;

    if (spot) {
      const nearDirty = findRecyclingRatSpot(map, meta, spot, deco, reserved, used);
      if (
        nearDirty &&
        isFarEnoughFromQuests(
          nearDirty.x,
          nearDirty.y,
          points,
          MIN_QUEST_RAT_MANHATTAN_GAP,
        )
      ) {
        pick = nearDirty;
      }
    }

    if (!pick) {
      pick =
        pickCandidateWithSpacing(
          candidates,
          'warehouse',
          used,
          points,
          MIN_QUEST_RAT_MANHATTAN_GAP,
          'dirty',
        ) ??
        pickCandidateWithSpacing(
          candidates,
          'warehouse',
          used,
          points,
          MIN_QUEST_RAT_MANHATTAN_GAP,
        );
    }

    if (!pick) return;
    used.add(`${pick.x},${pick.y}`);
    reserved.add(`${pick.x},${pick.y}`);
    points.push({
      questionId: qId,
      x: pick.x,
      y: pick.y,
      ratType: (Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3,
    });
  });

  zoneQuests.forEach(({ questionId, zone, prefer }) => {
    if (points.some((p) => p.questionId === questionId)) return;
    const pick =
      pickCandidateWithSpacing(
        candidates,
        zone,
        used,
        points,
        MIN_QUEST_RAT_MANHATTAN_GAP,
        prefer,
      ) ?? pickCandidateWithSpacing(candidates, zone, used, points, MIN_QUEST_RAT_MANHATTAN_GAP);
    if (!pick) return;
    if (!isValidRatSpawn(map, meta, pick.x, pick.y, deco, new Set())) return;
    used.add(`${pick.x},${pick.y}`);
    reserved.add(`${pick.x},${pick.y}`);
    points.push({
      questionId,
      x: pick.x,
      y: pick.y,
      ratType: (Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3,
    });
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

function buildTreasureStaticBlocked(
  questPoints: QuestPoint[],
  reserved: Set<string>,
): Set<string> {
  const blocked = new Set(reserved);
  questPoints.forEach((p) => blocked.add(`${p.x},${p.y}`));
  Object.values(NPC_GRID_POSITIONS).forEach((p) => blocked.add(`${p.x},${p.y}`));
  return blocked;
}

function isPathfindingWalkable(
  map: TileId[][],
  meta: (BuildingCellMeta | null)[][],
  x: number,
  y: number,
  staticBlocked: Set<string>,
): boolean {
  if (!isInMap(x, y)) return false;
  if (staticBlocked.has(`${x},${y}`)) return false;
  if (meta[y][x]) return false;
  const t = map[y][x];
  if (BLOCKING_TILES.has(t)) return false;
  return WALKABLE_TILES.has(t);
}

function countWalkableNeighbors(
  map: TileId[][],
  meta: (BuildingCellMeta | null)[][],
  x: number,
  y: number,
  staticBlocked: Set<string>,
): number {
  return [[0, -1], [0, 1], [-1, 0], [1, 0]].reduce((n, [dx, dy]) => {
    return n + (isPathfindingWalkable(map, meta, x + dx, y + dy, staticBlocked) ? 1 : 0);
  }, 0);
}

function isNearRoadNetwork(map: TileId[][], x: number, y: number): boolean {
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (!isInMap(nx, ny)) continue;
      const t = map[ny][nx];
      if (isRoadFamily(t) || t === TileId.Sidewalk || t === TileId.Path || t === TileId.Plaza) {
        return true;
      }
    }
  }
  return false;
}

function isBorderWallCornerTrap(map: TileId[][], x: number, y: number): boolean {
  if (edgeDistance(x, y) < MAP_FOREST_FRINGE_DEPTH) return true;

  let barrierNeighbors = 0;
  let treeNeighbors = 0;
  let walkableNeighbors = 0;

  [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(([dx, dy]) => {
    const nx = x + dx;
    const ny = y + dy;
    if (!isInMap(nx, ny)) {
      barrierNeighbors++;
      return;
    }
    const t = map[ny][nx];
    if (BORDER_BARRIER_TILES.has(t)) barrierNeighbors++;
    else if (t === TileId.Tree) treeNeighbors++;
    else if (WALKABLE_TILES.has(t) && !BLOCKING_TILES.has(t)) walkableNeighbors++;
  });

  if (barrierNeighbors >= 2) return true;
  if (barrierNeighbors >= 1 && walkableNeighbors <= 1 && treeNeighbors >= 2) return true;
  return false;
}

function isValidTreasureLocation(
  map: TileId[][],
  meta: (BuildingCellMeta | null)[][],
  x: number,
  y: number,
  staticBlocked: Set<string>,
): boolean {
  if (staticBlocked.has(`${x},${y}`)) return false;
  if (meta[y][x]) return false;

  const t = map[y][x];
  if (t !== TileId.Grass && t !== TileId.GrassDark && t !== TileId.Path) return false;
  if (isRoadFamily(t) || isOnMainRoadSurface(map, x, y)) return false;
  if (!isPathfindingWalkable(map, meta, x, y, staticBlocked)) return false;
  if (countWalkableNeighbors(map, meta, x, y, staticBlocked) < 1) return false;
  if (isBorderWallCornerTrap(map, x, y)) return false;
  return true;
}

function isReachableFromPlayer(
  map: TileId[][],
  meta: (BuildingCellMeta | null)[][],
  tx: number,
  ty: number,
  staticBlocked: Set<string>,
): boolean {
  if (!isPathfindingWalkable(map, meta, tx, ty, staticBlocked)) return false;

  const start = getPlayerSpawnPoint();
  const visited = new Set<string>();
  const queue: [number, number][] = [[start.x, start.y]];
  visited.add(`${start.x},${start.y}`);

  while (queue.length > 0) {
    const [x, y] = queue.shift()!;
    if (x === tx && y === ty) return true;

    [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(([dx, dy]) => {
      const nx = x + dx;
      const ny = y + dy;
      const key = `${nx},${ny}`;
      if (visited.has(key)) return;
      if (!isPathfindingWalkable(map, meta, nx, ny, staticBlocked)) return;
      visited.add(key);
      queue.push([nx, ny]);
    });
  }

  return false;
}

function scoreTreasureCandidate(
  map: TileId[][],
  meta: (BuildingCellMeta | null)[][],
  x: number,
  y: number,
): number {
  let score = 0;
  if (isNearRoadNetwork(map, x, y)) score += 55;
  if (touchesRoadOrSidewalkOnMap(map, x, y)) score += 35;
  if (isAlleyCell(map, x, y)) score += 25;
  if (isBehindBuildingWall(map, meta, x, y)) score += 20;
  if (countWalkableNeighbors(map, meta, x, y, new Set()) >= 2) score += 15;
  if (isDeadEndSpot(map, x, y)) score -= 40;
  if (isDeepParkSpot(map, x, y)) score -= 35;
  if (countWallNeighbors(map, x, y) >= 3) score -= 20;
  return score;
}

/** 隱藏寶物：確保每個寶箱皆可從玩家起點步行抵達 */
function generateTreasures(
  map: TileId[][],
  meta: (BuildingCellMeta | null)[][],
  questPoints: QuestPoint[],
  reserved: Set<string>,
): TreasureSpot[] {
  const staticBlocked = buildTreasureStaticBlocked(questPoints, reserved);
  const candidates: { x: number; y: number; score: number }[] = [];

  for (let y = 1; y < GRID_HEIGHT - 1; y++) {
    for (let x = 1; x < GRID_WIDTH - 1; x++) {
      if (!isValidTreasureLocation(map, meta, x, y, staticBlocked)) continue;
      if (!isReachableFromPlayer(map, meta, x, y, staticBlocked)) continue;

      const score = scoreTreasureCandidate(map, meta, x, y);
      candidates.push({ x, y, score });
    }
  }

  candidates.sort((a, b) => b.score - a.score || hash(a.x, a.y, 90) - hash(b.x, b.y, 90));

  const fallbackCandidates = candidates.length > 0
    ? candidates
    : (() => {
        const relaxed: { x: number; y: number; score: number }[] = [];
        for (let y = 1; y < GRID_HEIGHT - 1; y++) {
          for (let x = 1; x < GRID_WIDTH - 1; x++) {
            if (!isPathfindingWalkable(map, meta, x, y, staticBlocked)) continue;
            if (!isReachableFromPlayer(map, meta, x, y, staticBlocked)) continue;
            relaxed.push({ x, y, score: hash(x, y, 92) });
          }
        }
        return relaxed;
      })();

  const targetCount = Math.max(3, 3 + (hash(42, 99, 7) % 3));
  const requiredItemOrder = shuffledTreasureItemOrder(hash(42, 99, 7));
  const spots: TreasureSpot[] = [];
  const used = new Set<string>();

  const tryPlaceSpot = (c: { x: number; y: number }) => {
    const key = `${c.x},${c.y}`;
    if (used.has(key)) return false;
    const tooClose = spots.some((s) => Math.abs(s.x - c.x) + Math.abs(s.y - c.y) < 4);
    if (tooClose) return false;
    if (!isReachableFromPlayer(map, meta, c.x, c.y, staticBlocked)) return false;

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
    return true;
  };

  for (const c of fallbackCandidates) {
    if (spots.length >= targetCount) break;
    tryPlaceSpot(c);
  }

  if (spots.length < targetCount) {
    for (let y = 1; y < GRID_HEIGHT - 1 && spots.length < targetCount; y++) {
      for (let x = 1; x < GRID_WIDTH - 1 && spots.length < targetCount; x++) {
        if (!isReachableFromPlayer(map, meta, x, y, staticBlocked)) continue;
        tryPlaceSpot({ x, y });
      }
    }
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
  paintTownFeatureLandmarks(map, deco, reserved);
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
  paintDenseForestBiomes(map, reserved);
  fillLargeGrassPatches(map, deco, reserved);
  paintTownBorderBarrier(map);
  paintMainGate(map);
  paintTownEntrance(map);
  enforceBorderBarrierIntegrity(map);
  paintInteriorForestFringe(map);

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
  const id = getTileId(x, y);
  return BLOCKING_TILES.has(id);
}

/** 邊界屏障（護城河、城牆、城門、木橋） */
export function isBorderBarrierTile(x: number, y: number): boolean {
  return BORDER_BARRIER_TILES.has(getTileId(x, y));
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
