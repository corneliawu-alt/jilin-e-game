import React from 'react';

export function EntityGroundShadow({ wide = false }: { wide?: boolean }) {
  return (
    <div
      className={`absolute bottom-0 left-1/2 -translate-x-1/2 bg-black/30 rounded-full blur-sm pointer-events-none ${
        wide ? 'w-[85%] h-3' : 'w-[70%] h-2'
      }`}
      aria-hidden
    />
  );
}

export function ParkBenchSvg({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 20" className={`w-8 h-4 ${className}`} aria-hidden>
      <rect x="2" y="13" width="36" height="3" rx="1" fill="#78350f" />
      <rect x="4" y="9" width="32" height="4" rx="1.5" fill="#92400e" />
      <rect x="6" y="10" width="28" height="2" rx="0.5" fill="#a16207" opacity="0.85" />
      <rect x="5" y="14" width="3" height="5" rx="0.5" fill="#57534e" />
      <rect x="32" y="14" width="3" height="5" rx="0.5" fill="#57534e" />
    </svg>
  );
}

export function StreetLampSvg({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 40" className={`w-5 h-9 ${className}`} aria-hidden>
      <ellipse cx="12" cy="38" rx="8" ry="2" fill="rgb(0 0 0 / 0.35)" />
      <rect x="10" y="14" width="4" height="24" fill="#57534e" />
      <rect x="6" y="36" width="12" height="3" rx="1" fill="#44403c" />
      <circle cx="12" cy="10" r="7" fill="#fef08a" className="animate-pulse" />
      <circle cx="12" cy="10" r="4" fill="#fde047" opacity="0.9" />
    </svg>
  );
}

export function TrafficLightSvg({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 32" className={`w-4 h-8 ${className}`} aria-hidden>
      <rect x="7" y="8" width="6" height="22" fill="#374151" rx="1" />
      <rect x="3" y="28" width="14" height="3" fill="#1f2937" rx="1" />
      <circle cx="10" cy="12" r="2.5" fill="#ef4444" />
      <circle cx="10" cy="18" r="2.5" fill="#eab308" />
      <circle cx="10" cy="24" r="2.5" fill="#22c55e" />
    </svg>
  );
}

export function NeonSignSvg({
  label,
  accent = '#f97316',
}: {
  label: string;
  accent?: string;
}) {
  return (
    <div className="relative drop-shadow-xl pointer-events-none">
      <svg viewBox="0 0 120 48" className="w-[88px] h-9 sm:w-[100px] sm:h-10" aria-hidden>
        <rect x="4" y="8" width="112" height="32" rx="4" fill="#1c1917" stroke={accent} strokeWidth="2" />
        <rect x="8" y="12" width="104" height="24" rx="2" fill={accent} opacity="0.25" className="animate-pulse" />
        <text
          x="60"
          y="30"
          textAnchor="middle"
          fill="#fef3c7"
          fontSize="13"
          fontWeight="bold"
          style={{ textShadow: `0 0 8px ${accent}` }}
        >
          {label.length > 6 ? label.slice(0, 6) : label}
        </text>
      </svg>
      <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[7px] font-black text-amber-100 bg-black/70 px-1.5 py-px rounded whitespace-nowrap drop-shadow-lg">
        {label}
      </span>
    </div>
  );
}

export function WoodSignSvg({ label }: { label: string }) {
  return (
    <div className="relative drop-shadow-xl">
      <svg viewBox="0 0 80 56" className="w-14 h-10" aria-hidden>
        <rect x="36" y="40" width="8" height="14" fill="#78350f" />
        <rect x="8" y="6" width="64" height="36" rx="3" fill="#92400e" stroke="#451a03" strokeWidth="2" />
        <rect x="12" y="10" width="56" height="28" rx="2" fill="#d97706" />
        <text x="40" y="28" textAnchor="middle" fill="#fffbeb" fontSize="11" fontWeight="bold">
          {label.length > 4 ? label.slice(0, 4) : label}
        </text>
      </svg>
    </div>
  );
}

export function AwningSvg({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center drop-shadow-lg">
      <svg viewBox="0 0 48 20" className="w-10 h-4" aria-hidden>
        <path d="M4 4 L44 4 L40 18 L8 18 Z" fill="#dc2626" stroke="#7f1d1d" strokeWidth="1" />
        <path d="M6 6 L42 6 L38 14 L10 14 Z" fill="#ef4444" opacity="0.8" />
      </svg>
      {label && (
        <span className="text-[7px] font-bold text-white bg-red-800/90 px-1 rounded -mt-0.5">{label}</span>
      )}
    </div>
  );
}

export function FountainPlaza({ className = '' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <span className="text-2xl drop-shadow-md" role="img" aria-label="噴水池">
        ⛲
      </span>
    </div>
  );
}

export function FlowerCluster({ variant }: { variant: number }) {
  const flowers = ['🌸', '🌻', '🌷', '🌼'];
  const a = flowers[variant % flowers.length];
  const b = flowers[(variant + 1) % flowers.length];
  const c = flowers[(variant + 2) % flowers.length];
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-px drop-shadow-lg">
      <span className="text-[10px] leading-none">{a}</span>
      <span className="text-xs leading-none -mt-1">{b}</span>
      <span className="text-[10px] leading-none">{c}</span>
    </div>
  );
}
