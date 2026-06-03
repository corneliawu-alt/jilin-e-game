import type { UserInfo } from '../App';
import type { GameResultStats } from '../components/Game';
import { formatElapsedTimeMMSS } from '../constants/gameData';

/** 傳送至 Google Apps Script（寫入試算表）的成績 payload */
export type GoogleFormScorePayload = {
  classId: string;
  seatNumber: string;
  name: string;
  totalScore: number;
  elapsedTime: string;
  preventionScore: number;
  completedQuests: number;
  stars: number;
  /** 與試算表標題列一致（Timestamp 由 GAS 寫入） */
  Class: string;
  Seat: string;
  Name: string;
  Score: number;
  Time: string;
};

const GAS_URL = import.meta.env.VITE_GOOGLE_FORM_SCRIPT_URL?.trim() ?? '';

export function isGoogleFormConfigured(): boolean {
  return GAS_URL.length > 0;
}

export function getGoogleFormScriptUrl(): string {
  return GAS_URL;
}

/**
 * POST 成績至 GAS 網路應用程式（寫入試算表）
 * 使用 text/plain + CORS，避免 no-cors 導致 JSON 無法送達且無法讀取結果
 */
export async function submitScoreToGoogleForm(
  payload: GoogleFormScorePayload,
): Promise<boolean> {
  if (!isGoogleFormConfigured()) {
    if (import.meta.env.DEV) {
      console.info(
        '[ScoreSubmit] 未設定 VITE_GOOGLE_FORM_SCRIPT_URL，略過 Google 試算表上傳',
      );
    }
    return false;
  }

  try {
    const response = await fetch(GAS_URL, {
      method: 'POST',
      mode: 'cors',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    let parsed: { ok?: boolean; error?: string } | null = null;
    try {
      parsed = JSON.parse(text) as { ok?: boolean; error?: string };
    } catch {
      // 部分部署可能回傳 HTML，仍依 HTTP 狀態判斷
    }

    const success = response.ok && parsed?.ok !== false;
    if (!success) {
      console.warn(
        '[ScoreSubmit] Google 試算表上傳失敗',
        { status: response.status, body: text.slice(0, 200) },
      );
    }
    return success;
  } catch (error) {
    console.warn('[ScoreSubmit] Google 試算表上傳失敗：', error);
    return false;
  }
}

export function buildGoogleFormPayload(
  userInfo: UserInfo,
  stats: GameResultStats,
  preventionScore: number,
): GoogleFormScorePayload {
  const elapsedTime = formatElapsedTimeMMSS(stats.elapsedSeconds);
  return {
    classId: userInfo.classId,
    seatNumber: userInfo.seatNumber,
    name: userInfo.name,
    totalScore: stats.score,
    elapsedTime,
    preventionScore,
    completedQuests: stats.completedQuests,
    stars: stats.stars,
    Class: userInfo.classId,
    Seat: userInfo.seatNumber,
    Name: userInfo.name,
    Score: stats.score,
    Time: elapsedTime,
  };
}
