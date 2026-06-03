import type { UserInfo } from '../App';
import type { GameResultStats } from '../components/Game';
import { formatElapsedTimeMMSS, TOTAL_QUESTS } from '../constants/gameData';

export const LEADERBOARD_STORAGE_KEY = 'jilin-e-game-records';

export type LeaderboardRecord = {
  classId: string;
  seatNumber: string;
  name: string;
  totalScore: number;
  preventionScore: number;
  elapsedTime: string;
  elapsedSeconds: number;
  completedQuests: number;
  stars: number;
  firstTryCorrect: number;
  savedAt: string;
};

export type LeaderboardEntry = LeaderboardRecord & {
  rank: number;
};

function parseElapsedSeconds(record: LeaderboardRecord): number {
  if (Number.isFinite(record.elapsedSeconds) && record.elapsedSeconds >= 0) {
    return record.elapsedSeconds;
  }
  const m = record.elapsedTime?.match(/^(\d+):(\d{2})$/);
  if (m) return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
  return Number.POSITIVE_INFINITY;
}

export function loadLeaderboardRecords(): LeaderboardRecord[] {
  try {
    const raw = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (r): r is LeaderboardRecord =>
        r !== null &&
        typeof r === 'object' &&
        typeof (r as LeaderboardRecord).name === 'string' &&
        typeof (r as LeaderboardRecord).elapsedTime === 'string',
    );
  } catch {
    return [];
  }
}

/** 完成全部任務後寫入排行榜（破關獎狀時呼叫） */
export function saveLeaderboardRecord(
  userInfo: UserInfo,
  stats: GameResultStats,
  preventionScore: number,
): void {
  if (stats.completedQuests < TOTAL_QUESTS) return;

  const record: LeaderboardRecord = {
    ...userInfo,
    totalScore: stats.score,
    preventionScore,
    elapsedTime: formatElapsedTimeMMSS(stats.elapsedSeconds),
    elapsedSeconds: stats.elapsedSeconds,
    completedQuests: stats.completedQuests,
    stars: stats.stars,
    firstTryCorrect: stats.firstTryCorrect,
    savedAt: new Date().toISOString(),
  };

  const existing = loadLeaderboardRecords();
  existing.push(record);
  localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(existing));
}

/** 最速通關前 N 名（僅統計完成全部 10 項任務） */
export function getTopSpeedrunEntries(limit = 6): LeaderboardEntry[] {
  const cleared = loadLeaderboardRecords().filter(
    (r) => r.completedQuests >= TOTAL_QUESTS,
  );

  const sorted = [...cleared].sort((a, b) => {
    const diff = parseElapsedSeconds(a) - parseElapsedSeconds(b);
    if (diff !== 0) return diff;
    return new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime();
  });

  return sorted.slice(0, limit).map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}
