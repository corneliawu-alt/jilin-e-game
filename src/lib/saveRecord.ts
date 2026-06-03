import type { UserInfo } from '../App';
import type { GameResultStats } from '../components/Game';
import { saveLeaderboardRecord } from './leaderboard';

/** @deprecated 請改用 saveLeaderboardRecord */
export async function saveLocalStudentRecord(
  userInfo: UserInfo,
  stats: GameResultStats,
  preventionScore: number,
): Promise<void> {
  saveLeaderboardRecord(userInfo, stats, preventionScore);
}
