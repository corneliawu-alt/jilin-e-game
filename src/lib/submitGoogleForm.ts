import type { UserInfo } from '../App';
import type { GameResultStats } from '../components/Game';
import { formatElapsedTimeMMSS } from '../constants/gameData';

/**
 * 上傳 Google 試算表（GAS POST）的標準成績物件
 *
 * @example
 * {
 *   class: "501",
 *   seat: "01",
 *   name: "王小明",
 *   baseScore: 90,
 *   score: 1620,
 *   time: "04:00"
 * }
 */
export type GameScoreSubmitPayload = {
  class: string;
  seat: string;
  name: string;
  /** 總積分（100 分制） */
  baseScore: number;
  /** 防疫積分（排行榜競技分） */
  score: number;
  /** 完成時間（MM:SS） */
  time: string;
};

/** @deprecated 請改用 GameScoreSubmitPayload */
export type GoogleFormScorePayload = GameScoreSubmitPayload;

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
  payload: GameScoreSubmitPayload,
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

/** 由登入資料與結算統計組出標準上傳 payload */
export function buildScoreSubmitPayload(
  userInfo: UserInfo,
  stats: GameResultStats,
): GameScoreSubmitPayload {
  return {
    class: userInfo.classId.trim(),
    seat: userInfo.seatNumber.trim(),
    name: userInfo.name.trim(),
    baseScore: stats.score,
    score: stats.leaderboardScore,
    time: formatElapsedTimeMMSS(stats.elapsedSeconds),
  };
}

/** @deprecated 請改用 buildScoreSubmitPayload */
export const buildGoogleFormPayload = buildScoreSubmitPayload;
