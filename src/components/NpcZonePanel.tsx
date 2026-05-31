import React from 'react';
import { CheckCircle2, MapPin } from 'lucide-react';
import {
  MAP_ZONES,
  NPCS,
  type TargetNPC,
} from '../constants/gameData';
import {
  getNpcPortraitPath,
  getNpcPortraitFallback,
} from '../constants/characterAssets';

interface NpcZonePanelProps {
  talkedToNPCs: ReadonlySet<TargetNPC>;
  seekingNpc: TargetNPC | null;
}

/** 三區 NPC 學習進度（僅顯示，需到地圖上靠近 NPC 按空白鍵對話） */
export default function NpcZonePanel({
  talkedToNPCs,
  seekingNpc,
}: NpcZonePanelProps) {
  return (
    <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full">
      {MAP_ZONES.map((zone) => {
        const npc = NPCS.find((n) => n.id === zone.npcId)!;
        const completed = talkedToNPCs.has(zone.npcId);
        const needsHelp = seekingNpc === zone.npcId;

        return (
          <div
            key={zone.id}
            title={
              completed
                ? `已完成與${npc.name}的學習`
                : `請前往地圖【${zone.label}區】，靠近 ${npc.name} 後按空白鍵對話`
            }
            className={`relative flex flex-col items-center gap-1 p-1.5 sm:p-2 rounded-lg border-2
              transition-all duration-300 select-none
              bg-gradient-to-b ${zone.bgClass} ${zone.borderClass}
              ${needsHelp ? 'ring-2 ring-rose-400 animate-pulse shadow-lg' : ''}
              ${completed ? 'opacity-90' : 'opacity-100'}`}
          >
            {completed && (
              <CheckCircle2
                size={14}
                className="absolute top-1 right-1 text-emerald-600 drop-shadow-sm"
                aria-label="已完成學習"
              />
            )}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-md overflow-hidden border border-white/60 bg-black/20 shadow-inner">
              <img
                src={getNpcPortraitPath(zone.npcId)}
                alt={npc.name}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getNpcPortraitFallback(zone.npcId);
                }}
              />
            </div>
            <span className="text-[8px] sm:text-[9px] font-black text-stone-800 leading-tight text-center">
              {zone.label}
            </span>
            <span className="text-[7px] sm:text-[8px] font-semibold text-stone-600/90 truncate max-w-full px-0.5">
              {npc.name}
            </span>
            {!completed && (
              <span className="flex items-center gap-0.5 text-[6px] sm:text-[7px] font-bold text-stone-500/90">
                <MapPin size={8} className="shrink-0" aria-hidden />
                地圖尋找
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
