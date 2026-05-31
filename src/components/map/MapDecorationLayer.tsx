import React from 'react';
import { TILE_SIZE, getTileId, TileId, type MapDecoration } from '../../constants/gameData';
import {
  StreetLampSvg,
  TrafficLightSvg,
  FlowerCluster,
  EntityGroundShadow,
  ParkBenchSvg,
} from './mapDecorations';

function canPlaceDecoration(x: number, y: number, kind: MapDecoration['kind']): boolean {
  const id = getTileId(x, y);
  if (kind === 'bench') {
    return id === TileId.Sidewalk || id === TileId.Plaza || id === TileId.GrassDark || id === TileId.FlowerBed;
  }
  if (kind === 'trash' || kind === 'box') {
    return (
      id === TileId.Path ||
      id === TileId.Plaza ||
      id === TileId.Grass ||
      id === TileId.GrassDark ||
      id === TileId.Sidewalk
    );
  }
  if (kind === 'traffic') {
    return id === TileId.Sidewalk;
  }
  if (kind === 'lamp') {
    return id === TileId.Sidewalk || id === TileId.Plaza;
  }
  if (kind === 'emoji') {
    return (
      id === TileId.Wall ||
      id === TileId.Grass ||
      id === TileId.GrassDark ||
      id === TileId.Path ||
      id === TileId.Sidewalk ||
      id === TileId.Plaza ||
      id === TileId.FlowerBed
    );
  }
  return false;
}

function DecorationItem({ deco }: { deco: MapDecoration }) {
  if (!canPlaceDecoration(deco.x, deco.y, deco.kind)) return null;

  switch (deco.kind) {
    case 'lamp':
      return (
        <div className="flex flex-col items-center justify-end h-full pb-0.5 drop-shadow-xl shadow-[0_0_15px_rgba(253,224,71,0.6)]">
          <EntityGroundShadow />
          <StreetLampSvg />
        </div>
      );
    case 'flowers':
      return (
        <div className="relative w-full h-full drop-shadow-md">
          <FlowerCluster variant={deco.variant ?? 0} />
        </div>
      );
    case 'bench':
      return (
        <div className="relative flex items-end justify-center h-full pb-1 drop-shadow-md">
          <EntityGroundShadow wide />
          <ParkBenchSvg />
        </div>
      );
    case 'mailbox':
      return (
        <div className="flex items-end justify-center h-full pb-0.5 drop-shadow-md">
          <span className="text-base leading-none">📮</span>
        </div>
      );
    case 'signpost':
      return (
        <div className="flex items-end justify-center h-full pb-1 drop-shadow-md">
          <span className="text-sm leading-none">🪧</span>
        </div>
      );
    case 'trash':
      return (
        <div className="flex items-end justify-center h-full pb-0.5 drop-shadow-md">
          <EntityGroundShadow />
          <span className="text-base leading-none">🗑️</span>
        </div>
      );
    case 'box':
      return (
        <div className="flex items-end justify-center h-full pb-0.5 drop-shadow-md">
          <EntityGroundShadow />
          <span className="text-base leading-none">📦</span>
        </div>
      );
    case 'traffic':
      return (
        <div className="flex items-end justify-center h-full pb-0.5 drop-shadow-md">
          <EntityGroundShadow />
          <TrafficLightSvg />
        </div>
      );
    case 'emoji':
    default:
      return (
        <div className="flex flex-col items-center justify-end h-full pb-0.5 drop-shadow-md">
          <EntityGroundShadow />
          <span className="text-2xl leading-none mb-0.5">{deco.emoji}</span>
          {deco.label && (
            <span className="text-[7px] font-bold text-white bg-black/55 px-1 rounded">{deco.label}</span>
          )}
        </div>
      );
  }
}

interface MapDecorationLayerProps {
  decorations: MapDecoration[];
}

export default function MapDecorationLayer({ decorations }: MapDecorationLayerProps) {
  return (
    <>
      {decorations.map((deco) => (
        <div
          key={deco.id}
          className="absolute pointer-events-none z-[10] flex flex-col items-center"
          style={{
            left: deco.x * TILE_SIZE,
            top: deco.y * TILE_SIZE,
            width: TILE_SIZE,
            height: TILE_SIZE,
          }}
        >
          <DecorationItem deco={deco} />
        </div>
      ))}
    </>
  );
}
