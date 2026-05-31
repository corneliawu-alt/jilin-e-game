import React from 'react';
import { DOLLS, PLAYER_ROLE } from '../constants/gameData';
import { getPlayerImageFallback } from '../constants/characterAssets';
import { Shield } from 'lucide-react';

interface CharacterSelectProps {
  onSelect: (id: string) => void;
}

export default function CharacterSelect({ onSelect }: CharacterSelectProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 bg-linear-to-b from-amber-50 to-white overflow-y-auto">
      <h2 className="text-2xl font-bold text-amber-900 mb-2 flex items-center gap-2">
        <Shield className="text-amber-500" /> 選擇你的{PLAYER_ROLE}形象
      </h2>
      <p className="text-sm text-amber-600 mb-6 text-center">兩位稽查員已就定位，準備出發拯救吉林小鎮！</p>

      <div className="grid grid-cols-2 gap-6 w-full max-w-lg px-2">
        {DOLLS.map((doll) => (
          <button
            key={doll.id}
            type="button"
            onClick={() => onSelect(doll.id)}
            className="group relative flex flex-col items-center bg-white border-4 border-amber-100 rounded-3xl p-4 transition-all hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-200 hover:-translate-y-1 cursor-pointer"
          >
            <div className="w-full aspect-square mb-3 overflow-hidden rounded-2xl bg-amber-50 flex items-center justify-center p-2">
              <img
                src={doll.img}
                alt={doll.name}
                className="w-full h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getPlayerImageFallback(doll.id);
                }}
              />
            </div>
            <h3 className="text-base font-bold text-amber-800 mb-1">{doll.name}</h3>
            <p className="text-xs text-amber-600 text-center leading-relaxed">{doll.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
