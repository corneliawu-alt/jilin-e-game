import { NPC_DEFAULT_FACING, type SpriteDirection } from './characterAssets';
import type { GridPosition, TargetNPC } from './gameData';
import { GRID_WIDTH, GRID_HEIGHT, NPC_GRID_POSITIONS } from './mapConfig';
import type { RatPositionsMap } from './ratWander';
import { isBorderBarrierTile, isBlockedTile } from './tilemap';

function isInBounds(x: number, y: number): boolean {
  return x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT;
}

/** 左右朝向（對話面向玩家、水平漫遊） */
export type NpcMapDirection = 'left' | 'right';

export type NpcWorldState = {
  x: number;
  y: number;
  direction: NpcMapDirection;
  /** 行走圖方向列（上下左右） */
  stance: SpriteDirection;
};

export type NpcPositionsMap = Record<TargetNPC, NpcWorldState>;

export const NPC_WANDER_RADIUS = 4;
export const NPC_WANDER_INTERVAL_MIN_MS = 1500;
export const NPC_WANDER_INTERVAL_MAX_MS = 2000;

function spawnState(id: TargetNPC): NpcWorldState {
  const spawn = NPC_GRID_POSITIONS[id];
  const stance = NPC_DEFAULT_FACING[id];
  const direction: NpcMapDirection = stance === 'left' ? 'left' : 'right';
  return { x: spawn.x, y: spawn.y, direction, stance };
}

export const NPC_SPAWN_POSITIONS: NpcPositionsMap = {
  Chef: spawnState('Chef'),
  Doctor: spawnState('Doctor'),
  Captain: spawnState('Captain'),
};

export function cloneNpcPositions(source: NpcPositionsMap): NpcPositionsMap {
  return {
    Chef: { ...source.Chef },
    Doctor: { ...source.Doctor },
    Captain: { ...source.Captain },
  };
}

export function manhattanDistance(a: GridPosition, b: GridPosition): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function isWithinWanderRadius(
  pos: GridPosition,
  spawn: GridPosition,
  radius = NPC_WANDER_RADIUS,
): boolean {
  return manhattanDistance(pos, spawn) <= radius;
}

export function isNpcCellOccupied(
  x: number,
  y: number,
  npcPositions: NpcPositionsMap,
  exceptNpcId?: TargetNPC,
): boolean {
  return (Object.entries(npcPositions) as [TargetNPC, NpcWorldState][]).some(
    ([id, p]) => id !== exceptNpcId && p.x === x && p.y === y,
  );
}

function isActiveRatAt(
  x: number,
  y: number,
  ratPositions: RatPositionsMap | undefined,
  completedQuestIds: ReadonlySet<number> | undefined,
): boolean {
  if (!ratPositions || !completedQuestIds) return false;
  return Object.values(ratPositions).some(
    (r) => !completedQuestIds.has(r.questId) && r.x === x && r.y === y,
  );
}

/** NPC 單格移動：地形可通行、不踩玩家／其他 NPC／任務鼠 */
export function canNpcStepTo(
  x: number,
  y: number,
  npcId: TargetNPC,
  npcPositions: NpcPositionsMap,
  playerPos: GridPosition,
  ratPositions?: RatPositionsMap,
  completedQuestIds?: ReadonlySet<number>,
): boolean {
  if (!isInBounds(x, y)) return false;
  if (playerPos.x === x && playerPos.y === y) return false;
  if (isNpcCellOccupied(x, y, npcPositions, npcId)) return false;
  if (isActiveRatAt(x, y, ratPositions, completedQuestIds)) return false;
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

export function pickNpcWanderIntervalMs(): number {
  return (
    NPC_WANDER_INTERVAL_MIN_MS +
    Math.floor(Math.random() * (NPC_WANDER_INTERVAL_MAX_MS - NPC_WANDER_INTERVAL_MIN_MS + 1))
  );
}

/** 玩家走進 NPC 所在格時，將 NPC 推到相鄰空格，避免視覺重疊卡住 */
export function nudgeNpcsOffCell(
  positions: NpcPositionsMap,
  cellX: number,
  cellY: number,
  playerPos: GridPosition,
  ratPositions?: RatPositionsMap,
  completedQuestIds?: ReadonlySet<number>,
): NpcPositionsMap {
  const next = cloneNpcPositions(positions);
  const stepOrder = [
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
  ];

  for (const npcId of Object.keys(NPC_SPAWN_POSITIONS) as TargetNPC[]) {
    const npc = next[npcId];
    if (npc.x !== cellX || npc.y !== cellY) continue;

    for (const { dx, dy } of stepOrder) {
      const tx = cellX + dx;
      const ty = cellY + dy;
      if (!canNpcStepTo(tx, ty, npcId, next, playerPos, ratPositions, completedQuestIds))
        continue;

      let direction = npc.direction;
      let stance = npc.stance;
      if (dx > 0) {
        direction = 'right';
        stance = 'right';
      } else if (dx < 0) {
        direction = 'left';
        stance = 'left';
      } else if (dy > 0) {
        stance = 'down';
      } else if (dy < 0) {
        stance = 'up';
      }

      next[npcId] = { x: tx, y: ty, direction, stance };
      break;
    }
  }

  return next;
}

/** NPC 與任務鼠同格時，將 NPC 輕推至相鄰空格 */
export function nudgeNpcsOffRatCells(
  positions: NpcPositionsMap,
  playerPos: GridPosition,
  ratPositions: RatPositionsMap,
  completedQuestIds: ReadonlySet<number>,
): NpcPositionsMap {
  let next = positions;
  for (const rat of Object.values(ratPositions)) {
    if (completedQuestIds.has(rat.questId)) continue;
    next = nudgeNpcsOffCell(
      next,
      rat.x,
      rat.y,
      playerPos,
      ratPositions,
      completedQuestIds,
    );
  }
  return next;
}

export function computeNpcWanderTick(
  positions: NpcPositionsMap,
  playerPos: GridPosition,
  ratPositions?: RatPositionsMap,
  completedQuestIds?: ReadonlySet<number>,
): NpcPositionsMap {
  const next = cloneNpcPositions(positions);

  (Object.keys(NPC_SPAWN_POSITIONS) as TargetNPC[]).forEach((npcId) => {
    const current = next[npcId];
    const spawn = NPC_SPAWN_POSITIONS[npcId];
    // 玩家已在互動距離內時暫停漫遊，減少擋在窄巷出口
    if (
      Math.abs(current.x - playerPos.x) <= 1 &&
      Math.abs(current.y - playerPos.y) <= 1
    ) {
      return;
    }

    const deltas = shuffleDeltas();

    for (const { dx, dy } of deltas) {
      const target = { x: current.x + dx, y: current.y + dy };
      if (!isWithinWanderRadius(target, spawn)) continue;
      if (
        !canNpcStepTo(
          target.x,
          target.y,
          npcId,
          next,
          playerPos,
          ratPositions,
          completedQuestIds,
        )
      ) {
        continue;
      }

      let direction = current.direction;
      let stance = current.stance;

      if (dx > 0) {
        direction = 'right';
        stance = 'right';
      } else if (dx < 0) {
        direction = 'left';
        stance = 'left';
      } else if (dy > 0) {
        stance = 'down';
      } else if (dy < 0) {
        stance = 'up';
      }

      next[npcId] = { x: target.x, y: target.y, direction, stance };
      break;
    }
  });

  return next;
}

/** 水平朝向是否需 scaleX(-1)（行走圖以右向為底圖時） */
export function isFacingLeft(direction: NpcMapDirection | SpriteDirection): boolean {
  return direction === 'left';
}

/**
 * 對話觸發時：玩家與 NPC 面對面轉向（優先比較 X，同欄則比較 Y）
 */
export function applyDialogueFacing(
  playerPos: GridPosition,
  npcId: TargetNPC,
  positions: NpcPositionsMap,
): { positions: NpcPositionsMap; playerFacing: SpriteDirection } {
  const npc = positions[npcId];
  if (!npc) return { positions, playerFacing: 'down' };

  let npcDirection: NpcMapDirection = npc.direction;
  let npcStance: SpriteDirection = npc.stance;
  let playerFacing: SpriteDirection = 'down';

  if (playerPos.x < npc.x) {
    npcDirection = 'left';
    npcStance = 'left';
    playerFacing = 'right';
  } else if (playerPos.x > npc.x) {
    npcDirection = 'right';
    npcStance = 'right';
    playerFacing = 'left';
  } else if (playerPos.y < npc.y) {
    npcStance = 'up';
    playerFacing = 'down';
  } else if (playerPos.y > npc.y) {
    npcStance = 'down';
    playerFacing = 'up';
  } else {
    npcStance = 'down';
    playerFacing = 'up';
  }

  return {
    positions: {
      ...positions,
      [npcId]: { ...npc, direction: npcDirection, stance: npcStance },
    },
    playerFacing,
  };
}

/** @deprecated 請改用 applyDialogueFacing */
export function faceNpcTowardPlayer(
  npcId: TargetNPC,
  playerPos: GridPosition,
  positions: NpcPositionsMap,
): NpcPositionsMap {
  return applyDialogueFacing(playerPos, npcId, positions).positions;
}
