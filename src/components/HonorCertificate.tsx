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
  const [downloadMessage, setDownloadMessage] = useState<string | null>(null);

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
      const result = await downloadCertificateAsJpg();
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
  }, [downloading]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[290] flex items-center justify-center p-3 sm:p-6 overflow-y-auto
        bg-linear-to-br from-amber-100/90 via-[#f5efe6] to-orange-100/90"
      role="dialog"
      aria-modal="true"
      aria-label="榮譽獎狀結算"
    >
      <ConfettiOverlay />

      <div className="relative z-10 w-full max-w-lg my-auto flex flex-col items-stretch gap-4">
        <motion.div
          id="certificate-node"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45 }}
          className="relative rounded-2xl border-8 border-double border-amber-500
            bg-[#fdfbf7]
            shadow-[0_12px_40px_rgba(180,120,40,0.22),inset_0_0_60px_rgba(251,191,36,0.08)]
            px-5 py-8 sm:px-8 sm:py-10 text-center"
        >
          <div
            className="absolute -top-5 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full
              bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center
              shadow-lg border-2 border-amber-300"
          >
            <Award size={32} className="text-white drop-shadow" />
          </div>

          <p className="text-[10px] font-black tracking-[0.35em] text-amber-800/70 uppercase mt-4 mb-3">
            吉林小鎮防疫總部
          </p>

          <p
            className="text-sm sm:text-base font-bold leading-relaxed mb-3
              text-[#2d4a3e] drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]"
          >
            恭喜{' '}
            <span className="font-black text-[#3d2b1f]">{userInfo.classId} 班</span>{' '}
            <span className="font-black text-[#3d2b1f]">{userInfo.seatNumber} 號</span>{' '}
            <span className="font-black text-[#1a3d32]">{userInfo.name}</span>{' '}
            榮獲
          </p>

          <h2 className="text-xl sm:text-2xl font-black text-[#3d2b1f] leading-tight mb-0.5">
            特級衛生稽查員
          </h2>
          <p className="text-sm sm:text-base font-black text-amber-800 tracking-[0.2em] mb-5">
            榮 譽 獎 狀
          </p>

          <p className="text-xs sm:text-sm text-[#4a3728]/90 leading-relaxed mb-5 px-2 sm:px-4 text-center">
            茲證明上述稽查員已成功消滅鎮上全部變異老鼠，完成漢他病毒防疫任務，表現卓越，特頒此狀。
          </p>

          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-5">
            {statItems.map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center justify-center gap-0.5 rounded-xl
                  bg-white/60 shadow-[0_2px_8px_rgba(120,80,20,0.12)] border border-amber-200/50
                  px-2 py-2.5 sm:py-3 min-h-[4.25rem]"
              >
                <span className="text-[10px] sm:text-xs font-bold text-amber-800/80">
                  {item.label}
                </span>
                <span
                  className={`font-black tabular-nums text-center leading-tight
                    ${item.accent ? 'text-lg sm:text-xl text-amber-950' : 'text-sm sm:text-base text-[#3d2b1f]'}`}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          <p
            data-cert-honor-title
            className="text-xl sm:text-2xl md:text-3xl font-black leading-tight
              text-transparent bg-clip-text
              bg-linear-to-r from-amber-600 via-orange-500 to-amber-700
              drop-shadow-[0_2px_4px_rgba(180,83,9,0.25)]"
          >
            {honorTitle}
          </p>
          <p className="text-[10px] text-amber-700/80 font-bold mt-2 tracking-widest">
            — 最終稱號 —
          </p>
        </motion.div>

        <div className="flex flex-col gap-2.5 px-1 sm:px-2">
          <button
            type="button"
            onClick={() => void handleDownload()}
            disabled={downloading}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl
              bg-linear-to-r from-slate-800 via-slate-700 to-amber-900
              text-amber-50 font-black text-sm sm:text-base
              border-2 border-amber-500/60 shadow-[0_4px_20px_rgba(30,41,59,0.35)]
              hover:from-slate-700 hover:via-amber-800 hover:to-amber-800
              hover:shadow-[0_0_18px_rgba(245,158,11,0.4)]
              disabled:opacity-60 disabled:cursor-wait transition-all duration-200"
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
              className={`text-center text-xs font-bold px-2 ${
                downloadMessage.includes('取消') ||
                downloadMessage.includes('找不到') ||
                downloadMessage.includes('無法') ||
                downloadMessage.includes('空白') ||
                downloadMessage.includes('錯誤')
                  ? 'text-rose-700'
                  : 'text-emerald-800'
              }`}
              role="status"
            >
              {downloadMessage}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onPlayAgain}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-amber-500
                bg-[#fdfbf7] text-amber-900 font-black text-xs sm:text-sm
                hover:bg-amber-50 transition-colors shadow-sm"
            >
              <RefreshCcw size={16} />
              再玩一次
            </button>
            <button
              type="button"
              onClick={onExitHome}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl
                bg-linear-to-r from-amber-600 to-orange-600 text-white font-black text-xs sm:text-sm
                hover:from-amber-500 hover:to-orange-500 transition-colors shadow-md"
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
