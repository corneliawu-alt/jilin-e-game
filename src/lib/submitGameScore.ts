import type { UserInfo } from '../App';
import type { GameResultStats } from '../components/Game';
import { saveLeaderboardRecord } from './leaderboard';
import {
  buildGoogleFormPayload,
  isGoogleFormConfigured,
  submitScoreToGoogleForm,
} from './submitGoogleForm';

export type GameScoreSubmitResult = {
  /** 是否已 POST 至 Google Apps Script（試算表） */
  googleForm: boolean;
  /** 是否已寫入 localStorage 排行榜 */
  leaderboardSaved: boolean;
};

/**
 * 結算時：Google 試算表 POST + 破關成績寫入 localStorage 排行榜
 */
export async function submitGameScore(
  userInfo: UserInfo,
  stats: GameResultStats,
  preventionScore: number,
): Promise<GameScoreSubmitResult> {
  let leaderboardSaved = false;
  try {
    saveLeaderboardRecord(userInfo, stats, preventionScore);
    leaderboardSaved = true;
  } catch (error) {
    console.warn('[ScoreSubmit] 排行榜存檔失敗：', error);
  }

  const payload = buildGoogleFormPayload(userInfo, stats, preventionScore);

  let googleForm = false;
  if (isGoogleFormConfigured()) {
    googleForm = await submitScoreToGoogleForm(payload);
  }

  return { googleForm, leaderboardSaved };
}
