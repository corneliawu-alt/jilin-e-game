import type { UserInfo } from '../App';
import type { GameResultStats } from '../components/Game';
import { formatElapsedTimeMMSS } from '../constants/gameData';

/** 傳送至 Google Apps Script（寫入試算表）的成績 payload */
export type GoogleFormScorePayload = {
  /** 班級 */
  classId: string;
  /** 座號 */
  seatNumber: string;
  /** 姓名 */
  name: string;
  /** 總積分（綜合得分：答題正確率 + 完成度 + 時間） */
  totalScore: number;
  /** 完成時間 MM:SS */
  elapsedTime: string;
  /** 以下為延伸欄位，供 GAS 選用 */
  preventionScore: number;
  completedQuests: number;
  stars: number;
};

const GAS_URL = import.meta.env.VITE_GOOGLE_FORM_SCRIPT_URL?.trim() ?? '';

export function isGoogleFormConfigured(): boolean {
  return GAS_URL.length > 0;
}

/**
 * 背景 POST 成績至 GAS（不阻塞 UI；未設定 URL 時靜默略過）
 */
export async function submitScoreToGoogleForm(
  payload: GoogleFormScorePayload,
): Promise<boolean> {
  if (!isGoogleFormConfigured()) return false;

  try {
    await fetch(GAS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return true;
  } catch (error) {
    console.warn('[ScoreSubmit] Google Form 上傳失敗：', error);
    return false;
  }
}

export function buildGoogleFormPayload(
  userInfo: UserInfo,
  stats: GameResultStats,
  preventionScore: number,
): GoogleFormScorePayload {
  return {
    classId: userInfo.classId,
    seatNumber: userInfo.seatNumber,
    name: userInfo.name,
    totalScore: stats.score,
    elapsedTime: formatElapsedTimeMMSS(stats.elapsedSeconds),
    preventionScore,
    completedQuests: stats.completedQuests,
    stars: stats.stars,
  };
}
