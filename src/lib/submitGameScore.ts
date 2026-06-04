import type { UserInfo } from '../App';
import type { GameResultStats } from '../components/Game';
import {
  buildScoreSubmitPayload,
  isGoogleFormConfigured,
  submitScoreToGoogleForm,
} from './submitGoogleForm';

export type GameScoreSubmitResult = {
  /** 是否已 POST 至 Google Apps Script（試算表） */
  googleForm: boolean;
};

/**
 * 結算時：將成績 POST 至 Google 試算表（Score=總積分，排行榜由 Score+Time 推算防疫積分）
 */
export async function submitGameScore(
  userInfo: UserInfo,
  stats: GameResultStats,
): Promise<GameScoreSubmitResult> {
  const payload = buildScoreSubmitPayload(userInfo, stats);

  let googleForm = false;
  if (isGoogleFormConfigured()) {
    googleForm = await submitScoreToGoogleForm(payload);
  }

  return { googleForm };
}
