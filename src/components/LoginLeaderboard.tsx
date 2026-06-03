import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Crown, Timer } from 'lucide-react';
import { getTopSpeedrunEntries } from '../lib/leaderboard';

const MEDALS = ['🥇', '🥈', '🥉'] as const;

const RANK_STYLES = [
  'from-amber-500/25 via-amber-400/15 to-transparent border-amber-500/50',
  'from-stone-400/20 via-stone-300/10 to-transparent border-stone-400/45',
  'from-orange-500/20 via-orange-400/10 to-transparent border-orange-500/45',
] as const;

export default function LoginLeaderboard() {
  const entries = useMemo(() => getTopSpeedrunEntries(6), []);

  return (
    <section className="flex flex-col min-h-0 flex-1" aria-label="最速通關排行榜">
      <header className="text-center shrink-0 pb-2">
        <h2 className="login-rpg-heading text-base sm:text-lg">最速通關排行榜</h2>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto login-rpg-scroll-inner pr-0.5">
        {entries.length === 0 ? (
          <div
            className="login-leaderboard-empty min-h-[100px] sm:min-h-[116px]
              flex flex-col items-center justify-center text-center
              rounded-lg border border-dashed border-amber-600/35
              bg-black/25 px-4 py-4"
          >
            <Crown size={26} className="text-amber-500/50 mb-2" aria-hidden />
            <p className="text-sm sm:text-[0.9375rem] font-semibold text-amber-100/85 leading-relaxed">
              尚未有稽查員完成挑戰...
              <br />
              歡迎挑戰！成為第一位通關的特級稽查員吧！
            </p>
          </div>
        ) : (
          <ul className="space-y-1.5">
            {entries.map((entry, index) => {
              const isPodium = entry.rank <= 3;
              const medal = MEDALS[entry.rank - 1];
              const podiumStyle = isPodium ? RANK_STYLES[entry.rank - 1] : '';

              return (
                <motion.li
                  key={`${entry.savedAt}-${entry.name}-${entry.rank}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 border
                    bg-linear-to-r backdrop-blur-sm
                    ${
                      isPodium
                        ? `${podiumStyle}`
                        : 'border-amber-800/30 bg-slate-950/40'
                    }`}
                >
                  <span
                    className={`shrink-0 w-8 text-center font-black tabular-nums
                      ${isPodium ? 'text-base' : 'text-sm text-amber-300/60'}`}
                  >
                    {isPodium ? medal : `${entry.rank}`}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-bold truncate text-sm
                        ${isPodium ? 'text-amber-50' : 'text-slate-200'}`}
                    >
                      {entry.name}
                    </p>
                    <p className="text-xs text-amber-200/45 font-medium">
                      {entry.classId} 班 · {entry.seatNumber} 號
                    </p>
                  </div>
                  <div
                    className="shrink-0 flex items-center gap-1 text-amber-300 font-bold
                      tabular-nums text-sm"
                  >
                    <Timer size={12} className="opacity-60" aria-hidden />
                    {entry.elapsedTime}
                  </div>
                </motion.li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
