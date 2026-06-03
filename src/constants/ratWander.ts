import type { SpriteDirection } from './characterAssets';
import type { GridPosition, QuestPoint } from './gameData';
import { isWithinRatInteractionRange } from './gameData';
import {
  getRatDefaultFacing,
  resolveRatFacingTowardPlayer,
  rollRandomRatType,
  type RatType,
} from './ratAssets';
import { GRID_WIDTH, GRID_HEIGHT, NPC_GRID_POSITIONS } from './mapConfig';
import { isBorderBarrierTile, isBlockedTile } from './tilemap';
import type { NpcPositionsMap } from './npcWander';

function isNpcAt(x: number, y: number, npcPositions: NpcPositionsMap): boolean {
  return Object.values(npcPositions).some((p) => p.x === x && p.y === y);
}

function isNpcAnchorCell(x: number, y: number): boolean {
  return Object.values(NPC_GRID_POSITIONS).some((p) => p.x === x && p.y === y);
}

/** 尋找距原點最近、非 NPC 站位且可通行的替代格（任務鼠初始位置校正） */
function findAlternateRatSpawn(
  originX: number,
  originY: number,
  questPoints: readonly QuestPoint[],
  questId: number,
): GridPosition | null {
  const maxRadius = 4;
  for (let r = 1; r <= maxRadius; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const x = originX + dx;
        const y = originY + dy;
        if (!isInBounds(x, y)) continue;
        if (isNpcAnchorCell(x, y)) continue;
        if (isBlockedTile(x, y) || isBorderBarrierTile(x, y)) continue;
        if (
          questPoints.some(
            (q) => q.questionId !== questId && q.x === x && q.y === y,
          )
        ) {
          continue;
        }
        return { x, y };
      }
    }
  }
  return null;
}

export type RatWorldState = {
  questId: number;
  x: number;
  y: number;
  spawnX: number;
  spawnY: number;
  stance: SpriteDirection;
  ratType: RatType;
};

export type RatPositionsMap = Record<number, RatWorldState>;

export const RAT_WANDER_RADIUS = 1;
export const RAT_WANDER_INTERVAL_MIN_MS = 1500;
export const RAT_WANDER_INTERVAL_MAX_MS = 2000;

function isInBounds(x: number, y: number): boolean {
  return x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT;
}

export function buildInitialRatPositions(questPoints: readonly QuestPoint[]): RatPositionsMap {
  const map: RatPositionsMap = {};
  for (const p of questPoints) {
    let x = p.x;
    let y = p.y;
    if (isNpcAnchorCell(x, y)) {
      const alt = findAlternateRatSpawn(x, y, questPoints, p.questionId);
      if (alt) {
        x = alt.x;
        y = alt.y;
      }
    }
    map[p.questionId] = {
      questId: p.questionId,
      x,
      y,
      spawnX: x,
      spawnY: y,
      stance: getRatDefaultFacing(p.questionId),
      ratType: p.ratType ?? rollRandomRatType(),
    };
  }
  return map;
}

export function cloneRatPositions(source: RatPositionsMap): RatPositionsMap {
  const next: RatPositionsMap = {};
  for (const [id, rat] of Object.entries(source)) {
    next[Number(id)] = { ...rat };
  }
  return next;
}

function manhattan(a: GridPosition, b: GridPosition): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function isWithinRatWanderRadius(
  pos: GridPosition,
  spawn: GridPosition,
  radius = RAT_WANDER_RADIUS,
): boolean {
  return manhattan(pos, spawn) <= radius;
}

export function isRatCellOccupied(
  x: number,
  y: number,
  ratPositions: RatPositionsMap,
  exceptQuestId?: number,
  completedIds?: ReadonlySet<number>,
): boolean {
  return Object.values(ratPositions).some(
    (r) =>
      r.questId !== exceptQuestId &&
      (!completedIds || !completedIds.has(r.questId)) &&
      r.x === x &&
      r.y === y,
  );
}

function stanceFromDelta(dx: number, dy: number, fallback: SpriteDirection): SpriteDirection {
  if (dx > 0) return 'right';
  if (dx < 0) return 'left';
  if (dy > 0) return 'down';
  if (dy < 0) return 'up';
  return fallback;
}

export function canRatStepTo(
  x: number,
  y: number,
  rat: RatWorldState,
  ratPositions: RatPositionsMap,
  playerPos: GridPosition,
  npcPositions: NpcPositionsMap,
  completedIds: ReadonlySet<number>,
): boolean {
  if (!isInBounds(x, y)) return false;
  const spawn = { x: rat.spawnX, y: rat.spawnY };
  if (!isWithinRatWanderRadius({ x, y }, spawn)) return false;
  if (playerPos.x === x && playerPos.y === y) return false;
  if (isRatCellOccupied(x, y, ratPositions, rat.questId, completedIds)) return false;
  if (isNpcAt(x, y, npcPositions) || isNpcAnchorCell(x, y)) return false;
  if (isBlockedTile(x, y) || isBorderBarrierTile(x, y)) return false;
  return true;
}

function shuffleDeltas(): { dx: number; dy: number }[] {
  const list = [
    { dx: 0, dy: 0 },
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
  ];
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

export function pickRatWanderIntervalMs(): number {
  return (
    RAT_WANDER_INTERVAL_MIN_MS +
    Math.floor(
      Math.random() * (RAT_WANDER_INTERVAL_MAX_MS - RAT_WANDER_INTERVAL_MIN_MS + 1),
    )
  );
}

/** 玩家靠近時暫停該鼠漫遊 */
export function isRatWanderFrozenForPlayer(
  rat: RatWorldState,
  playerPos: GridPosition,
): boolean {
  return isWithinRatInteractionRange(playerPos, rat);
}

export function computeRatWanderTick(
  positions: RatPositionsMap,
  playerPos: GridPosition,
  npcPositions: NpcPositionsMap,
  completedIds: ReadonlySet<number>,
): RatPositionsMap {
  const next = cloneRatPositions(positions);

  for (const rat of Object.values(next)) {
    if (completedIds.has(rat.questId)) continue;
    if (isRatWanderFrozenForPlayer(rat, playerPos)) continue;

    const deltas = shuffleDeltas();
    for (const { dx, dy } of deltas) {
      const targetX = rat.x + dx;
      const targetY = rat.y + dy;
      if (
        !canRatStepTo(
          targetX,
          targetY,
          rat,
          next,
          playerPos,
          npcPositions,
          completedIds,
        )
      ) {
        continue;
      }

      const stance = stanceFromDelta(dx, dy, rat.stance);
      next[rat.questId] = {
        ...rat,
        x: targetX,
        y: targetY,
        stance,
      };
      break;
    }
  }

  return next;
}

export function getRatDisplayFacing(
  rat: RatWorldState,
  playerPos: GridPosition,
): SpriteDirection {
  if (isRatWanderFrozenForPlayer(rat, playerPos)) {
    return resolveRatFacingTowardPlayer(rat.x, rat.y, playerPos.x, playerPos.y);
  }
  return rat.stance;
}
