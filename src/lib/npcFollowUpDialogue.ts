import { NPCS, type TargetNPC } from '../constants/gameData';
import { REQUIRED_LEARNING_NPCS } from '../constants/ratTaunt';

/** 再次拜訪 NPC 時的對話階段 */
export type NpcDialogMode = 'intro' | 'menu' | 'review' | 'farewell';

/**
 * 玩家選擇離開或複習結束後，依學習進度給予動態提示
 */
export function getNpcDepartureMessage(
  _npcId: TargetNPC,
  talkedToNPCs: ReadonlySet<TargetNPC>,
): string {
  const missing = REQUIRED_LEARNING_NPCS.filter((id) => !talkedToNPCs.has(id));

  if (missing.length > 0) {
    const nextId = missing[0];
    const profile = NPCS.find((n) => n.id === nextId);
    if (profile) {
      return `別忘了去拜訪【${profile.name}】喔！他那裡還有重要的防疫知識。`;
    }
  }

  return '你已經準備好了！小鎮角落還有老鼠在作怪，快按 Enter 或 Z 鍵用捕鼠網抓住牠們吧！';
}
