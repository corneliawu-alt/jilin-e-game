/** 登入頁最速通關排行榜項目（資料來源：Google 試算表） */
export type LeaderboardEntry = {
  rank: number;
  classId: string;
  seatNumber: string;
  name: string;
  elapsedTime: string;
  elapsedSeconds?: number;
  savedAt?: string;
};
