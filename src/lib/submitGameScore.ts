import type { UserInfo } from '../App';
import type { GameResultStats } from '../components/Game';
import {
  buildGoogleFormPayload,
  isGoogleFormConfigured,
  submitScoreToGoogleForm,
} from './submitGoogleForm';

export type GameScoreSubmitResult = {
  /** 是否已 POST 至 Google Apps Script（試算表） */
  googleForm: boolean;
};

/**
 * 結算時：將成績 POST 至 Google 試算表（登入頁排行榜亦由此讀取）
 */
export async function submitGameScore(
  userInfo: UserInfo,
  stats: GameResultStats,
  preventionScore: number,
): Promise<GameScoreSubmitResult> {
  const payload = buildGoogleFormPayload(userInfo, stats, preventionScore);

  let googleForm = false;
  if (isGoogleFormConfigured()) {
    googleForm = await submitScoreToGoogleForm(payload);
  }

  return { googleForm };
}
