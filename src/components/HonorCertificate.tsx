import React from 'react';
import { motion } from 'motion/react';
import type { UserInfo } from '../App';
import type { GameResultStats } from './Game';
import {
  formatElapsedTime,
  formatElapsedTimeMMSS,
  getHonorTitle,
  PLAYER_ROLE,
} from '../constants/gameData';
import type { GameScoreSubmitResult } from '../lib/submitGameScore';
import { isGoogleFormConfigured } from '../lib/submitGoogleForm';
import ConfettiOverlay from './ConfettiOverlay';
import { Award, Home, RefreshCcw, Loader2, CheckCircle, CloudUpload, HardDrive } from 'lucide-react';

interface HonorCertificateProps {
  userInfo: UserInfo;
  stats: GameResultStats;
  preventionScore: number;
  scoreSubmitLoading: boolean;
  scoreSubmitResult: GameScoreSubmitResult | null;
  onPlayAgain: () => void;
  onExitHome: () => void;
}

export default function HonorCertificate({
  userInfo,
  stats,
  preventionScore,
  scoreSubmitLoading,
  scoreSubmitResult,
  onPlayAgain,
  onExitHome,
}: HonorCertificateProps) {
  const honorTitle = getHonorTitle(preventionScore, stats.score);
  const timeLabel = formatElapsedTime(stats.elapsedSeconds);
  const timeMmSs = formatElapsedTimeMMSS(stats.elapsedSeconds);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[290] flex items-center justify-center p-3 sm:p-6 overflow-y-auto
        bg-linear-to-br from-amber-100 via-yellow-50 to-orange-100"
      role="dialog"
      aria-modal="true"
      aria-label="榮譽獎狀結算"
    >
      <ConfettiOverlay />

      <motion.div
        initial={{ scale: 0.88, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="relative z-10 w-full max-w-md my-auto"
      >
        <div
          className="relative rounded-2xl border-4 border-double border-amber-600/90
            bg-linear-to-b from-amber-50 via-white to-amber-50
            shadow-[0_0_48px_rgba(217,119,6,0.35),inset_0_0_40px_rgba(251,191,36,0.12)]
            px-6 py-8 sm:px-8 sm:py-10 text-center"
        >
          <div
            className="absolute -top-5 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full
              bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center
              shadow-lg border-2 border-amber-200"
          >
            <Award size={32} className="text-white drop-shadow" />
          </div>

          <p className="text-[10px] font-black tracking-[0.35em] text-amber-700/80 uppercase mt-4 mb-1">
            吉林小鎮防疫總部
          </p>
          <h2 className="text-xl sm:text-2xl font-black text-amber-950 leading-tight mb-1">
            特級衛生稽查員
          </h2>
          <p className="text-sm font-bold text-amber-700 mb-5">榮 譽 獎 狀</p>

          <div className="space-y-2 text-sm text-amber-950/90 mb-4 border-y border-amber-200/80 py-4">
            <p>
              <span className="text-amber-600 font-semibold">班級</span>{' '}
              <span className="font-black">{userInfo.classId} 班</span>
            </p>
            <p>
              <span className="text-amber-600 font-semibold">座號</span>{' '}
              <span className="font-black">{userInfo.seatNumber} 號</span>
            </p>
            <p>
              <span className="text-amber-600 font-semibold">姓名</span>{' '}
              <span className="font-black text-lg">{userInfo.name}</span>
            </p>
          </div>

          <p className="text-xs text-amber-800/85 leading-relaxed mb-4 px-1">
            茲證明上述 {PLAYER_ROLE} 已成功消滅鎮上全部變異老鼠，
            完成漢他病毒防疫任務，表現卓越，特頒此狀。
          </p>

          <div className="grid grid-cols-1 gap-2 text-left text-sm bg-amber-50/80 rounded-xl border border-amber-200/70 p-3 mb-4">
            <div className="flex justify-between gap-2">
              <span className="text-amber-700 font-semibold">總積分</span>
              <span className="font-black text-amber-950 text-lg tabular-nums">
                {stats.score} / 100
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-amber-700 font-semibold">完成時間</span>
              <span className="font-black text-amber-950 tabular-nums">{timeMmSs}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-amber-700 font-semibold">遊戲耗時</span>
              <span className="font-black text-amber-950">{timeLabel}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-amber-700 font-semibold">防疫積分</span>
              <span className="font-black text-orange-600">{preventionScore}</span>
            </div>
          </div>

          <p className="text-base sm:text-lg font-black text-transparent bg-clip-text
            bg-linear-to-r from-amber-600 via-orange-500 to-amber-600 mb-2">
            {honorTitle}
          </p>
          <p className="text-[10px] text-amber-600/90 font-bold mb-4">— 評語與稱號 —</p>

          {scoreSubmitLoading ? (
            <div className="flex items-center justify-center gap-2 text-amber-600 text-xs font-medium mb-4">
              <Loader2 className="animate-spin" size={16} />
              正在上傳成績至 Google 表單…
            </div>
          ) : (
            <div className="space-y-1 mb-4 text-xs font-bold">
              {scoreSubmitResult?.googleForm && (
                <div className="flex items-center justify-center gap-1.5 text-emerald-700">
                  <CloudUpload size={14} />
                  成績已上傳至 Google 試算表
                </div>
              )}
              {!scoreSubmitResult?.googleForm && isGoogleFormConfigured() && (
                <p className="text-rose-600 text-center">
                  試算表上傳可能失敗，請通知老師確認 GAS 設定
                </p>
              )}
              {!isGoogleFormConfigured() && (
                <p className="text-amber-700 text-center">
                  尚未設定試算表網址，成績僅供畫面顯示
                </p>
              )}
              {scoreSubmitResult?.leaderboardSaved && (
                <div className="flex items-center justify-center gap-1.5 text-amber-700">
                  <HardDrive size={14} />
                  成績已登錄本機排行榜
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onPlayAgain}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-amber-500
                bg-white text-amber-800 font-black text-xs sm:text-sm hover:bg-amber-50 transition-colors shadow-sm"
            >
              <RefreshCcw size={16} />
              再玩一次
            </button>
            <button
              type="button"
              onClick={onExitHome}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-amber-600
                text-white font-black text-xs sm:text-sm hover:bg-amber-500 transition-colors shadow-md"
            >
              <Home size={16} />
              返回首頁
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
