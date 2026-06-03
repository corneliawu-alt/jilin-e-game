import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GRID_WIDTH,
  GRID_HEIGHT,
  TILE_SIZE,
  MAP_PIXEL_WIDTH,
  MAP_PIXEL_HEIGHT,
  NPCS,
  QUEST_POINTS,
  TREASURE_SPOTS,
  type QuestPoint,
  computeCameraOffset,
  MAP_DECORATIONS,
  type TargetNPC,
} from '../constants/gameData';
import { getRatDefaultFacing } from '../constants/ratAssets';
import { renderTile } from './map/renderTile';
import TreasureRadarPing from './map/TreasureRadarPing';
import MapDecorationLayer from './map/MapDecorationLayer';
import { EntityGroundShadow } from './map/mapDecorations';
import RatSprite from './RatSprite';
import NpcMapSprite from './NpcMapSprite';
import {
  isWithinRatInteractionRange,
  normalizeQuestPoint,
} from '../constants/gameData';
import {
  getRatDisplayFacing,
  isRatWanderFrozenForPlayer,
  type RatPositionsMap,
} from '../constants/ratWander';
import PlayerMapSprite from './PlayerMapSprite';
import RatCatchNetIndicator from './RatCatchNetIndicator';
import {
  formatPlayerNameTag,
  getPlayerCharacter,
  truncatePlayerName,
  type SpriteDirection,
  type PlayerCharacterId,
} from '../constants/characterAssets';
import type { NpcPositionsMap } from '../constants/npcWander';

interface GameMapProps {
  playerPos: { x: number; y: number };
  characterId: PlayerCharacterId | string;
  playerName: string;
  playerDirection: SpriteDirection;
  npcPositions: NpcPositionsMap;
  seekingNpc: TargetNPC | null;
  completedQuestIds: ReadonlySet<number>;
  ratPositions: RatPositionsMap;
  questRatsVisible: boolean;
  ratsBurst: boolean;
  collectedTreasureIds: ReadonlySet<string>;
  radarTarget: { x: number; y: number } | null;
  /** 互動範圍內高亮任務鼠並顯示 Enter/Z 抓鼠提示 */
  highlightQuestId: number | null;
  /** 對話／答題中鎖定面向與行走動畫 */
  freezeEntityFacing: boolean;
  /** 點擊地圖上的任務鼠 */
  onQuestRatClick?: (quest: QuestPoint) => void;
}

function TreasureMarker({ variant }: { variant: 'chest' | 'sparkle' }) {
  return (
    <motion.div
      className="relative flex flex-col items-center justify-end mb-1"
      animate={{ y: [0, -3, 0], scale: [1, 1.05, 1] }}
      transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
    >
      <EntityGroundShadow />
      {variant === 'chest' ? (
        <span className="text-xl leading-none drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]">🎁</span>
      ) : (
        <span className="text-lg leading-none drop-shadow-[0_0_10px_rgba(250,204,21,0.95)]">✨</span>
      )}
    </motion.div>
  );
}

export default function GameMap({
  playerPos,
  characterId,
  playerName,
  playerDirection,
  npcPositions,
  seekingNpc,
  completedQuestIds,
  ratPositions,
  questRatsVisible,
  ratsBurst,
  collectedTreasureIds,
  radarTarget,
  highlightQuestId,
  freezeEntityFacing,
  onQuestRatClick,
}: GameMapProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState({ width: 896, height: 600 });
  const [hoveredRatQuestId, setHoveredRatQuestId] = useState<number | null>(null);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const update = () => setViewportSize({ width: el.clientWidth, height: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const camera = useMemo(
    () => computeCameraOffset(playerPos, viewportSize.width, viewportSize.height),
    [playerPos, viewportSize.width, viewportSize.height],
  );

  const playerNameTag = useMemo(
    () => formatPlayerNameTag(playerName, characterId),
    [playerName, characterId],
  );

  const playerNameTagFull = useMemo(
    () => `${truncatePlayerName(playerName)}・${getPlayerCharacter(characterId).name}`,
    [playerName, characterId],
  );

  const visibleRange = useMemo(() => {
    const pad = 3;
    return {
      minX: Math.max(0, Math.floor(-camera.x / TILE_SIZE) - pad),
      maxX: Math.min(GRID_WIDTH - 1, Math.ceil((-camera.x + viewportSize.width) / TILE_SIZE) + pad),
      minY: Math.max(0, Math.floor(-camera.y / TILE_SIZE) - pad),
      maxY: Math.min(GRID_HEIGHT - 1, Math.ceil((-camera.y + viewportSize.height) / TILE_SIZE) + pad),
    };
  }, [camera.x, camera.y, viewportSize.width, viewportSize.height]);

  const tiles = useMemo(() => {
    const list: { x: number; y: number }[] = [];
    for (let y = visibleRange.minY; y <= visibleRange.maxY; y++) {
      for (let x = visibleRange.minX; x <= visibleRange.maxX; x++) {
        list.push({ x, y });
      }
    }
    return list;
  }, [visibleRange]);

  const visibleDecorations = useMemo(
    () =>
      MAP_DECORATIONS.filter(
        (d) =>
          d.x >= visibleRange.minX - 1 &&
          d.x <= visibleRange.maxX + 1 &&
          d.y >= visibleRange.minY - 1 &&
          d.y <= visibleRange.maxY + 1,
      ),
    [visibleRange],
  );

  const visibleTreasures = useMemo(
    () =>
      TREASURE_SPOTS.filter(
        (t) =>
          !collectedTreasureIds.has(t.id) &&
          t.x >= visibleRange.minX &&
          t.x <= visibleRange.maxX &&
          t.y >= visibleRange.minY &&
          t.y <= visibleRange.maxY,
      ),
    [visibleRange, collectedTreasureIds],
  );

  const visibleQuestRats = useMemo(() => {
    if (!questRatsVisible) return [];

    return QUEST_POINTS.filter((p) => !completedQuestIds.has(p.questionId))
      .map((p) => {
        const live = ratPositions[p.questionId];
        if (live) return live;
        return {
          questId: p.questionId,
          x: p.x,
          y: p.y,
          spawnX: p.x,
          spawnY: p.y,
          stance: getRatDefaultFacing(p.questionId),
          ratType: p.ratType,
        };
      })
      .filter(
        (rat) =>
          rat.x >= visibleRange.minX &&
          rat.x <= visibleRange.maxX &&
          rat.y >= visibleRange.minY &&
          rat.y <= visibleRange.maxY,
      );
  }, [questRatsVisible, completedQuestIds, ratPositions, visibleRange]);

  const visibleNpcs = useMemo(
    () =>
      NPCS.map((npc) => {
        const world = npcPositions[npc.id];
        return {
          ...npc,
          x: world.x,
          y: world.y,
          direction: world.direction,
          stance: world.stance,
        };
      }).filter(
        (npc) =>
          npc.x >= visibleRange.minX &&
          npc.x <= visibleRange.maxX &&
          npc.y >= visibleRange.minY &&
          npc.y <= visibleRange.maxY,
      ),
    [npcPositions, visibleRange],
  );

  const treasureAt = (x: number, y: number) =>
    visibleTreasures.find((t) => t.x === x && t.y === y);

  return (
    <div className="absolute inset-0 z-0">
      <div
        ref={viewportRef}
        className="relative w-full h-full overflow-hidden rounded-b-2xl bg-[#1a3324]"
      >
        <motion.div
          className="absolute top-0 left-0 will-change-transform"
          style={{ width: MAP_PIXEL_WIDTH, height: MAP_PIXEL_HEIGHT }}
          animate={{ x: camera.x, y: camera.y }}
          transition={{ type: 'tween', duration: 0.12, ease: 'easeOut' }}
        >
          {tiles.map(({ x, y }) => {
            const { className, children } = renderTile(x, y);
            return (
              <div
                key={`tile-${x}-${y}`}
                className={className}
                style={{
                  left: x * TILE_SIZE,
                  top: y * TILE_SIZE,
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                }}
              >
                {children}
              </div>
            );
          })}

          <MapDecorationLayer decorations={visibleDecorations} />

          {visibleTreasures.map((treasure) => (
            <div
              key={treasure.id}
              className="absolute pointer-events-none z-[11] flex items-end justify-center"
              style={{
                left: treasure.x * TILE_SIZE,
                top: treasure.y * TILE_SIZE,
                width: TILE_SIZE,
                height: TILE_SIZE,
              }}
            >
              <TreasureMarker variant={treasure.variant} />
            </div>
          ))}

          {radarTarget && <TreasureRadarPing x={radarTarget.x} y={radarTarget.y} />}

          <AnimatePresence>
            {visibleQuestRats.map((rat, index) => {
              const questPoint = normalizeQuestPoint({
                questionId: rat.questId,
                x: rat.x,
                y: rat.y,
              });
              const isBoss = rat.questId === 10 && completedQuestIds.size >= 9;
              const inRange = isWithinRatInteractionRange(playerPos, rat);
              const frozen = isRatWanderFrozenForPlayer(rat, playerPos);
              const isAdjacent = highlightQuestId === rat.questId;
              const showCatchNet = inRange;
              const ratHovered = hoveredRatQuestId === rat.questId;
              const ratFacing = getRatDisplayFacing(rat, playerPos);
              return (
              <motion.div
                key={`quest-rat-${rat.questId}`}
                className="absolute z-[12] flex items-end justify-center"
                style={{
                  left: rat.x * TILE_SIZE,
                  top: rat.y * TILE_SIZE,
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                }}
                initial={ratsBurst ? { scale: 0, opacity: 0 } : false}
                animate={
                  ratsBurst
                    ? { scale: [0, 1.35, 0.95, 1], opacity: 1 }
                    : undefined
                }
                transition={
                  ratsBurst
                    ? { duration: 0.55, delay: index * 0.07, ease: [0.34, 1.56, 0.64, 1] }
                    : { type: 'spring', stiffness: 420, damping: 34 }
                }
              >
                <div
                  role="button"
                  tabIndex={0}
                  className={`relative mb-0.5 flex flex-col items-center cursor-pointer
                    ${isBoss ? 'scale-110 origin-bottom' : ''}
                    ${ratHovered ? 'z-30' : ''}`}
                  onMouseEnter={() => setHoveredRatQuestId(rat.questId)}
                  onMouseLeave={() => setHoveredRatQuestId(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuestRatClick?.(questPoint);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key.toLowerCase() === 'z') {
                      e.preventDefault();
                      onQuestRatClick?.(questPoint);
                    }
                  }}
                  aria-label={showCatchNet ? '可抓捕的變異老鼠' : '變異老鼠'}
                >
                  <EntityGroundShadow wide />
                  {isBoss && (
                    <div
                      className="absolute -inset-2 rounded-full bg-red-500/30 blur-md animate-pulse pointer-events-none"
                      aria-hidden
                    />
                  )}
                  {showCatchNet && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.85 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="absolute -top-[2.75rem] left-1/2 -translate-x-1/2 z-40"
                    >
                      <RatCatchNetIndicator
                        hovered={ratHovered}
                        adjacent={isAdjacent}
                      />
                    </motion.div>
                  )}
                  <RatSprite
                    ratType={rat.ratType}
                    variant={isBoss ? 'boss' : 'normal'}
                    direction={ratFacing}
                    animateWalk={!frozen && !freezeEntityFacing}
                    className={isBoss ? '!w-10 !h-10' : '!w-8 !h-8'}
                  />
                </div>
              </motion.div>
            );
            })}
          </AnimatePresence>

          {visibleNpcs.map((npc) => {
            const hasHint = seekingNpc === npc.id;
            const nearPlayer =
              Math.abs(npc.x - playerPos.x) + Math.abs(npc.y - playerPos.y) <= 5;
            return (
              <motion.div
                key={`npc-${npc.id}`}
                layout={!freezeEntityFacing}
                className="absolute flex items-end justify-center pointer-events-none z-[15]"
                style={{
                  left: npc.x * TILE_SIZE,
                  top: npc.y * TILE_SIZE,
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                }}
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              >
                <div className="relative flex flex-col items-center w-full justify-end pb-0.5">
                  {hasHint && (
                    <span className="absolute -top-1 -right-1 z-30 w-4 h-4 bg-rose-500 rounded-full text-[9px] text-white font-black flex items-center justify-center animate-pulse drop-shadow-xl">
                      !
                    </span>
                  )}
                  <EntityGroundShadow wide />
                  <div className="relative w-9 h-11 drop-shadow-xl">
                    <NpcMapSprite
                      npcId={npc.id}
                      direction={npc.stance}
                      animate={nearPlayer && !freezeEntityFacing}
                    />
                  </div>
                  <span className="text-[7px] font-bold text-white bg-black/60 px-1.5 rounded mt-0.5 shadow-sm whitespace-nowrap">
                    {npc.name}
                  </span>
                </div>
              </motion.div>
            );
          })}

          <div
            className="absolute flex items-end justify-center pointer-events-none z-[15]"
            style={{
              left: playerPos.x * TILE_SIZE,
              top: playerPos.y * TILE_SIZE,
              width: TILE_SIZE,
              height: TILE_SIZE,
            }}
          >
            <motion.div
              layout={!freezeEntityFacing}
              className="relative flex flex-col items-center w-full justify-end pb-0.5 z-20"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              <EntityGroundShadow wide />
              <div className="relative w-10 h-12 drop-shadow-xl">
                <PlayerMapSprite
                  characterId={characterId}
                  direction={playerDirection}
                  className="w-full h-full"
                  animate={!freezeEntityFacing}
                />
              </div>
              <span
                className="text-[9px] font-bold text-white bg-slate-800/80 px-1.5 py-0.5 rounded mt-0.5 shadow-md whitespace-nowrap max-w-[88px] truncate leading-tight"
                title={playerNameTagFull}
              >
                {playerNameTag}
              </span>
            </motion.div>
          </div>
        </motion.div>

        <div
          className="absolute inset-0 pointer-events-none rounded-b-2xl shadow-[inset_0_0_80px_rgba(0,0,0,0.35)]"
          aria-hidden
        />
      </div>
    </div>
  );
}
