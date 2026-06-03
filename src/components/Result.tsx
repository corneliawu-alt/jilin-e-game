import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { UserInfo } from '../App';
import { GameResultStats } from './Game';
import { submitGameScore, type GameScoreSubmitResult } from '../lib/submitGameScore';
import { RefreshCcw, Share2, CheckCircle, Loader2, Star, Award } from 'lucide-react';
import { PLAYER_ROLE } from '../constants/gameData';

interface ResultProps {
  userInfo: UserInfo;
  stats: GameResultStats;
  preventionScore?: number;
  onRestart: () => void;
}

const STAR_LABELS: Record<1 | 2 | 3, string> = {
  3: '特級榮譽稽查員',
  2: '優良防疫稽查員',
  1: '見習衛生稽查員',
};

export default function Result({
  userInfo,
  stats,
  preventionScore = 0,
  onRestart,
}: ResultProps) {
  const [isSaving, setIsSaving] = useState(true);
  const [saveResult, setSaveResult] = useState<GameScoreSubmitResult | null>(null);

  const minutes = Math.floor(stats.elapsedSeconds / 60);
  const seconds = stats.elapsedSeconds % 60;
  const accuracyPct = Math.round((stats.firstTryCorrect / stats.completedQuests) * 100) || 0;

  useEffect(() => {
    let cancelled = false;

    const saveScore = async () => {
      try {
        const result = await submitGameScore(userInfo, stats, preventionScore);
        if (!cancelled) setSaveResult(result);
      } catch (error) {
        console.error('Error saving record:', error);
        if (!cancelled) setSaveResult({ googleForm: false, leaderboardSaved: false });
      } finally {
        if (!cancelled) setIsSaving(false);
      }
    };

    saveScore();
    return () => {
      cancelled = true;
    };
  }, [userInfo, stats.score]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 bg-linear-to-b from-amber-50 to-white text-amber-900 overflow-y-auto">
      <div className="relative mb-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 10, stiffness: 100 }}
          className="w-36 h-36 bg-linear-to-br from-amber-300 to-orange-400 rounded-full flex items-center justify-center shadow-2xl relative z-10"
        >
          <Award size={64} className="text-white drop-shadow-lg" />
        </motion.div>
        <div className="absolute -top-2 -right-2 flex gap-0.5 z-20">
          {[1, 2, 3].map((n) => (
            <Star
              key={n}
              size={22}
              className={
                n <= stats.stars
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300 fill-gray-200'
              }
            />
          ))}
        </div>
      </div>

      <div className="text-center space-y-1 mb-6">
        <h2 className="text-2xl font-extrabold tracking-tight">料理鼠亡 · 防衛成功！</h2>
        <p className="text-amber-700 text-sm font-medium">
          {userInfo.classId} 班 {userInfo.seatNumber} 號 {userInfo.name}
        </p>
        <p className="text-lg font-black text-orange-600 mt-2">{STAR_LABELS[stats.stars]}</p>
        <p className="text-xs text-amber-500">{PLAYER_ROLE} 榮譽獎狀</p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-2xl border-2 border-amber-200 p-4 mb-6 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-amber-600">總得分</span>
          <span className="font-black text-orange-600 text-lg">{stats.score} / 100</span>
        </div>
        <div className="flex justify-between">
          <span className="text-amber-600">完成任務</span>
          <span className="font-bold">{stats.completedQuests} / 10</span>
        </div>
        <div className="flex justify-between">
          <span className="text-amber-600">首次答對率</span>
          <span className="font-bold">{accuracyPct}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-amber-600">完成時間</span>
          <span className="font-bold">
            {minutes} 分 {seconds} 秒
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-amber-600">總答題次數</span>
          <span className="font-bold">{stats.totalAttempts}</span>
        </div>
      </div>

      {isSaving ? (
        <div className="flex items-center gap-2 text-amber-500 mb-6 font-medium text-sm">
          <Loader2 className="animate-spin" size={18} />
          正在儲存成績...
        </div>
      ) : saveResult?.googleForm ? (
        <div className="flex items-center gap-2 text-emerald-600 mb-6 font-bold bg-emerald-50 px-3 py-2 rounded-full border border-emerald-100 text-sm">
          <CheckCircle size={18} />
          成績已上傳至 Google 試算表
        </div>
      ) : saveResult?.leaderboardSaved ? (
        <div className="flex items-center gap-2 text-amber-600 mb-6 font-bold bg-amber-50 px-3 py-2 rounded-full border border-amber-100 text-sm">
          <CheckCircle size={18} />
          成績已登錄本機排行榜
        </div>
      ) : (
        <div className="text-rose-500 mb-6 font-bold text-sm">儲存失敗，請通知老師</div>
      )}

      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center justify-center gap-2 bg-white border-2 border-amber-200 text-amber-700 py-3 px-4 rounded-2xl font-bold hover:bg-amber-50 transition-all cursor-pointer text-sm"
        >
          <Share2 size={18} /> 列印獎狀
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="flex items-center justify-center gap-2 bg-amber-600 text-white py-3 px-4 rounded-2xl font-bold shadow-lg hover:bg-amber-700 transition-all cursor-pointer text-sm"
        >
          <RefreshCcw size={18} /> 再次挑戰
        </button>
      </div>
    </div>
  );
}
