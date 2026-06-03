import type { TargetNPC } from './gameData';

export const REQUIRED_LEARNING_NPCS: TargetNPC[] = ['Chef', 'Doctor', 'Captain'];

/** 尚未完成 NPC 學習時，老鼠的通用嘲諷（Enter／Z 抓鼠觸發） */
export const PRE_LEARNING_RAT_GENERIC_TAUNT =
  '吱吱！你連怎麼對付我都不知道，還想抓我？快去跟鎮上的大人們學學吧！';

/** 學習期老鼠嘲諷：依尚未互動的 NPC 各兩句 */
export const RAT_TAUNT_LINES_BY_NPC: Record<TargetNPC, readonly [string, string]> = {
  Chef: [
    '吱吱！你連防鼠的「三不」口訣都不會，還想抓我？快去【小鎮餐廳】找【餐廳大廚】補習吧！',
    '哈哈！我不怕你！你根本不知道我最喜歡偷吃什麼！去【小鎮餐廳】問問大廚吧，吱！',
  ],
  Doctor: [
    '略略略～想抓我？你連漢他病毒的潛伏期有多長都不知道！去【小鎮診所】找【鎮守醫師】打聽一下吧！',
    '吱！你根本不知道我的飛揚塵土有多危險！快去【小鎮診所】報到吧，菜鳥！',
  ],
  Captain: [
    '就憑你？連漂白水比例都不會調，還想消滅我？快去右下角的【小鎮倉庫】找【清潔隊長】學學吧！吱吱！',
    '吱吱！沒戴口罩跟手套也敢靠近我？你不怕被感染嗎？去【小鎮倉庫】問問隊長標準裝備是什麼吧！',
  ],
};

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

/** 從尚未互動的 NPC 中隨機挑一位，再從其嘲諷庫隨機取一句 */
export function generateLearningRatTaunt(talkedToNPCs: ReadonlySet<TargetNPC>): string {
  const missing = REQUIRED_LEARNING_NPCS.filter((npc) => !talkedToNPCs.has(npc));
  if (missing.length === REQUIRED_LEARNING_NPCS.length) {
    return PRE_LEARNING_RAT_GENERIC_TAUNT;
  }
  if (Math.random() < 0.35) {
    return PRE_LEARNING_RAT_GENERIC_TAUNT;
  }
  const targetNpc = pickRandom(missing.length > 0 ? missing : REQUIRED_LEARNING_NPCS);
  return pickRandom(RAT_TAUNT_LINES_BY_NPC[targetNpc]);
}
