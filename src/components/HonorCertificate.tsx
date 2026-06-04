import React, { useCallback, useState } from 'react';
import { motion } from 'motion/react';
import type { UserInfo } from '../App';
import type { GameResultStats } from './Game';
import {
  formatElapsedTime,
  formatElapsedTimeMMSS,
  getHonorTitle,
} from '../constants/gameData';
import { downloadCertificateAsJpg } from '../lib/downloadCertificate';
import ConfettiOverlay from './ConfettiOverlay';
import { Award, Home, RefreshCcw, Download, Loader2 } from 'lucide-react';

interface HonorCertificateProps {
  userInfo: UserInfo;
  stats: GameResultStats;
  preventionScore: number;
  onPlayAgain: () => void;
  onExitHome: () => void;
}

type StatItem = { label: string; value: string; accent?: boolean };

export default function HonorCertificate({
  userInfo,
  stats,
  preventionScore,
  onPlayAgain,
  onExitHome,
}: HonorCertificateProps) {
  const honorTitle = getHonorTitle(preventionScore, stats.score);
  const timeLabel = formatElapsedTime(stats.elapsedSeconds);
  const timeMmSs = formatElapsedTimeMMSS(stats.elapsedSeconds);
  const [downloading, setDownloading] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState(null as string | null);

  const statItems: StatItem[] = [
    { label: '總積分', value: `${stats.score} / 100`, accent: true },
    { label: '完成時間', value: timeMmSs },
    { label: '遊戲耗時', value: timeLabel },
    { label: '防疫積分', value: String(preventionScore), accent: true },
    { label: '通關星級', value: '★'.repeat(stats.stars) + '☆'.repeat(3 - stats.stars) },
    { label: '任務完成', value: `${stats.completedQuests} / 10` },
  ];

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

      <div className="relative z-10 w-full max-w-lg my-auto flex flex-col items-stretch gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div id="certificate-node" className="cert-root">
            <div className="cert-medal" aria-hidden>
              <Award size={32} />
            </div>

            <p className="cert-org">吉林小鎮防疫總部</p>

            <p className="cert-congrats">
              恭喜{' '}
              <span className="cert-name-dark">{userInfo.classId} 班</span>{' '}
              <span className="cert-name-dark">{userInfo.seatNumber} 號</span>{' '}
              <span className="cert-name-green">{userInfo.name}</span>{' '}
              榮獲
            </p>

            <h2 className="cert-title">特級衛生稽查員</h2>
            <p className="cert-subtitle">榮 譽 獎 狀</p>

            <p className="cert-body">
              茲證明上述稽查員已成功消滅鎮上全部變異老鼠，完成漢他病毒防疫任務，表現卓越，特頒此狀。
            </p>

            <div className="cert-stats">
              {statItems.map((item) => (
                <div key={item.label} className="cert-stat">
                  <span className="cert-stat-label">{item.label}</span>
                  <span
                    className={
                      item.accent ? 'cert-stat-value cert-stat-value--accent' : 'cert-stat-value'
                    }
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            <p data-cert-honor-title className="cert-honor">
              {honorTitle}
            </p>
            <p className="cert-honor-caption">— 最終稱號 —</p>
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
            💾 下載獎狀 (JPG)
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
