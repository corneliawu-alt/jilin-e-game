import React from 'react';
import {
  TileId,
  getTileId,
  getBuildingMeta,
  getRoadDetail,
  getMainRoadLaneMark,
  getRoundaboutRing,
  isBuildingTile,
  touchesRoadOrSidewalk,
  touchesGrass,
  touchesRoad,
  isMapEdgeForestCell,
  SHOP_THEMES,
  type ShopThemeId,
} from '../../constants/gameData';
import { FlowerCluster } from './mapDecorations';

function hash2(x: number, y: number, seed = 0): number {
  return (x * 928371 + y * 689287 + seed) % 9973;
}

function showGrassTuft(x: number, y: number): boolean {
  const id = getTileId(x, y);
  if (id !== TileId.Grass && id !== TileId.GrassDark) return false;
  if (isMapEdgeForestCell(x, y)) return false;
  return hash2(x, y, 42) % 9 < 2;
}

function resolveTheme(x: number, y: number, tileId: TileId): ShopThemeId | null {
  const meta = getBuildingMeta(x, y);
  if (meta) return meta.theme;
  if (tileId === TileId.RoofHome) return 'home';
  if (tileId === TileId.RoofShop) return 'grocery';
  return null;
}

function sameBuildingCell(x1: number, y1: number, x2: number, y2: number): boolean {
  const a = getBuildingMeta(x1, y1);
  const b = getBuildingMeta(x2, y2);
  return !!a && !!b && a.buildingId === b.buildingId;
}

/** 僅建築外緣保留立體陰影，內部格線消除 */
function isExteriorStructureEdge(x: number, y: number): boolean {
  if (!isBuildingTile(x, y)) return false;
  return (
    !sameBuildingCell(x, y, x - 1, y) ||
    !sameBuildingCell(x, y, x + 1, y) ||
    !sameBuildingCell(x, y, x, y - 1) ||
    !sameBuildingCell(x, y, x, y + 1)
  );
}

function getBuildingBlendClasses(x: number, y: number): string {
  const meta = getBuildingMeta(x, y);
  if (!meta?.buildingId) return '';
  let cls = 'tile-building-cell';
  if (sameBuildingCell(x, y, x - 1, y)) cls += ' tile-seam-l';
  if (sameBuildingCell(x, y, x + 1, y)) cls += ' tile-seam-r';
  if (sameBuildingCell(x, y, x, y - 1)) cls += ' tile-seam-t';
  if (sameBuildingCell(x, y, x, y + 1)) cls += ' tile-seam-b';
  return cls;
}

function getTerrainClasses(tileId: TileId, x: number, y: number): string {
  const meta = getBuildingMeta(x, y);
  const theme = meta?.theme ?? resolveTheme(x, y, tileId);
  const themeStyle = theme ? SHOP_THEMES[theme] : null;
  const rbRing = getRoundaboutRing(x, y);
  const forestEdge = isMapEdgeForestCell(x, y);

  switch (tileId) {
    case TileId.Grass:
      return forestEdge ? 'tile-grass tile-forest-border bg-green-700' : 'tile-grass bg-emerald-400';
    case TileId.GrassDark:
      return forestEdge
        ? 'tile-grass-dark tile-forest-border bg-green-700'
        : 'tile-grass-dark bg-emerald-500';
    case TileId.Path:
      return 'tile-dirt bg-amber-700/70';
    case TileId.Sidewalk:
      return `tile-sidewalk bg-stone-300 ${(x + y) % 2 === 0 ? 'brightness-[1.03]' : 'brightness-[0.97]'}`;
    case TileId.Plaza:
      return rbRing === 1
        ? 'tile-plaza tile-roundabout-plaza bg-slate-200'
        : 'tile-plaza bg-slate-200';
    case TileId.Road:
      return rbRing === 2 || rbRing === 3
        ? 'tile-road-lane tile-roundabout-road bg-slate-600'
        : 'tile-road-lane bg-slate-700';
    case TileId.RoadDashH:
      return rbRing === 2 || rbRing === 3
        ? 'tile-road-center-h tile-road-dash-h tile-roundabout-road bg-slate-600'
        : 'tile-road-center-h tile-road-dash-h bg-slate-700';
    case TileId.RoadDashV:
      return rbRing === 2 || rbRing === 3
        ? 'tile-road-center-v tile-road-dash-v tile-roundabout-road bg-slate-600'
        : 'tile-road-center-v tile-road-dash-v bg-slate-700';
    case TileId.Tree:
      return forestEdge
        ? 'tile-tree-base tile-forest-border bg-green-700'
        : 'tile-tree-base bg-emerald-600/0';
    case TileId.Pond:
      return 'tile-pond bg-sky-400/80';
    case TileId.Fountain:
      return 'tile-fountain-base bg-transparent';
    case TileId.FlowerBed:
      return rbRing === 1
        ? 'tile-flower-bed tile-roundabout-floral bg-emerald-300/80'
        : 'tile-flower-bed bg-emerald-300/80';
    case TileId.RoofHome:
    case TileId.RoofShop:
      return `tile-roof tile-roof-shingle shadow-inner ${themeStyle?.roofGradient ?? 'bg-gradient-to-br from-stone-400 to-stone-600'}`;
    case TileId.Wall:
      return `tile-wall tile-wall-brick ${themeStyle?.wallClass ?? 'bg-stone-200'}`;
    case TileId.Window:
      return 'tile-window bg-stone-100';
    case TileId.Door:
      return 'tile-door bg-amber-800';
    default:
      return 'bg-emerald-400';
  }
}

function GrassTuft({ x, y }: { x: number; y: number }) {
  return (
    <>
      {[1, 2].map((i) => (
        <span
          key={i}
          className="absolute w-1 h-1 rounded-full bg-emerald-800 pointer-events-none"
          style={{
            left: `${(hash2(x, y, i) % 70) + 12}%`,
            top: `${(hash2(x, y, i + 3) % 60) + 18}%`,
          }}
          aria-hidden
        />
      ))}
    </>
  );
}

function AwningStrip({ theme }: { theme: ShopThemeId }) {
  const cls = SHOP_THEMES[theme].awningClass;
  if (!cls) return null;
  return (
    <div
      className={`absolute inset-x-0 top-0 h-[9px] z-[22] pointer-events-none rounded-b-md awning-strip-3d ${cls}`}
      aria-hidden
    />
  );
}

function RoofShingleOverlay() {
  return <div className="absolute inset-0 pointer-events-none tile-roof-shingle-overlay" aria-hidden />;
}

function LaneCenterLine({ direction }: { direction: 'h' | 'v' }) {
  return (
    <div
      className={`absolute pointer-events-none z-[1] ${
        direction === 'h'
          ? 'inset-x-0 top-1/2 -translate-y-1/2 h-[3px] lane-center-h'
          : 'inset-y-0 left-1/2 -translate-x-1/2 w-[3px] lane-center-v'
      }`}
      aria-hidden
    />
  );
}

function ZebraCrossing({ horizontal }: { horizontal: boolean }) {
  return (
    <div
      className={`absolute pointer-events-none opacity-90 ${
        horizontal
          ? 'inset-x-1 bottom-0 h-[60%] tile-zebra-h'
          : 'inset-y-1 left-0 w-[60%] tile-zebra-v'
      }`}
      aria-hidden
    />
  );
}

function ManholeCover() {
  return (
    <div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[18px] h-[18px] rounded-full pointer-events-none z-[2]"
      aria-hidden
    >
      <div
        className="relative w-full h-full rounded-full bg-gradient-to-br from-slate-400 to-slate-700
          border-2 border-slate-800 shadow-[inset_0_2px_5px_rgba(0,0,0,0.55),0_1px_0_rgba(255,255,255,0.25)] tile-manhole"
      >
        <div className="absolute inset-[3px] rounded-full border border-slate-600/90" />
        <div className="absolute inset-0 flex items-center justify-center gap-[2px]">
          <div className="w-[3px] h-[3px] rounded-full bg-slate-900/70" />
          <div className="w-[3px] h-[3px] rounded-full bg-slate-900/70" />
        </div>
      </div>
    </div>
  );
}

function WindowPane() {
  return (
    <div
      className="absolute left-1/2 top-[24%] -translate-x-1/2 w-[58%] h-[42%] rounded-[2px]
        bg-sky-200 border-2 border-white/90 shadow-inner z-[12]
        bg-[linear-gradient(135deg,rgba(255,255,255,0.55)_0%,transparent_50%)] tile-window-glass"
      aria-hidden
    >
      <div className="absolute inset-x-[15%] top-0 bottom-0 w-px bg-white/90 left-1/2 -translate-x-1/2" />
      <div className="absolute inset-y-[15%] left-0 right-0 h-px bg-white/90 top-1/2 -translate-y-1/2" />
      <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.35)_0%,transparent_45%)]" />
    </div>
  );
}

function WallLamp() {
  return (
    <div
      className="absolute top-[18%] right-[12%] z-[18] pointer-events-none flex flex-col items-center"
      aria-hidden
    >
      <div
        className="w-2 h-2.5 rounded-sm bg-amber-700 border border-amber-900/50
          shadow-[0_1px_2px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.3)]"
      />
      <div className="w-3 h-1 rounded-full bg-amber-200/90 blur-[1px] -mt-px" />
    </div>
  );
}

function WoodDoor({ theme, showSign }: { theme: ShopThemeId; showSign?: boolean }) {
  const t = SHOP_THEMES[theme];
  return (
    <>
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[72%] h-[82%] rounded-t-sm
          bg-gradient-to-b from-amber-600 to-amber-900 border border-amber-950/40
          shadow-[inset_0_2px_4px_rgba(255,255,255,0.25),0_2px_4px_rgba(0,0,0,0.35)] z-[14]"
        aria-hidden
      >
        <div className="absolute right-[22%] top-[45%] w-1 h-1 rounded-full bg-yellow-300 shadow-sm" />
      </div>
      {showSign && (
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center drop-shadow-md pointer-events-none">
          <span className="text-xs leading-none">{t.emoji}</span>
          <span
            className="text-[5px] font-black text-white bg-black/70 px-1.5 py-px rounded-sm mt-px
              whitespace-nowrap border border-amber-400/50 shadow-sm"
          >
            {t.label}
          </span>
        </div>
      )}
    </>
  );
}

function FountainPool() {
  return (
    <div className="absolute inset-[2px] flex items-center justify-center pointer-events-none drop-shadow-lg">
      <div className="relative w-[88%] h-[88%] rounded-full bg-stone-500 p-[3px] shadow-md">
        <div className="relative w-full h-full rounded-full bg-sky-300 fountain-ripple overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_40%_35%,rgba(255,255,255,0.45)_0%,transparent_55%)]" />
          <span className="relative text-xl leading-none z-10 drop-shadow-sm" role="img" aria-label="噴水池">
            ⛲
          </span>
        </div>
      </div>
    </div>
  );
}

function TreeSprite({ forestEdge }: { forestEdge?: boolean }) {
  return (
    <div className="absolute inset-0 flex items-end justify-center pb-0.5 pointer-events-none">
      <div
        className={`absolute bottom-0 left-[10%] w-[80%] h-2.5 rounded-full blur-sm ${
          forestEdge ? 'bg-black/45' : 'bg-black/30'
        }`}
      />
      <span
        className={`leading-none drop-shadow-md z-10 ${forestEdge ? 'text-2xl' : 'text-2xl'}`}
        role="img"
        aria-hidden
      >
        {forestEdge ? '🌲' : '🌳'}
      </span>
    </div>
  );
}

function isRoadFamily(tileId: TileId) {
  return tileId === TileId.Road || tileId === TileId.RoadDashH || tileId === TileId.RoadDashV;
}

export type RenderTileResult = {
  className: string;
  children: React.ReactNode;
  elevated: boolean;
};

export function renderTile(x: number, y: number): RenderTileResult {
  const tileId = getTileId(x, y);
  const meta = getBuildingMeta(x, y);
  const theme = resolveTheme(x, y, tileId);
  const exteriorEdge = isExteriorStructureEdge(x, y);
  const buildingBlend = isBuildingTile(x, y) ? getBuildingBlendClasses(x, y) : '';
  const forestEdge = isMapEdgeForestCell(x, y);
  const elevated =
    tileId === TileId.Tree ||
    tileId === TileId.Fountain ||
    tileId === TileId.Pond ||
    isBuildingTile(x, y);

  let className = `absolute overflow-hidden ${getTerrainClasses(tileId, x, y)} ${buildingBlend}`;

  if ((tileId === TileId.Grass || tileId === TileId.GrassDark) && touchesRoadOrSidewalk(x, y)) {
    className += ' tile-edge-grass';
  }
  if (isRoadFamily(tileId) && touchesGrass(x, y)) {
    className += ' tile-edge-road';
  }
  if (tileId === TileId.Sidewalk && touchesGrass(x, y)) {
    className += ' tile-edge-sidewalk';
  }
  if (tileId === TileId.Sidewalk && touchesRoad(x, y)) {
    className += ' tile-edge-sidewalk-curb';
  }
  if (tileId === TileId.Path && touchesGrass(x, y)) {
    className += ' tile-edge-path';
  }

  const roadDetail = getRoadDetail(x, y);
  const laneMark = getMainRoadLaneMark(x, y, tileId);

  if (exteriorEdge && isBuildingTile(x, y)) {
    className += ' tile-building-exterior-edge';
  }
  if (tileId === TileId.Tree || tileId === TileId.Fountain) {
    className += ' drop-shadow-md';
  } else if (elevated && isBuildingTile(x, y)) {
    className += ' drop-shadow-lg';
  }

  const children = (
    <>
      {(tileId === TileId.Grass || tileId === TileId.GrassDark) && showGrassTuft(x, y) && (
        <GrassTuft x={x} y={y} />
      )}

      {meta?.isAwningRow && theme && SHOP_THEMES[theme].isShop && <AwningStrip theme={theme} />}

      {laneMark && <LaneCenterLine direction={laneMark} />}

      {roadDetail === 'zebra-h' && <ZebraCrossing horizontal />}
      {roadDetail === 'zebra-v' && <ZebraCrossing horizontal={false} />}
      {roadDetail === 'manhole' && <ManholeCover />}

      {(tileId === TileId.RoofHome || tileId === TileId.RoofShop) && <RoofShingleOverlay />}

      {(tileId === TileId.Window || meta?.part === 'window') && (
        <WindowPane />
      )}

      {meta?.hasWallLamp && <WallLamp />}

      {(tileId === TileId.Door || meta?.part === 'door') && theme && (
        <WoodDoor theme={theme} showSign={meta?.showSign} />
      )}

      {tileId === TileId.RoofHome || tileId === TileId.RoofShop ? (
        <div
          className="absolute inset-x-0 bottom-0 h-1.5 bg-black/20 pointer-events-none tile-roof-eave"
          aria-hidden
        />
      ) : null}

      {tileId === TileId.Tree && <TreeSprite forestEdge={forestEdge} />}

      {tileId === TileId.Fountain && <FountainPool />}

      {tileId === TileId.Pond && (
        <div className="absolute inset-1 rounded-md bg-sky-400/90 fountain-ripple flex items-center justify-center text-sm drop-shadow-md">
          💧
        </div>
      )}

      {tileId === TileId.FlowerBed && (
        <div className="absolute inset-0 pointer-events-none drop-shadow-md">
          <FlowerCluster variant={(x + y) % 4} />
        </div>
      )}
    </>
  );

  return { className, children, elevated };
}
