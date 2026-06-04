import React, { useEffect, useState } from 'react';
import {
  RADAR_SCORE_COST,
  canUseRadarFree,
  canUseRadarWithScore,
  radarCooldownRemainingMs,
} from '../constants/treasureRadar';

interface TreasureRadarButtonProps {
  leaderboardScore: number;
  lastRadarUsedAt: number | null;
  uncollectedCount: number;
  disabled?: boolean;
  onActivate: () => void;
}

export default function TreasureRadarButton({
  leaderboardScore,
  lastRadarUsedAt,
  uncollectedCount,
  disabled = false,
  onActivate,
}: TreasureRadarButtonProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(timer);
  }, []);

  const cooldownMs = radarCooldownRemainingMs(lastRadarUsedAt, now);
  const freeReady = canUseRadarFree(lastRadarUsedAt, now);
  const canUse = canUseRadarWithScore(leaderboardScore, lastRadarUsedAt, now);
  const payMode = !freeReady && leaderboardScore >= RADAR_SCORE_COST;
  const noTreasures = uncollectedCount === 0;

  const cooldownSec = Math.ceil(cooldownMs / 1000);

  let title = '尋找距離最近的未收集寶物';
  if (noTreasures) title = '地圖上已無剩餘寶物';
  else if (freeReady) title = '免費使用尋寶雷達';
  else if (payMode) title = `消耗 ${RADAR_SCORE_COST} 積分立即使用（冷卻中 ${cooldownSec}s）`;
  else title = `冷卻中 ${cooldownSec}s，需 ${RADAR_SCORE_COST} 積分才能使用`;

  return (
    <button
      type="button"
      disabled={disabled || !canUse || noTreasures}
      onClick={onActivate}
      title={title}
      className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-black
        border shadow-sm transition-all shrink-0
        ${
          !disabled && canUse && !noTreasures
            ? 'bg-sky-100 border-sky-400 text-sky-900 hover:bg-sky-200 hover:scale-[1.02] cursor-pointer'
            : 'bg-stone-100 border-stone-300 text-stone-400 cursor-not-allowed opacity-70'
        }`}
    >
      <span aria-hidden>🔍</span>
      <span className="whitespace-nowrap">尋寶雷達</span>
      {!noTreasures && !freeReady && (
        <span className="text-[8px] tabular-nums opacity-80">
          {payMode ? `-${RADAR_SCORE_COST}` : `${cooldownSec}s`}
        </span>
      )}
      {!noTreasures && freeReady && (
        <span className="text-[8px] text-emerald-700 font-bold">就緒</span>
      )}
    </button>
  );
}
