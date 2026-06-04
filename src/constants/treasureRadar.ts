import type { GridPosition } from './mapConfig';
import type { ItemId, PlayerInventory } from './items';
import { PREVENTION_ITEMS, PREVENTION_ITEMS_BY_ID } from './items';
import { TREASURE_SPOTS, getGridTileType, type GridTileType } from './gameData';
import type { TreasureSpot } from './tilemap';

export const RADAR_COOLDOWN_MS = 30_000;
export const RADAR_SCORE_COST = 20;
export const RADAR_PING_DURATION_MS = 3_000;

const ZONE_LABELS: Record<GridTileType, string> = {
  restaurant: '餐廳區',
  clinic: '診所區',
  warehouse: '倉庫區',
};

const ZONE_LANDMARKS: Record<GridTileType, string[]> = {
  restaurant: ['餐廳後巷', '某棵樹下', '牆角死巷'],
  clinic: ['診所旁邊', '某棵樹下', '靜巷深處'],
  warehouse: ['倉庫角落', '回收站附近', '大樹叢後方'],
};

function treasureLocationHint(treasure: TreasureSpot): string {
  const zone = getGridTileType(treasure.x, treasure.y);
  const landmarks = ZONE_LANDMARKS[zone];
  const idx = (treasure.x * 7 + treasure.y * 13) % landmarks.length;
  if (treasure.variant === 'chest') {
    return `${ZONE_LABELS[zone]}的藏寶箱附近`;
  }
  return `【${ZONE_LABELS[zone]}】的${landmarks[idx]}`;
}

export function getUncollectedTreasures(collectedIds: ReadonlySet<string>): TreasureSpot[] {
  return TREASURE_SPOTS.filter((t) => !collectedIds.has(t.id));
}

export function findNearestTreasure(
  playerPos: GridPosition,
  collectedIds: ReadonlySet<string>,
): TreasureSpot | null {
  const remaining = getUncollectedTreasures(collectedIds);
  if (remaining.length === 0) return null;

  let best: TreasureSpot | null = null;
  let bestDist = Infinity;

  for (const t of remaining) {
    const dist = Math.abs(t.x - playerPos.x) + Math.abs(t.y - playerPos.y);
    if (dist < bestDist) {
      bestDist = dist;
      best = t;
    }
  }
  return best;
}

export function getMissingBossItems(inventory: PlayerInventory): ItemId[] {
  return PREVENTION_ITEMS.filter((item) => inventory[item.id] < 1).map((item) => item.id);
}

function findTreasureForItem(
  itemId: ItemId,
  collectedIds: ReadonlySet<string>,
): TreasureSpot | undefined {
  const uncollected = getUncollectedTreasures(collectedIds).find((t) => t.itemId === itemId);
  if (uncollected) return uncollected;
  return TREASURE_SPOTS.find((t) => t.itemId === itemId);
}

/** 鼠王道具不足時的動態嘲諷台詞 */
export function generateBossBlockedTaunt(
  inventory: PlayerInventory,
  collectedIds: ReadonlySet<string>,
): string {
  const missing = getMissingBossItems(inventory);
  if (missing.length === 0) {
    return '吱吱！你還沒準備好，快去地圖角落尋寶！';
  }

  const itemNames = missing.map((id) => `【${PREVENTION_ITEMS_BY_ID[id].name}】`).join('、');
  const open =
    missing.length === 1
      ? `吱吱！就憑你也想抓我？你連${itemNames}都沒有！`
      : `吱吱！就憑你也想抓我？你還缺${itemNames}！`;

  const hints = missing.map((id) => {
    const item = PREVENTION_ITEMS_BY_ID[id];
    const spot = findTreasureForItem(id, collectedIds);
    if (spot) {
      return `${item.emoji}${item.name}掉在${treasureLocationHint(spot)}`;
    }
    return `${item.emoji}${item.name}可能藏在【診所區】某個角落`;
  });

  return `${open}${hints.join('，')}！快去撿啦！吱吱！`;
}

export function canUseRadarFree(lastUsedAt: number | null, now = Date.now()): boolean {
  if (lastUsedAt === null) return true;
  return now - lastUsedAt >= RADAR_COOLDOWN_MS;
}

export function canUseRadarWithScore(
  leaderboardScore: number,
  lastUsedAt: number | null,
  now = Date.now(),
): boolean {
  if (canUseRadarFree(lastUsedAt, now)) return true;
  return leaderboardScore >= RADAR_SCORE_COST;
}

export function radarCooldownRemainingMs(lastUsedAt: number | null, now = Date.now()): number {
  if (lastUsedAt === null) return 0;
  return Math.max(0, RADAR_COOLDOWN_MS - (now - lastUsedAt));
}
