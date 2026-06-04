import React, { useCallback, useState } from 'react';
import { motion } from 'motion/react';
import type { UserInfo } from '../App';
import type { GameResultStats } from './Game';
import { formatElapsedTimeMMSS, getHonorTitle } from '../constants/gameData';
import { downloadCertificateAsJpg } from '../lib/downloadCertificate';
import ConfettiOverlay from './ConfettiOverlay';
import { Award, Home, RefreshCcw, Download, Loader2 } from 'lucide-react';

interface HonorCertificateProps {
  userInfo: UserInfo;
  stats: GameResultStats;
  onPlayAgain: () => void;
  onExitHome: () => void;
}

export default function HonorCertificate({
  userInfo,
  stats,
  onPlayAgain,
  onExitHome,
}: HonorCertificateProps) {
  const honorTitle = getHonorTitle(stats.score);
  const timeMmSs = formatElapsedTimeMMSS(stats.elapsedSeconds);
  const starsFilled = '★'.repeat(stats.stars);
  const starsEmpty = '☆'.repeat(3 - stats.stars);
  const [downloading, setDownloading] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState(null as string | null);

  const handleDownload = useCallback(async () => {
    if (downloading) return;
    setDownloading(true);
    setDownloadMessage(null);
    try {
      const result = await downloadCertificateAsJpg(
        userInfo.classId,
        userInfo.seatNumber,
      );
      if (!result.ok) {
        setDownloadMessage(result.error);
        return;
      }
      if (result.method === 'preview') {
        setDownloadMessage(
          '瀏覽器已開啟獎狀圖片，請在圖片上按右鍵選擇「另存圖片」。',
        );
        return;
      }
      if (result.method === 'save-picker') {
        setDownloadMessage('獎狀已儲存至您選擇的位置！');
        return;
      }
      setDownloadMessage('獎狀已開始下載，請查看瀏覽器下載列。');
    } finally {
      setDownloading(false);
    }
  }, [downloading, userInfo.classId, userInfo.seatNumber]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[290] flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      style={{
        background: 'linear-gradient(135deg, rgba(254, 243, 199, 0.9), #f5efe6, rgba(255, 237, 213, 0.9))',
      }}
      role="dialog"
      aria-modal="true"
      aria-label="榮譽獎狀結算"
    >
      <ConfettiOverlay />

      <div className="relative z-10 w-full max-w-md my-auto flex flex-col items-stretch gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div id="certificate-node" className="cert-root">
            <div className="cert-inner-frame" aria-hidden />

            <div className="cert-medal" aria-hidden>
              <Award size={28} strokeWidth={2.5} />
            </div>

            <p className="cert-org">吉林小鎮防疫總部</p>

            <div className="cert-recipient">
              <p className="cert-recipient-label">特此表彰</p>
              <p className="cert-recipient-name">{userInfo.name}</p>
              <p className="cert-recipient-meta">
                {userInfo.classId} 班 · {userInfo.seatNumber} 號
              </p>
            </div>

            <div className="cert-divider" aria-hidden />

            <h2 className="cert-main-title">榮 譽 獎 狀</h2>

            <p className="cert-body">
              成功消滅鎮上全部變異老鼠，完成漢他病毒防疫任務，表現卓越，特頒此狀以資鼓勵。
            </p>

            <div className="cert-score-hero">
              <span className="cert-score-hero-label">總積分</span>
              <p className="cert-score-hero-value">
                {stats.score}
                <span className="cert-score-hero-max">/100</span>
              </p>
            </div>

            <p className="cert-stars" aria-label={`通關 ${stats.stars} 星`}>
              <span className="cert-stars-filled">{starsFilled}</span>
              <span className="cert-stars-empty">{starsEmpty}</span>
            </p>

            <div className="cert-metrics">
              <div className="cert-metric cert-metric--highlight">
                <span className="cert-metric-label">防疫積分</span>
                <span className="cert-metric-value">{stats.leaderboardScore}</span>
              </div>
              <div className="cert-metric">
                <span className="cert-metric-label">通關時間</span>
                <span className="cert-metric-value">{timeMmSs}</span>
              </div>
              <div className="cert-metric">
                <span className="cert-metric-label">任務完成</span>
                <span className="cert-metric-value">
                  {stats.completedQuests}/10
                </span>
              </div>
            </div>

            <p className="cert-time-bonus">時間獎勵 +{stats.timeBonus}</p>

            <div className="cert-honor-panel">
              <p className="cert-honor-caption">最終稱號</p>
              <p data-cert-honor-title className="cert-honor">
                {honorTitle}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col gap-2.5 px-1 sm:px-2">
          <button
            type="button"
            onClick={() => void handleDownload()}
            disabled={downloading}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-black text-sm sm:text-base
              disabled:opacity-60 disabled:cursor-wait transition-opacity duration-200"
            style={{
              color: '#fffbeb',
              border: '2px solid rgba(245, 158, 11, 0.6)',
              background: 'linear-gradient(90deg, #1e293b, #334155, #78350f)',
              boxShadow: '0 4px 20px rgba(30, 41, 59, 0.35)',
            }}
          >
            {downloading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Download size={18} />
            )}
            下載獎狀 (JPG)
          </button>

          {downloadMessage && (
            <p
              className="text-center text-xs font-bold px-2"
              style={{
                color:
                  downloadMessage.includes('取消') ||
                  downloadMessage.includes('找不到') ||
                  downloadMessage.includes('無法') ||
                  downloadMessage.includes('空白') ||
                  downloadMessage.includes('錯誤') ||
                  downloadMessage.includes('不完整')
                    ? '#be123c'
                    : '#065f46',
              }}
              role="status"
            >
              {downloadMessage}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onPlayAgain}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-black text-xs sm:text-sm
                transition-opacity hover:opacity-90"
              style={{
                border: '2px solid #f59e0b',
                backgroundColor: '#fdfbf7',
                color: '#78350f',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              }}
            >
              <RefreshCcw size={16} />
              再玩一次
            </button>
            <button
              type="button"
              onClick={onExitHome}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-white font-black text-xs sm:text-sm
                transition-opacity hover:opacity-90"
              style={{
                background: 'linear-gradient(90deg, #d97706, #ea580c)',
                boxShadow: '0 4px 6px rgba(0,0,0,0.12)',
              }}
            >
              <Home size={16} />
              返回首頁
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
