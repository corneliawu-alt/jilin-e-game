import type { UserInfo } from '../App';
import type { GameResultStats } from '../components/Game';

/** @deprecated 成績僅寫入 Google 試算表，請改用 submitGameScore */
export async function saveLocalStudentRecord(
  _userInfo: UserInfo,
  _stats: GameResultStats,
  _preventionScore: number,
): Promise<void> {
  // 本機排行榜已移除
}
