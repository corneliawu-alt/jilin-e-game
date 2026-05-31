import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, School, Hash, ArrowRight, Sparkles, ChevronLeft } from 'lucide-react';
import { UserInfo } from '../App';
import { GAME_TITLE, PLAYER_ROLE } from '../constants/gameData';
import { useBgm } from '../contexts/BgmContext';
import {
  PLAYER_CHARACTERS,
  getPlayerImageFallback,
  SPRITE_IMG_CLASS,
  type PlayerCharacterId,
} from '../constants/characterAssets';

interface LoginProps {
  onStartGame: (info: UserInfo, characterId: PlayerCharacterId) => void;
}

type OnboardingStep = 'info' | 'character';

function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="login-hero-bg absolute inset-0" />
      <div className="login-hero-grid absolute inset-0" />
      {Array.from({ length: 18 }).map((_, i) => (
        <span
          key={i}
          className="login-particle absolute rounded-full bg-sky-300/50"
          style={{
            left: `${(i * 17 + 5) % 100}%`,
            top: `${(i * 23 + 11) % 100}%`,
            width: `${3 + (i % 2)}px`,
            height: `${3 + (i % 2)}px`,
            animationDelay: `${(i % 8) * 0.4}s`,
            animationDuration: `${4 + (i % 5)}s`,
          }}
        />
      ))}
    </div>
  );
}

function GameLogo() {
  return (
    <div className="text-center mb-6 relative z-10">
      <p className="text-[10px] sm:text-xs font-bold tracking-[0.35em] text-sky-600/80 uppercase mb-2">
        Jilin Town Defense RPG
      </p>
      <h1 className="game-logo-text text-2xl sm:text-4xl font-black leading-tight px-2">
        {GAME_TITLE}
      </h1>
      <p className="mt-3 text-sm sm:text-base text-amber-800/85 font-medium">
        扮演{PLAYER_ROLE}，守護吉林小鎮！
      </p>
    </div>
  );
}

export default function Login({ onStartGame }: LoginProps) {
  const { unlock } = useBgm();
  const [step, setStep] = useState<OnboardingStep>('info');
  const [classId, setClassId] = useState('');
  const [seatNumber, setSeatNumber] = useState('');
  const [name, setName] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState<PlayerCharacterId | null>(null);

  const canProceedInfo = classId.trim() && seatNumber.trim() && name.trim();

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canProceedInfo) return;
    setStep('character');
  };

  const handleStartGame = () => {
    if (!selectedCharacter || !canProceedInfo) return;
    unlock();
    onStartGame(
      { classId: classId.trim(), seatNumber: seatNumber.trim(), name: name.trim() },
      selectedCharacter,
    );
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-full p-4 sm:p-8 overflow-hidden">
      <HeroBackground />
      <GameLogo />

      <div className="relative z-10 w-full max-w-2xl">
        <AnimatePresence mode="wait">
          {step === 'info' && (
            <motion.form
              key="step-info"
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleInfoSubmit}
              className="login-glass-panel rounded-3xl p-6 sm:p-8 space-y-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={18} className="text-amber-500" />
                <h2 className="text-lg font-black text-amber-950">第一步：登記稽查員資料</h2>
              </div>

              <GlassInput
                icon={<School size={18} />}
                placeholder="班級（如：501）"
                value={classId}
                onChange={setClassId}
              />
              <GlassInput
                icon={<Hash size={18} />}
                placeholder="座號"
                value={seatNumber}
                onChange={setSeatNumber}
              />
              <GlassInput
                icon={<User size={18} />}
                placeholder="姓名"
                value={name}
                onChange={setName}
              />

              <button
                type="submit"
                disabled={!canProceedInfo}
                className="w-full mt-2 py-4 rounded-2xl font-black text-base sm:text-lg
                  bg-linear-to-r from-amber-400 to-orange-500 text-amber-950
                  shadow-lg shadow-amber-200/80 hover:shadow-xl hover:shadow-amber-300/80
                  hover:scale-[1.02] active:scale-[0.98] transition-all
                  disabled:opacity-40 disabled:pointer-events-none
                  flex items-center justify-center gap-2 cursor-pointer"
              >
                前往角色選擇 <ArrowRight size={20} />
              </button>
            </motion.form>
          )}

          {step === 'character' && (
            <motion.div
              key="step-character"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.25 }}
              className="login-glass-panel rounded-3xl p-6 sm:p-8"
            >
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => setStep('info')}
                  className="flex items-center gap-1 text-xs sm:text-sm text-amber-700/80 hover:text-amber-900 transition-colors cursor-pointer"
                >
                  <ChevronLeft size={16} /> 返回修改資料
                </button>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-1 rounded-full border border-amber-200">
                  第二步
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-black text-amber-950 mb-1 text-center">
                選擇你的稽查員形象
              </h2>
              <p className="text-xs sm:text-sm text-amber-700/80 text-center mb-5">
                兩位特派稽查員已就定位，請選擇一位出發！
              </p>

              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                {PLAYER_CHARACTERS.map((char) => {
                  const selected = selectedCharacter === char.id;
                  return (
                    <button
                      key={char.id}
                      type="button"
                      onClick={() => setSelectedCharacter(char.id)}
                      className={`character-card group relative flex flex-col items-center rounded-2xl p-4 transition-all duration-300 cursor-pointer
                        bg-white/70 border-2
                        ${selected
                          ? 'border-amber-500 scale-105 shadow-lg shadow-amber-200/90 ring-2 ring-amber-300/60'
                          : 'border-amber-100 hover:border-amber-300 hover:scale-[1.02] shadow-sm'
                        }`}
                    >
                      <div
                        className={`w-full aspect-square rounded-xl mb-3 overflow-hidden flex items-center justify-center p-2
                          bg-linear-to-br ${char.accentClass}
                          ${selected ? 'ring-2 ring-amber-400/70' : ''}`}
                      >
                        <img
                          src={char.portrait}
                          alt={char.name}
                          className={`${SPRITE_IMG_CLASS} group-hover:scale-105 transition-transform duration-300`}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = getPlayerImageFallback(char.id);
                          }}
                        />
                      </div>
                      <h3 className="text-sm font-black text-amber-950 mb-1">{char.name}</h3>
                      <p className="text-[10px] sm:text-xs text-amber-700/75 text-center leading-snug">
                        {char.description}
                      </p>
                      {selected && (
                        <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-black flex items-center justify-center shadow-md">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {selectedCharacter && (
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    onClick={handleStartGame}
                    className="w-full mt-6 py-4 rounded-2xl font-black text-base sm:text-xl
                      bg-linear-to-r from-emerald-500 to-teal-500 text-white
                      shadow-lg shadow-emerald-200/80 hover:shadow-xl hover:shadow-emerald-300/70
                      hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer
                      flex items-center justify-center gap-2"
                  >
                    開始防衛戰！ <ArrowRight size={22} />
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function GlassInput({
  icon,
  placeholder,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative group">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 group-focus-within:text-amber-600 transition-colors">
        {icon}
      </span>
      <input
        type="text"
        required
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-11 pr-4 py-3.5 rounded-xl
          bg-white/80 backdrop-blur-sm border border-amber-100
          text-amber-950 placeholder:text-amber-300 text-base
          focus:border-amber-400 focus:ring-2 focus:ring-amber-200 outline-none transition-all shadow-sm"
      />
    </div>
  );
}
