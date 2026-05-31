import React from 'react';
import {
  GRID_HEIGHT,
  TILE_SIZE,
  MAP_ZONE_BOUNDS,
  NPCS,
  type TargetNPC,
} from '../../constants/gameData';

interface MapZoneOverlayProps {
  highlightNpc?: TargetNPC | null;
}

/** 地圖三區視覺：餐廳、診所、倉庫 */
export default function MapZoneOverlay({ highlightNpc }: MapZoneOverlayProps) {
  const mapH = GRID_HEIGHT * TILE_SIZE;

  return (
    <div className="absolute inset-0 pointer-events-none z-[2]" aria-hidden>
      {MAP_ZONE_BOUNDS.map((zone) => {
        const width = (zone.xEnd - zone.xStart + 1) * TILE_SIZE;
        const left = zone.xStart * TILE_SIZE;
        const npc = NPCS.find((n) => n.zone === zone.id);
        const isHighlighted = highlightNpc && npc?.id === highlightNpc;

        return (
          <div
            key={zone.id}
            className="absolute top-0 transition-all duration-500"
            style={{
              left,
              width,
              height: mapH,
              backgroundColor: zone.tint,
              boxShadow: isHighlighted
                ? `inset 0 0 0 3px ${zone.border}, inset 0 0 24px ${zone.border}`
                : `inset 0 0 0 2px ${zone.border}`,
            }}
          >
            <div
              className={`absolute top-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md
                text-[9px] sm:text-[10px] font-black tracking-wide shadow-sm
                bg-white/75 backdrop-blur-sm border ${zone.textClass}`}
              style={{ borderColor: zone.border }}
            >
              {zone.label}
              {npc && (
                <span className="ml-1 opacity-80 font-semibold">· {npc.emoji}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
