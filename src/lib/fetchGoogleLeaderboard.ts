import type { LeaderboardEntry } from './leaderboard';
import { getGoogleFormScriptUrl, isGoogleFormConfigured } from './submitGoogleForm';

type GoogleLeaderboardRow = {
  classId?: string;
  seatNumber?: string;
  name?: string;
  baseScore?: number;
  leaderboardScore?: number;
  elapsedTime?: string;
  elapsedSeconds?: number;
  savedAt?: string;
};

type GoogleLeaderboardResponse = {
  ok?: boolean;
  error?: string;
  entries?: GoogleLeaderboardRow[];
};

function buildLeaderboardUrl(limit: number): string {
  const base = getGoogleFormScriptUrl();
  const url = new URL(base);
  url.searchParams.set('action', 'leaderboard');
  url.searchParams.set('limit', String(limit));
  return url.toString();
}

/** 從 GAS 讀取試算表中最快的前 N 名（需部署含 doGet leaderboard 的腳本） */
export async function fetchTopSpeedrunFromGoogle(
  limit = 6,
): Promise<LeaderboardEntry[]> {
  if (!isGoogleFormConfigured()) {
    return [];
  }

  try {
    const response = await fetch(buildLeaderboardUrl(limit), {
      method: 'GET',
      mode: 'cors',
      redirect: 'follow',
    });

    const text = await response.text();
    let parsed: GoogleLeaderboardResponse | null = null;
    try {
      parsed = JSON.parse(text) as GoogleLeaderboardResponse;
    } catch {
      console.warn('[Leaderboard] 無法解析 GAS 回應', text.slice(0, 200));
      return [];
    }

    if (!response.ok || parsed?.ok === false) {
      console.warn('[Leaderboard] 讀取失敗', {
        status: response.status,
        error: parsed?.error,
      });
      return [];
    }

    if (!Array.isArray(parsed?.entries)) {
      console.warn(
        '[Leaderboard] GAS 回應缺少 entries，請確認已部署含 getLeaderboard 的腳本並建立新版本',
        parsed,
      );
      return [];
    }

    if (parsed.entries.length === 0 && import.meta.env.DEV) {
      console.info(
        '[Leaderboard] 試算表有資料但 entries 為空時，多半是 Time 欄格式問題；請更新 GAS 使用 getDisplayValues（見 docs/gas-score-submit.example.js）',
      );
    }

    return parsed.entries
      .filter(
        (row): row is GoogleLeaderboardRow & { name: string; elapsedTime: string } =>
          typeof row.name === 'string' &&
          row.name.trim().length > 0 &&
          typeof row.elapsedTime === 'string' &&
          row.elapsedTime.trim().length > 0,
      )
      .slice(0, limit)
      .map((row, index) => ({
        rank: index + 1,
        classId: String(row.classId ?? '').trim(),
        seatNumber: String(row.seatNumber ?? '').trim(),
        name: row.name.trim(),
        baseScore: Number(row.baseScore) || 0,
        leaderboardScore: Number(row.leaderboardScore) || 0,
        elapsedTime: row.elapsedTime.trim(),
        elapsedSeconds: row.elapsedSeconds,
        savedAt: row.savedAt,
      }));
  } catch (error) {
    console.warn('[Leaderboard] 讀取失敗：', error);
    return [];
  }
}
