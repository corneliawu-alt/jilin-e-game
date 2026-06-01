import {
  getNpcPortraitPath,
  getPlayerImagePath,
  getPlayerPortraitPath,
  PLAYER_CHARACTERS,
} from './characterAssets';

export const GAME_TITLE = '料理鼠亡 - 漢他病毒防衛戰';
export const PLAYER_ROLE = '特級衛生稽查員';
export const TOTAL_QUESTS = 10;

export type TargetNPC = 'Chef' | 'Doctor' | 'Captain';
export type MapZone = 'restaurant' | 'clinic' | 'warehouse';

import {
  GRID_WIDTH,
  GRID_HEIGHT,
  TILE_SIZE,
  NPC_GRID_POSITIONS,
  MAP_PIXEL_WIDTH,
  MAP_PIXEL_HEIGHT,
  type GridPosition,
} from './mapConfig';
import {
  isRoadTile,
  isTreeTile,
  isBuildingTile,
  isBlockedTile,
  isWalkableGround,
  isBorderBarrierTile,
  getTileClassName,
  getTileId,
  TileId,
  SCENERY_PROPS,
  MAP_DECORATIONS,
  QUEST_POINTS as GENERATED_QUEST_POINTS,
  TREASURE_SPOTS as GENERATED_TREASURE_SPOTS,
  type TreasureSpot,
  BUILDING_SIGNS,
  BUILDING_DECORATIONS,
  getBuildingMeta,
  getRoadDetail,
  getMainRoadLaneMark,
  SHOP_THEMES,
  generateMap,
  touchesRoadOrSidewalk,
  touchesGrass,
  touchesRoad,
  isMapEdgeForestCell,
  getRoundaboutRing,
  getPlayerSpawnPoint,
  getMainGatePosition,
  MAIN_GATE_ROAD_X,
} from './tilemap';
import { NPC_SPAWN_POSITIONS, type NpcPositionsMap, type NpcWorldState } from './npcWander';
import type { RatPositionsMap } from './ratWander';

export type { NpcPositionsMap } from './npcWander';
export { NPC_SPAWN_POSITIONS } from './npcWander';
export type { RatPositionsMap, RatWorldState } from './ratWander';

/** 主城門正上方、門內幹道起點（由地圖演算法決定） */
export const PLAYER_START = getPlayerSpawnPoint();

export {
  GRID_WIDTH,
  GRID_HEIGHT,
  TILE_SIZE,
  NPC_GRID_POSITIONS,
  MAP_PIXEL_WIDTH,
  MAP_PIXEL_HEIGHT,
  isRoadTile,
  isTreeTile,
  isBuildingTile,
  isBlockedTile,
  isWalkableGround,
  isBorderBarrierTile,
  getTileClassName,
  getTileId,
  TileId,
  SCENERY_PROPS,
  MAP_DECORATIONS,
  BUILDING_SIGNS,
  BUILDING_DECORATIONS,
  getBuildingMeta,
  getRoadDetail,
  getMainRoadLaneMark,
  SHOP_THEMES,
  generateMap,
  touchesRoadOrSidewalk,
  touchesGrass,
  touchesRoad,
  isMapEdgeForestCell,
  getRoundaboutRing,
  getPlayerSpawnPoint,
  getMainGatePosition,
  MAIN_GATE_ROAD_X,
};

export type {
  MapDecoration,
  MapDecorationKind,
  BuildingCellMeta,
  BuildingPart,
  BuildingFacing,
  ShopThemeId,
  RoadDetail,
  QuestPoint,
  TreasureSpot,
  TreasureVariant,
} from './tilemap';

export type { GridPosition };

export type GridTileType = 'restaurant' | 'clinic' | 'warehouse';

export function getGridTileType(x: number, y: number): GridTileType {
  if (x <= 12) return 'restaurant';
  if (x <= 26) return 'clinic';
  return 'warehouse';
}

/** 地圖任務觸發點（questionId 對應 QUESTIONS.id，由 generateMap 演算法產生） */
export const QUEST_POINTS: QuestPoint[] = GENERATED_QUEST_POINTS;

/** 隱藏寶物點（由 generateMap 演算法產生） */
export const TREASURE_SPOTS: TreasureSpot[] = GENERATED_TREASURE_SPOTS;

export type GamePhase = 'learning' | 'combat';

export {
  PREVENTION_ITEMS,
  PREVENTION_ITEMS_BY_ID,
  TREASURE_ITEM,
  createEmptyInventory,
  hasFullBossKit,
  pickTreasureItemId,
  type ItemId,
  type PreventionItem,
  type PlayerInventory,
} from './items';

export function getTreasureAt(
  x: number,
  y: number,
  collectedIds: ReadonlySet<string>,
): TreasureSpot | undefined {
  return TREASURE_SPOTS.find((t) => t.x === x && t.y === y && !collectedIds.has(t.id));
}

export function computeCameraOffset(
  playerPos: GridPosition,
  viewportWidth: number,
  viewportHeight: number,
): { x: number; y: number } {
  const playerCenterX = playerPos.x * TILE_SIZE + TILE_SIZE / 2;
  const playerCenterY = playerPos.y * TILE_SIZE + TILE_SIZE / 2;

  let offsetX = viewportWidth / 2 - playerCenterX;
  let offsetY = viewportHeight / 2 - playerCenterY;

  if (MAP_PIXEL_WIDTH > viewportWidth) {
    offsetX = Math.min(0, Math.max(viewportWidth - MAP_PIXEL_WIDTH, offsetX));
  } else {
    offsetX = (viewportWidth - MAP_PIXEL_WIDTH) / 2;
  }

  if (MAP_PIXEL_HEIGHT > viewportHeight) {
    offsetY = Math.min(0, Math.max(viewportHeight - MAP_PIXEL_HEIGHT, offsetY));
  } else {
    offsetY = (viewportHeight - MAP_PIXEL_HEIGHT) / 2;
  }

  return { x: offsetX, y: offsetY };
}

export function isNpcCell(
  x: number,
  y: number,
  npcPositions: NpcPositionsMap = NPC_SPAWN_POSITIONS,
): boolean {
  return Object.values(npcPositions).some((p) => p.x === x && p.y === y);
}

/** NPC 互動：相鄰九宮格（切比雪夫 ≤1），避免遠距誤判搶走空白鍵 */
export const NPC_INTERACTION_CHEBYSHEV_MAX = 1;
export const NPC_INTERACTION_MANHATTAN_MAX = 1;

/** 老鼠互動：略放寬，減少「對位太準」才觸發 */
export const RAT_INTERACTION_CHEBYSHEV_MAX = 2;
export const RAT_INTERACTION_MANHATTAN_MAX = 2;

/** @deprecated 請改用 isWithinRatInteractionRange / isWithinNpcInteractionRange */
export const INTERACTION_CHEBYSHEV_MAX = RAT_INTERACTION_CHEBYSHEV_MAX;
export const INTERACTION_MANHATTAN_MAX = RAT_INTERACTION_MANHATTAN_MAX;

/** 將格座標強制為整數 Number，避免字串比對造成距離錯誤 */
export function toGridNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : NaN;
}

export function normalizeGridPosition(pos: GridPosition): GridPosition {
  return { x: toGridNumber(pos.x), y: toGridNumber(pos.y) };
}

export function normalizeQuestPoint(point: QuestPoint): QuestPoint {
  return {
    questionId: toGridNumber(point.questionId),
    x: toGridNumber(point.x),
    y: toGridNumber(point.y),
  };
}

function isWithinGridInteractionRange(
  from: GridPosition,
  to: GridPosition,
  chebMax: number,
  manMax: number,
): boolean {
  const px = toGridNumber(from.x);
  const py = toGridNumber(from.y);
  const tx = toGridNumber(to.x);
  const ty = toGridNumber(to.y);
  if (![px, py, tx, ty].every(Number.isFinite)) return false;

  const dx = Math.abs(tx - px);
  const dy = Math.abs(ty - py);
  if (dx === 0 && dy === 0) return false;

  const cheb = Math.max(dx, dy);
  const man = dx + dy;
  return cheb <= chebMax || man <= manMax;
}

/** NPC：僅相鄰格可對話（九宮格，不含同格） */
export function isWithinNpcInteractionRange(
  from: GridPosition,
  to: GridPosition,
): boolean {
  return isWithinGridInteractionRange(
    from,
    to,
    NPC_INTERACTION_CHEBYSHEV_MAX,
    NPC_INTERACTION_MANHATTAN_MAX,
  );
}

/** 老鼠：略放寬的互動範圍 */
export function isWithinRatInteractionRange(
  from: GridPosition,
  to: GridPosition,
): boolean {
  return isWithinGridInteractionRange(
    from,
    to,
    RAT_INTERACTION_CHEBYSHEV_MAX,
    RAT_INTERACTION_MANHATTAN_MAX,
  );
}

/** @deprecated 請改用 isWithinRatInteractionRange */
export function isWithinInteractionRange(
  from: GridPosition,
  to: GridPosition,
): boolean {
  return isWithinRatInteractionRange(from, to);
}

/**
 * 未完成任務鼠的「即時」格座標（以 QUEST_POINTS 為題號來源，合併 ratPositions 漫遊座標）
 */
export function getActiveRatQuestPoints(
  completedIds: ReadonlySet<number>,
  ratPositions?: RatPositionsMap,
): QuestPoint[] {
  return QUEST_POINTS.filter((p) => !completedIds.has(p.questionId)).map((p) => {
    const questionId = toGridNumber(p.questionId);
    const live = ratPositions?.[questionId];
    return {
      questionId,
      x: toGridNumber(live?.x ?? p.x),
      y: toGridNumber(live?.y ?? p.y),
    };
  });
}

/** @deprecated 內部請改用 getActiveRatQuestPoints */
function getActiveRatGridPositions(
  completedIds: ReadonlySet<number>,
  ratPositions?: RatPositionsMap,
): QuestPoint[] {
  return getActiveRatQuestPoints(completedIds, ratPositions);
}

/** 未完成任務的老鼠格視為障礙，禁止玩家踩踏 */
export function isIncompleteQuestRatCell(
  x: number,
  y: number,
  completedIds: ReadonlySet<number>,
  ratPositions?: RatPositionsMap,
): boolean {
  return getActiveRatGridPositions(completedIds, ratPositions).some(
    (r) => r.x === x && r.y === y,
  );
}

/** 碰撞檢測：樹木、建築物、邊界屏障、未完成任務鼠不可進入（NPC 不擋路，可從身旁穿過） */
export function isBlockedCell(
  x: number,
  y: number,
  _npcPositions: NpcPositionsMap = NPC_SPAWN_POSITIONS,
  completedQuestIds?: ReadonlySet<number>,
  ratPositions?: RatPositionsMap,
): boolean {
  if (!isInBounds(x, y)) return true;
  if (
    completedQuestIds &&
    isIncompleteQuestRatCell(x, y, completedQuestIds, ratPositions)
  ) {
    return true;
  }
  return isBlockedTile(x, y) || isBorderBarrierTile(x, y);
}

/** @deprecated 使用 isTreeTile；保留相容 */
export function isObstacleCell(x: number, y: number): boolean {
  return isTreeTile(x, y);
}

export function isInBounds(x: number, y: number): boolean {
  return x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT;
}

export function canMoveTo(
  x: number,
  y: number,
  npcPositions: NpcPositionsMap = NPC_SPAWN_POSITIONS,
  completedQuestIds?: ReadonlySet<number>,
  ratPositions?: RatPositionsMap,
): boolean {
  return (
    isInBounds(x, y) &&
    !isBlockedCell(x, y, npcPositions, completedQuestIds, ratPositions)
  );
}

/** 九宮格內最近的 NPC（多人在範圍內時只取一個） */
export function getNearbyNpc(
  playerPos: GridPosition,
  npcPositions: NpcPositionsMap = NPC_SPAWN_POSITIONS,
): TargetNPC | null {
  let bestId: TargetNPC | null = null;
  let bestCheb = Infinity;
  let bestMan = Infinity;

  for (const [id, pos] of Object.entries(npcPositions) as [
    TargetNPC,
    NpcWorldState,
  ][]) {
    if (!isWithinNpcInteractionRange(playerPos, pos)) continue;
    const cheb = Math.max(
      Math.abs(pos.x - playerPos.x),
      Math.abs(pos.y - playerPos.y),
    );
    const man =
      Math.abs(pos.x - playerPos.x) + Math.abs(pos.y - playerPos.y);
    if (
      cheb < bestCheb ||
      (cheb === bestCheb && man < bestMan) ||
      (cheb === bestCheb && man === bestMan && id < (bestId ?? 'Doctor'))
    ) {
      bestCheb = cheb;
      bestMan = man;
      bestId = id;
    }
  }

  return bestId;
}

/** @deprecated 請改用 getNearbyNpc（含斜角相鄰） */
export function getAdjacentNpc(
  playerPos: GridPosition,
  npcPositions: NpcPositionsMap = NPC_SPAWN_POSITIONS,
): TargetNPC | null {
  return getNearbyNpc(playerPos, npcPositions);
}

export type QuestQuestion = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  successMsg: string;
  errorMsg: string;
  targetNPC: TargetNPC;
};

/** 與文件一致的題目型別別名 */
export type Question = QuestQuestion;

export const QUESTIONS: QuestQuestion[] = [
  {
    id: 1,
    question: '人類主要是如何感染漢他病毒的？',
    options: [
      '(A) 吃了沒煮熟的豬肉',
      '(B) 吸入或接觸遭鼠糞尿污染的飛揚塵土',
      '(C) 被蚊子叮咬',
      '(D) 與感染者握手',
    ],
    correctAnswer: 1,
    successMsg: '太棒了！你精準掌握了病毒的傳播途徑，避開了危險的塵土！',
    errorMsg: '答錯囉！漢他病毒的傳播方式很特別，建議你去「小鎮診所」找【鎮守醫師】問問看！',
    targetNPC: 'Doctor',
  },
  {
    id: 2,
    question: '感染漢他病毒後，潛伏期大約是多久？',
    options: [
      '(A) 半天到一天',
      '(B) 數天至兩個月',
      '(C) 必定超過半年',
      '(D) 不會有潛伏期，立刻發病',
    ],
    correctAnswer: 1,
    successMsg: '完全正確！潛伏期變數很大，隨時保持警覺是稽查員的本分！',
    errorMsg: '不太對喔，這種病毒發作的時間範圍很廣，去問問【鎮守醫師】確切的時間吧！',
    targetNPC: 'Doctor',
  },
  {
    id: 3,
    question: '漢他病毒感染初期的主要症狀「不包含」下列何者？',
    options: [
      '(A) 突然且持續性發燒',
      '(B) 結膜充血、虛弱',
      '(C) 大量掉頭髮',
      '(D) 背痛、頭痛、嘔吐',
    ],
    correctAnswer: 2,
    successMsg: '判斷正確！你沒有被錯誤的症狀混淆，成功篩檢出潛在病患！',
    errorMsg: '症狀判斷錯誤可能會延誤就醫！快去找【鎮守醫師】確認初期症狀有哪些。',
    targetNPC: 'Doctor',
  },
  {
    id: 4,
    question: '感染漢他病毒約第3至6天後，部分患者可能會出現什麼嚴重的病變？',
    options: [
      '(A) 聽力永久喪失',
      '(B) 急性腎衰竭與休克',
      '(C) 骨折',
      '(D) 氣喘發作',
    ],
    correctAnswer: 1,
    successMsg: '沒錯！漢他病毒對腎臟的破壞極大，及早治療才能改善病況。',
    errorMsg: '危險！這可是會致命的併發症。趕快去請教【鎮守醫師】病情惡化會發生什麼事。',
    targetNPC: 'Doctor',
  },
  {
    id: 5,
    question: '疾管署呼籲預防漢他病毒最有效的「三不」方法是什麼？',
    options: [
      '(A) 不聽、不看、不說',
      '(B) 不讓鼠來、不讓鼠住、不讓鼠吃',
      '(C) 不養貓、不養狗、不養鳥',
      '(D) 不出門、不開窗、不洗手',
    ],
    correctAnswer: 1,
    successMsg: '防疫口訣背得滾瓜爛熟！你成功守護了小鎮的防線！',
    errorMsg: '連最重要的防疫口訣都忘了？快回餐廳找【餐廳大廚】複習一下！',
    targetNPC: 'Chef',
  },
  {
    id: 6,
    question: '為了落實「不讓鼠吃」，家中哪些東西必須妥善處理？',
    options: [
      '(A) 廚餘或動物飼料',
      '(B) 舊報紙與雜誌',
      '(C) 乾淨的衣物',
      '(D) 塑膠玩具',
    ],
    correctAnswer: 0,
    successMsg: '做得好！斷絕老鼠的食物來源，牠們自然就不會來了！',
    errorMsg: '老鼠可是貪吃的傢伙！去看看【餐廳大廚】平時是怎麼收納食材的。',
    targetNPC: 'Chef',
  },
  {
    id: 7,
    question: '為了落實「不讓鼠住」，平時應該注意清理哪裡？',
    options: [
      '(A) 冰箱冷凍庫裡',
      '(B) 密閉的保險箱',
      '(C) 老鼠可能躲藏的死角、倉庫與儲藏室',
      '(D) 魚缸內部',
    ],
    correctAnswer: 2,
    successMsg: '敏銳的觀察力！你成功清除了老鼠溫床！',
    errorMsg: '老鼠喜歡躲在哪裡你還不知道嗎？快去問問【餐廳大廚】環境死角在哪裡。',
    targetNPC: 'Chef',
  },
  {
    id: 8,
    question: '如果發現鼠類排泄物，清理前的第一步「正確防護」是什麼？',
    options: [
      '(A) 立刻用掃把大力掃起來',
      '(B) 佩戴口罩、橡膠手套並打開門窗',
      '(C) 拿吸塵器直接吸乾淨',
      '(D) 徒手撿起來丟掉',
    ],
    correctAnswer: 1,
    successMsg: '防護滿分！這樣就不怕含有病毒的飛揚塵土了！',
    errorMsg: '太危險了！直接清理會吸入病毒！快去倉庫找【清潔隊長】學習標準防護裝備。',
    targetNPC: 'Captain',
  },
  {
    id: 9,
    question: '清理老鼠排泄物時，市售漂白水與清水的建議稀釋比例是多少？',
    options: [
      '(A) 100cc漂白水 + 1公升清水',
      '(B) 10cc漂白水 + 10公升清水',
      '(C) 1公升漂白水 + 100cc清水',
      '(D) 完全不需要加水',
    ],
    correctAnswer: 0,
    successMsg: '比例完美！這桶消毒水將成為消滅病毒的最佳武器！',
    errorMsg: '比例不對可是殺不死病毒的喔！快去請教【清潔隊長】漂白水的正確調法。',
    targetNPC: 'Captain',
  },
  {
    id: 10,
    question: '將稀釋漂白水潑灑於可能被污染的環境後，應該等待多久再行清理？',
    options: [
      '(A) 3秒鐘',
      '(B) 3分鐘',
      '(C) 30分鐘',
      '(D) 3小時',
    ],
    correctAnswer: 2,
    successMsg: '耐心是成功消滅病毒的關鍵！恭喜你完成了終極清潔任務！',
    errorMsg: '太急躁了！消毒液需要時間發揮作用，去問問【清潔隊長】要等多久吧。',
    targetNPC: 'Captain',
  },
];

/** 文件指定之 questions 陣列（與 QUESTIONS 相同） */
export const questions = QUESTIONS;

export const MAP_ZONE_BOUNDS: {
  id: MapZone;
  label: string;
  xStart: number;
  xEnd: number;
  tint: string;
  border: string;
  textClass: string;
}[] = [
  {
    id: 'restaurant',
    label: '餐廳區',
    xStart: 0,
    xEnd: 12,
    tint: 'rgba(251, 191, 36, 0.07)',
    border: 'rgba(245, 158, 11, 0.45)',
    textClass: 'text-amber-900',
  },
  {
    id: 'clinic',
    label: '診所區',
    xStart: 13,
    xEnd: 26,
    tint: 'rgba(56, 189, 248, 0.07)',
    border: 'rgba(14, 165, 233, 0.45)',
    textClass: 'text-sky-900',
  },
  {
    id: 'warehouse',
    label: '倉庫區',
    xStart: 27,
    xEnd: GRID_WIDTH - 1,
    tint: 'rgba(168, 162, 158, 0.08)',
    border: 'rgba(120, 113, 108, 0.5)',
    textClass: 'text-stone-800',
  },
];

export function getQuestPointAt(
  x: number,
  y: number,
  completedIds: ReadonlySet<number>,
  ratPositions?: RatPositionsMap,
): QuestPoint | undefined {
  const gx = toGridNumber(x);
  const gy = toGridNumber(y);
  const hit = getActiveRatQuestPoints(completedIds, ratPositions).find(
    (r) => r.x === gx && r.y === gy,
  );
  return hit ? normalizeQuestPoint(hit) : undefined;
}

/**
 * 空白鍵用：在互動範圍內找「唯一」最近未完成任務鼠
 * 以 QUEST_POINTS + ratPositions 即時座標為準，確保 questionId 永遠有效
 */
export function findNearestInteractableQuest(
  playerPos: GridPosition,
  completedIds: ReadonlySet<number>,
  ratPositions?: RatPositionsMap,
): QuestPoint | undefined {
  const player = normalizeGridPosition(playerPos);
  let best: QuestPoint | undefined;
  let bestCheb = Infinity;
  let bestMan = Infinity;

  for (const q of getActiveRatQuestPoints(completedIds, ratPositions)) {
    const quest = normalizeQuestPoint(q);
    if (!Number.isFinite(quest.questionId)) continue;
    if (completedIds.has(quest.questionId)) continue;

    if (!isWithinRatInteractionRange(player, quest)) continue;

    const dx = Math.abs(quest.x - player.x);
    const dy = Math.abs(quest.y - player.y);

    const cheb = Math.max(dx, dy);
    const man = dx + dy;
    if (
      cheb < bestCheb ||
      (cheb === bestCheb && man < bestMan) ||
      (cheb === bestCheb &&
        man === bestMan &&
        quest.questionId < (best?.questionId ?? Infinity))
    ) {
      bestCheb = cheb;
      bestMan = man;
      best = quest;
    }
  }

  return best;
}

/** @deprecated 請改用 findNearestInteractableQuest */
export function getNearbyQuestPoint(
  playerPos: GridPosition,
  completedIds: ReadonlySet<number>,
  ratPositions?: RatPositionsMap,
): QuestPoint | undefined {
  return findNearestInteractableQuest(playerPos, completedIds, ratPositions);
}

export type ResolvedRatQuest = { point: QuestPoint; question: QuestQuestion };

/** 解析任務鼠＋題庫（點擊／互動前驗證，避免錯題或缺欄位） */
export function resolveRatQuestTarget(
  point: QuestPoint,
  completedIds: ReadonlySet<number>,
  ratPositions?: RatPositionsMap,
): ResolvedRatQuest | null {
  const questId = toGridNumber(point.questionId);
  if (!Number.isFinite(questId) || completedIds.has(questId)) {
    return null;
  }

  const spawn = QUEST_POINTS.find((p) => p.questionId === questId);
  const live = ratPositions?.[questId];
  const resolved = normalizeQuestPoint({
    questionId: questId,
    x: live?.x ?? spawn?.x ?? point.x,
    y: live?.y ?? spawn?.y ?? point.y,
  });

  const question = getQuestionById(questId);
  if (!isValidQuestQuestion(question)) {
    return null;
  }

  return { point: resolved, question };
}

/** @deprecated 請改用 getNearbyQuestPoint */
export function getAdjacentQuestPoint(
  playerPos: GridPosition,
  completedIds: ReadonlySet<number>,
  ratPositions?: RatPositionsMap,
): QuestPoint | undefined {
  return getNearbyQuestPoint(playerPos, completedIds, ratPositions);
}

export function isAdjacentToQuestRat(
  playerPos: GridPosition,
  completedIds: ReadonlySet<number>,
  ratPositions?: RatPositionsMap,
): boolean {
  return !!getNearbyQuestPoint(playerPos, completedIds, ratPositions);
}

/** 任務鼠格（含漫遊後座標） */
export function isRatEncounterCell(
  x: number,
  y: number,
  completedIds: ReadonlySet<number>,
  ratPositions?: RatPositionsMap,
): boolean {
  return !!getQuestPointAt(x, y, completedIds, ratPositions);
}

export function getQuestionById(id: number): QuestQuestion | undefined {
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) return undefined;
  return QUESTIONS.find((q) => q.id === numericId);
}

/** 驗證題目資料完整（correctAnswer 可為 0） */
export function isValidQuestQuestion(
  question: QuestQuestion | undefined,
): question is QuestQuestion {
  if (!question) return false;
  const { options, correctAnswer } = question;
  if (!Array.isArray(options) || options.length === 0) return false;
  if (!Number.isInteger(correctAnswer)) return false;
  if (correctAnswer < 0 || correctAnswer >= options.length) return false;
  if (typeof question.question !== 'string' || !question.question.trim()) return false;
  return true;
}

export type NpcProfile = {
  id: TargetNPC;
  name: string;
  zone: MapZone;
  zoneLabel: string;
  emoji: string;
  imagePath: string;
  x: number;
  y: number;
  idleDialogue: string[];
  clueDialogue: string;
};

export const NPCS: NpcProfile[] = [
  {
    id: 'Chef',
    name: '餐廳大廚',
    zone: 'restaurant',
    zoneLabel: '小鎮餐廳',
    emoji: '👨‍🍳',
    imagePath: getNpcPortraitPath('Chef'),
    x: NPC_GRID_POSITIONS.Chef.x,
    y: NPC_GRID_POSITIONS.Chef.y,
    idleDialogue: [
      '哎呀，氣死我了！你是新來的衛生稽查員對吧？快幫幫我，我這頂級廚房可容不下半隻老鼠！',
      '要知道，防鼠最重要的最高指導原則就是「三不」：不讓鼠來、不讓鼠住、不讓鼠吃！你得牢牢記住！',
      '像我們餐廳啊，廚餘和動物飼料絕對要妥善密封處理，斷絕老鼠的食物來源，這就是「不讓鼠吃」。',
      '還有，平時得仔細檢查牆角的破洞、清理倉庫和儲藏室這些容易躲藏的死角。這樣才能做到「不讓鼠住」！懂了嗎？',
      '對了！聽說鎮上的死角藏著一些特別的寶物...像是「滅鼠妙寶-黏鼠板」！如果你在角落探索時找到了，對付這些傢伙會更有利喔！快去巡視吧！',
    ],
    clueDialogue:
      '防鼠三不：不讓鼠來、不讓鼠住、不讓鼠吃！廚餘和飼料要密封，牆角破洞要補好，倉庫死角要清理！',
  },
  {
    id: 'Doctor',
    name: '鎮守醫師',
    zone: 'clinic',
    zoneLabel: '小鎮診所',
    emoji: '👨‍⚕️',
    imagePath: getNpcPortraitPath('Doctor'),
    x: NPC_GRID_POSITIONS.Doctor.x,
    y: NPC_GRID_POSITIONS.Doctor.y,
    idleDialogue: [
      '你好啊，年輕的稽查員。吉林小鎮最近爆發了漢他病毒疫情，情況很不樂觀...',
      '這是一種人畜共通傳染病！你不需要被老鼠咬到，只要吸入或接觸到帶有病毒的老鼠糞尿「飛揚塵土」，就有極高的感染風險！',
      '你要特別注意，這病毒的潛伏期變數很大，通常是數天到兩個月不等，防不勝防。',
      '一開始的症狀很像感冒：會突然且持續性發燒，伴隨頭痛、背痛、虛弱，甚至會有結膜充血和嘔吐的現象。',
      '最危險的是第 3 到第 6 天！部分患者病情會急轉直下，出現出血、低血壓、休克，甚至引發嚴重的「急性腎衰竭」！這可不是鬧著玩的，請務必小心！',
    ],
    clueDialogue:
      '漢他病毒經糞尿塵土傳播，潛伏期數天至兩個月。初期像感冒，第 3～6 天最危險，可能出血、低血壓、急性腎衰竭！',
  },
  {
    id: 'Captain',
    name: '清潔隊長',
    zone: 'warehouse',
    zoneLabel: '小鎮倉庫',
    emoji: '🧹',
    imagePath: getNpcPortraitPath('Captain'),
    x: NPC_GRID_POSITIONS.Captain.x,
    y: NPC_GRID_POSITIONS.Captain.y,
    idleDialogue: [
      '喂！那邊那個菜鳥稽查員！別亂碰地上的髒東西！',
      '聽好了，如果發現老鼠的排泄物，「絕對不可以」直接拿掃把大力掃！那會揚起帶病毒的塵土！',
      '清理前的第一步，必須先打開門窗通風，並佩戴好「口罩」和「橡膠手套」，做好萬全防護才能開始作業。',
      '至於消毒液的調配比例...記清楚了：使用市售漂白水與清水，比例是「100cc 漂白水加 1 公升清水」。這才是能殺死病毒的黃金比例！',
      '最後，也是最重要的終極密碼：將漂白水潑灑在髒污處後，千萬別急著擦！你必須耐心等待「30 分鐘」讓消毒作用完全發揮，才能動手清理！去吧，小鎮的整潔就交給你了！',
    ],
    clueDialogue:
      '清理鼠糞勿直接掃！先通風，戴口罩和手套。漂白水 100cc 加 1 公升清水，潑灑後等待 30 分鐘再清理！',
  },
];

export const MAP_ZONES: {
  id: MapZone;
  label: string;
  subtitle: string;
  bgClass: string;
  borderClass: string;
  npcId: TargetNPC;
}[] = [
  {
    id: 'restaurant',
    label: '餐廳',
    subtitle: '小鎮餐廳',
    bgClass: 'from-amber-100 to-orange-200',
    borderClass: 'border-amber-400',
    npcId: 'Chef',
  },
  {
    id: 'clinic',
    label: '診所',
    subtitle: '小鎮診所',
    bgClass: 'from-sky-100 to-blue-200',
    borderClass: 'border-sky-400',
    npcId: 'Doctor',
  },
  {
    id: 'warehouse',
    label: '倉庫',
    subtitle: '小鎮倉庫',
    bgClass: 'from-stone-200 to-stone-300',
    borderClass: 'border-stone-500',
    npcId: 'Captain',
  },
];

export const DOLLS = PLAYER_CHARACTERS.map((c) => ({
  id: c.id,
  name: c.name,
  img: c.portrait,
  sprite: c.portrait,
  imagePath: c.portrait,
  color: c.color,
  description: c.description,
}));

export function calculateStars(score: number): 1 | 2 | 3 {
  if (score >= 85) return 3;
  if (score >= 60) return 2;
  return 1;
}

export function calculateFinalScore(
  completedQuests: number,
  firstTryCorrect: number,
  elapsedSeconds: number,
): number {
  const accuracyPart = (firstTryCorrect / TOTAL_QUESTS) * 70;
  const completionPart = (completedQuests / TOTAL_QUESTS) * 20;
  const minutes = elapsedSeconds / 60;
  const timePart = Math.max(0, 10 - minutes * 1.5);
  return Math.round(Math.min(100, accuracyPart + completionPart + timePart));
}

/** 依防疫總積分與綜合得分授予結局稱號 */
export function getHonorTitle(preventionScore: number, finalScore: number): string {
  if (preventionScore >= 100 && finalScore >= 90) return '傳說級防疫大師';
  if (preventionScore >= 70 || finalScore >= 75) return '金牌衛生稽查員';
  return '見習衛生稽查員';
}

export function formatElapsedTime(elapsedSeconds: number): string {
  const m = Math.floor(elapsedSeconds / 60);
  const s = elapsedSeconds % 60;
  return `${m} 分 ${s.toString().padStart(2, '0')} 秒`;
}
