export type ItemId = 'mouse_trap' | 'bleach' | 'mask';

export type PreventionItem = {
  id: ItemId;
  name: string;
  emoji: string;
  description: string;
  scoreBonus: number;
};

export const PREVENTION_ITEMS: PreventionItem[] = [
  {
    id: 'mouse_trap',
    name: '黏鼠板',
    emoji: '🪤',
    description: '對付角落老鼠的利器',
    scoreBonus: 50,
  },
  {
    id: 'bleach',
    name: '漂白水',
    emoji: '🧴',
    description: '調配黃金比例消毒水必備',
    scoreBonus: 50,
  },
  {
    id: 'mask',
    name: '防護口罩',
    emoji: '😷',
    description: '避免吸入飛揚塵土',
    scoreBonus: 50,
  },
];

export const PREVENTION_ITEMS_BY_ID: Record<ItemId, PreventionItem> = Object.fromEntries(
  PREVENTION_ITEMS.map((item) => [item.id, item]),
) as Record<ItemId, PreventionItem>;

export type PlayerInventory = Record<ItemId, number>;

export function createEmptyInventory(): PlayerInventory {
  return { mouse_trap: 0, bleach: 0, mask: 0 };
}

export function hasFullBossKit(inventory: PlayerInventory): boolean {
  return PREVENTION_ITEMS.every((item) => inventory[item.id] >= 1);
}

/** 第 10 隻任務鼠（最後一隻）缺少的防疫道具顯示名稱 */
export function getMissingFinalQuestItemLabels(inventory: PlayerInventory): string[] {
  const missing: string[] = [];
  if (inventory.mouse_trap < 1) missing.push('【黏鼠板】');
  if (inventory.bleach < 1) missing.push('【漂白水】');
  if (inventory.mask < 1) missing.push('【口罩】');
  return missing;
}

export function buildFinalQuestBlockedMessage(inventory: PlayerInventory): string {
  const missing = getMissingFinalQuestItemLabels(inventory);
  return `對抗最後的變異鼠王需要齊全的防疫裝備！你還缺少：${missing.join('、')}。請在地圖角落尋找寶箱！`;
}

export function pickTreasureItemId(x: number, y: number, seed = 0): ItemId {
  const h = Math.abs((x * 928371 + y * 689287 + seed * 982451) % 2147483647);
  const pool: ItemId[] = ['mouse_trap', 'bleach', 'mask'];
  return pool[h % pool.length];
}

/** 決定性洗牌，確保前 N 個寶物點能各分配一種必備道具 */
export function shuffledTreasureItemOrder(seed: number): ItemId[] {
  const order: ItemId[] = PREVENTION_ITEMS.map((item) => item.id);
  for (let i = order.length - 1; i > 0; i--) {
    const h = Math.abs((seed * 928371 + i * 689287) % 2147483647);
    const j = h % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

export function treasureItemIdForSpot(
  spotIndex: number,
  x: number,
  y: number,
  requiredOrder: readonly ItemId[],
): ItemId {
  if (spotIndex < requiredOrder.length) return requiredOrder[spotIndex]!;
  return pickTreasureItemId(x, y, spotIndex);
}

/** @deprecated 使用 PREVENTION_ITEMS */
export const TREASURE_ITEM = PREVENTION_ITEMS_BY_ID.mouse_trap;
