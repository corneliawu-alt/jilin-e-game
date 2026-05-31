import React from 'react';
import { Clock, MapPin } from 'lucide-react';
import { GAME_TITLE, type GamePhase } from '../constants/gameData';
import QuestProgressBar from './QuestProgressBar';
import NpcZonePanel from './NpcZonePanel';
import ItemBackpack from './ItemBackpack';
import TreasureRadarButton from './TreasureRadarButton';
import BgmToggleButton from './BgmToggleButton';
import { NPCS, type TargetNPC } from '../constants/gameData';
import type { PlayerInventory } from '../constants/items';

interface GameHeaderProps {
  dollName: string;
  playerPos: { x: number; y: number };
  elapsedSeconds: number;
  completedQuests: number;
  completedQuestIds: ReadonlySet<number>;
  lastCapturedQuestId: number | null;
  preventionScore: number;
  showBadgeBurst: boolean;
  formatTime: (sec: number) => string;
  gamePhase: GamePhase;
  npcProgress: number;
  inventory: PlayerInventory;
  talkedToNPCs: ReadonlySet<TargetNPC>;
  seekingNpc: TargetNPC | null;
  uncollectedTreasureCount: number;
  lastRadarUsedAt: number | null;
  onActivateRadar: () => void;
  radarUiDisabled?: boolean;
}

function StatChip({
  icon,
  value,
  title,
}: {
  icon: React.ReactNode;
  value: string;
  title: string;
}) {
  return (
    <div
      className="flex items-center gap-0.5 rounded px-1.5 py-0.5
        bg-orange-50/90 text-orange-900 border border-orange-200/80 shrink-0"
      title={title}
    >
      <span className="text-orange-600 shrink-0">{icon}</span>
      <span className="text-[10px] font-black tabular-nums leading-none">{value}</span>
    </div>
  );
}

export default function GameHeader({
  dollName,
  playerPos,
  elapsedSeconds,
  completedQuests,
  completedQuestIds,
  lastCapturedQuestId,
  preventionScore,
  showBadgeBurst,
  formatTime,
  gamePhase,
  npcProgress,
  inventory,
  talkedToNPCs,
  seekingNpc,
  uncollectedTreasureCount,
  lastRadarUsedAt,
  onActivateRadar,
  radarUiDisabled = false,
}: GameHeaderProps) {
  return (
    <header className="shrink-0 z-10 px-2 pt-1.5 pb-1.5">
      <div
        className="max-w-4xl mx-auto w-full
          bg-white/90 backdrop-blur-sm shadow-md rounded-lg
          border border-white/60 ring-1 ring-amber-900/10 p-2 space-y-1.5"
      >
        {gamePhase === 'learning' ? (
          <div
            className="text-center text-[10px] sm:text-[11px] font-black text-sky-900
              bg-gradient-to-r from-sky-100 via-sky-50 to-sky-100
              border border-sky-300/80 rounded-md px-2 py-1 shadow-sm"
          >
            請前往地圖尋找 3 位防疫專家，靠近後按空白鍵對話！（{npcProgress}/3）
          </div>
        ) : (
          <div
            className="text-center text-[10px] sm:text-[11px] font-black text-rose-900
              bg-gradient-to-r from-rose-100 via-orange-50 to-rose-100
              border border-rose-300/80 rounded-md px-2 py-1 shadow-sm animate-pulse"
          >
            實戰期：變異老鼠已出沒，快去各角落消滅牠們！
          </div>
        )}

        <div className="flex flex-row items-center gap-2">
          <div className="shrink-0 min-w-0 w-[28%] max-w-[110px] sm:max-w-[140px]">
            <h2 className="text-[10px] sm:text-[11px] font-black text-amber-950 leading-tight truncate">
              {GAME_TITLE}
            </h2>
            <p className="text-[8px] text-amber-800/90 font-semibold truncate leading-tight">
              {dollName}
            </p>
          </div>

          {gamePhase === 'combat' ? (
            <QuestProgressBar
              completedQuests={completedQuests}
              completedQuestIds={completedQuestIds}
              lastCapturedQuestId={lastCapturedQuestId}
              showBadgeBurst={showBadgeBurst}
              currentScore={preventionScore}
            />
          ) : (
            <div className="flex-1 min-w-[88px]">
              <NpcZonePanel
                talkedToNPCs={talkedToNPCs}
                seekingNpc={seekingNpc}
              />
            </div>
          )}

          <div className="flex flex-col items-end gap-1 shrink-0">
            <div className="flex items-center gap-1">
              <BgmToggleButton />
              <StatChip
                icon={<MapPin size={11} />}
                title="座標"
                value={`${playerPos.x},${playerPos.y}`}
              />
              <StatChip
                icon={<Clock size={11} />}
                title="耗時"
                value={formatTime(elapsedSeconds)}
              />
              <div
                className="flex items-center gap-0.5 rounded-full px-1.5 py-0.5
                  bg-yellow-400 border border-yellow-600 shadow-sm"
                title="防疫積分"
              >
                <span className="text-[8px] font-black text-amber-900/75">積分</span>
                <span className="text-sm font-black text-amber-900 tabular-nums leading-none">
                  {preventionScore}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-wrap justify-end">
              <TreasureRadarButton
                preventionScore={preventionScore}
                lastRadarUsedAt={lastRadarUsedAt}
                uncollectedCount={uncollectedTreasureCount}
                disabled={radarUiDisabled}
                onActivate={onActivateRadar}
              />
              <ItemBackpack inventory={inventory} compact />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
