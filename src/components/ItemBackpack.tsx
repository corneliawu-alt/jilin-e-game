import React from 'react';
import {
  PREVENTION_ITEMS,
  type PlayerInventory,
} from '../constants/items';

interface ItemBackpackProps {
  inventory: PlayerInventory;
  compact?: boolean;
}

/** 防疫道具背包欄 */
export default function ItemBackpack({ inventory, compact = false }: ItemBackpackProps) {
  return (
    <div
      className={`flex items-center gap-1 rounded-md border border-stone-300 bg-stone-50/95 shadow-sm
        ${compact ? 'px-1 py-0.5' : 'px-1.5 py-1'}`}
      title="防疫道具背包"
    >
      <span className="text-[8px] font-black text-stone-600 shrink-0">背包</span>
      {PREVENTION_ITEMS.map((item) => {
        const count = inventory[item.id];
        return (
          <div
            key={item.id}
            className={`flex items-center gap-0.5 rounded px-1 py-0.5 transition-all duration-300
              ${count > 0 ? 'bg-emerald-50 border border-emerald-200/80' : 'bg-stone-100/80 border border-transparent opacity-60'}`}
            title={`${item.name}：${item.description}`}
          >
            <span className="text-sm leading-none" aria-hidden>
              {item.emoji}
            </span>
            <span className="text-[10px] font-black text-stone-800 tabular-nums min-w-[0.75rem] text-center">
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
