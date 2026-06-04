/** 登入頁排行榜項目（資料來源：Google 試算表） */
export type LeaderboardEntry = {
  rank: number;
  classId: string;
  seatNumber: string;
  name: string;
  /** 總積分（100 分制，試算表 Score 欄） */
  baseScore: number;
  /** 防疫積分（排行榜排序用） */
  leaderboardScore: number;
  elapsedTime: string;
  elapsedSeconds?: number;
  savedAt?: string;
};
