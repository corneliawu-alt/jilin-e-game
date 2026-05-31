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
  computeCameraOffset,
  MAP_DECORATIONS,
  type TargetNPC,
} from '../constants/gameData';
import { renderTile } from './map/renderTile';
import TreasureRadarPing from './map/TreasureRadarPing';
import MapDecorationLayer from './map/MapDecorationLayer';
import { EntityGroundShadow } from './map/mapDecorations';
import EnemyRat from './EnemyRat';
import NpcMapSprite from './NpcMapSprite';
import PlayerMapSprite from './PlayerMapSprite';
import type { SpriteDirection, PlayerCharacterId } from '../constants/characterAssets';
import { resolveNpcFacing, formatPlayerNameTag, getPlayerCharacter, truncatePlayerName } from '../constants/characterAssets';

interface GameMapProps {
  playerPos: { x: number; y: number };
  characterId: PlayerCharacterId | string;
  playerName: string;
  playerDirection: SpriteDirection;
  seekingNpc: TargetNPC | null;
  completedQuestIds: ReadonlySet<number>;
  questRatsVisible: boolean;
  ratsBurst: boolean;
  collectedTreasureIds: ReadonlySet<string>;
  radarTarget: { x: number; y: number } | null;
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
  seekingNpc,
  completedQuestIds,
  questRatsVisible,
  ratsBurst,
  collectedTreasureIds,
  radarTarget,
}: GameMapProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState({ width: 896, height: 600 });

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

  const visibleQuestRats = useMemo(
    () =>
      questRatsVisible
        ? QUEST_POINTS.filter(
            (p) =>
              !completedQuestIds.has(p.questionId) &&
              p.x >= visibleRange.minX &&
              p.x <= visibleRange.maxX &&
              p.y >= visibleRange.minY &&
              p.y <= visibleRange.maxY,
          )
        : [],
    [questRatsVisible, completedQuestIds, visibleRange],
  );

  const npcAt = (x: number, y: number) => NPCS.find((n) => n.x === x && n.y === y);
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
            {visibleQuestRats.map((quest, index) => {
              const isBoss = quest.questionId === 10 && completedQuestIds.size >= 9;
              return (
              <motion.div
                key={`quest-rat-${quest.questionId}`}
                className="absolute pointer-events-none z-[12] flex items-end justify-center"
                style={{
                  left: quest.x * TILE_SIZE,
                  top: quest.y * TILE_SIZE,
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                }}
                initial={ratsBurst ? { scale: 0, opacity: 0, y: -20 } : false}
                animate={
                  ratsBurst
                    ? { scale: [0, 1.35, 0.95, 1], opacity: 1, y: 0 }
                    : { opacity: 1, y: 0, scale: 1 }
                }
                transition={
                  ratsBurst
                    ? { duration: 0.55, delay: index * 0.07, ease: [0.34, 1.56, 0.64, 1] }
                    : { duration: 0.2 }
                }
              >
                <motion.div
                  className={`relative mb-1 flex flex-col items-center ${isBoss ? 'scale-150 origin-bottom' : ''}`}
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 2, delay: index * 0.07 + 0.5 }}
                >
                  <EntityGroundShadow wide />
                  {isBoss && (
                    <div
                      className="absolute -inset-2 rounded-full bg-red-500/30 blur-md animate-pulse pointer-events-none"
                      aria-hidden
                    />
                  )}
                  <span
                    className="absolute -top-0.5 -right-0.5 z-30 w-3.5 h-3.5 bg-rose-500 rounded-full
                      text-[9px] text-white font-black flex items-center justify-center
                      animate-pulse drop-shadow-md border border-rose-300"
                    aria-label="任務老鼠"
                  >
                    !
                  </span>
                  <EnemyRat
                    color={isBoss ? '#991b1b' : '#57534e'}
                    className={`drop-shadow-xl rounded-full ${
                      isBoss
                        ? 'ring-4 ring-red-500/90 shadow-[0_0_16px_rgba(239,68,68,0.75)]'
                        : 'ring-2 ring-amber-400/70'
                    }`}
                  />
                </motion.div>
              </motion.div>
            );
            })}
          </AnimatePresence>

          {tiles.map(({ x, y }) => {
            const npc = npcAt(x, y);
            const isPlayer = playerPos.x === x && playerPos.y === y;
            const hasHint = npc && seekingNpc === npc.id;
            const hasTreasure = !!treasureAt(x, y);

            if (!npc && !isPlayer) return null;

            return (
              <div
                key={`entity-${x}-${y}`}
                className="absolute flex items-end justify-center pointer-events-none z-[15]"
                style={{
                  left: x * TILE_SIZE,
                  top: y * TILE_SIZE,
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                }}
              >
                {npc && !isPlayer && (
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
                        direction={resolveNpcFacing(npc.x, npc.y, playerPos.x, playerPos.y, npc.id)}
                        animate={Math.abs(npc.x - playerPos.x) + Math.abs(npc.y - playerPos.y) <= 5}
                      />
                    </div>
                    <span className="text-[7px] font-bold text-white bg-black/60 px-1.5 rounded mt-0.5 shadow-sm whitespace-nowrap">
                      {npc.name}
                    </span>
                  </div>
                )}

                {isPlayer && (
                  <motion.div
                    layout
                    className="relative flex flex-col items-center w-full justify-end pb-0.5 z-20"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  >
                    <EntityGroundShadow wide />
                    <div className="relative w-10 h-12 drop-shadow-xl">
                      <PlayerMapSprite
                        characterId={characterId}
                        direction={playerDirection}
                        className="w-full h-full"
                      />
                    </div>
                    <span
                      className="text-[9px] font-bold text-white bg-slate-800/80 px-1.5 py-0.5 rounded mt-0.5 shadow-md whitespace-nowrap max-w-[88px] truncate leading-tight"
                      title={playerNameTagFull}
                    >
                      {playerNameTag}
                    </span>
                  </motion.div>
                )}

                {hasTreasure && isPlayer && null}
              </div>
            );
          })}
        </motion.div>

        <div
          className="absolute inset-0 pointer-events-none rounded-b-2xl shadow-[inset_0_0_80px_rgba(0,0,0,0.35)]"
          aria-hidden
        />
      </div>
    </div>
  );
}
