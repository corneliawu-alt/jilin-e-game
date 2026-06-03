import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, School, Hash, ArrowRight, Sparkles, ChevronLeft, LogIn, Trophy } from 'lucide-react';
import { UserInfo } from '../App';
import { GAME_TITLE, PLAYER_ROLE } from '../constants/gameData';
import { useBgm } from '../contexts/BgmContext';
import {
  PLAYER_CHARACTERS,
  getPlayerImageFallback,
  SPRITE_IMG_CLASS,
  type PlayerCharacterId,
} from '../constants/characterAssets';
import LoginLeaderboard from './LoginLeaderboard';
import LoginDecorRats from './LoginDecorRats';

interface LoginProps {
  onStartGame: (info: UserInfo, characterId: PlayerCharacterId) => void;
}

type OnboardingStep = 'info' | 'character';

function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="login-hero-bg absolute inset-0" />
      <div className="login-hero-vignette absolute inset-0" />
    </div>
  );
}

function RpgScrollFrame({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`login-rpg-scroll relative flex flex-col min-h-0 ${className}`}>
      <span className="login-rpg-corner login-rpg-corner--tl" aria-hidden />
      <span className="login-rpg-corner login-rpg-corner--tr" aria-hidden />
      <span className="login-rpg-corner login-rpg-corner--bl" aria-hidden />
      <span className="login-rpg-corner login-rpg-corner--br" aria-hidden />
      {children}
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
    <div className="relative flex flex-col min-h-full h-full overflow-x-hidden overflow-y-auto">
      <HeroBackground />

      <AnimatePresence mode="wait">
        {step === 'info' && (
          <motion.div
            key="step-info-layout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex flex-col flex-1 min-h-0 p-3 sm:p-4 overflow-visible"
          >
            <LoginDecorRats />

            <RpgScrollFrame className="flex-1 z-10">
              <header className="shrink-0 text-center px-4 sm:px-6 pt-4 sm:pt-5 pb-3 border-b border-amber-600/25">
                <div className="inline-flex items-center justify-center gap-2 sm:gap-3 max-w-full">
                  <Trophy size={18} className="shrink-0 text-amber-400" aria-hidden />
                  <h1 className="login-rpg-heading login-rpg-heading--hero game-logo-text">
                    {GAME_TITLE}
                  </h1>
                  <Trophy size={18} className="shrink-0 text-amber-400" aria-hidden />
                </div>
              </header>

              <div className="flex flex-col flex-1 min-h-0 px-3 sm:px-5 pt-3 pb-2">
                <div className="flex-1 min-h-[140px] sm:min-h-[160px] flex flex-col">
                  <LoginLeaderboard />
                </div>

                <div className="login-rpg-divider my-3 sm:my-4 shrink-0" aria-hidden />

                <motion.form
                  onSubmit={handleInfoSubmit}
                  className="shrink-0 pb-4 sm:pb-5 space-y-3"
                >
                  <div className="text-center">
                    <h2 className="login-rpg-heading text-lg sm:text-xl">
                      {PLAYER_ROLE} · 報到處
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-amber-400 shrink-0" aria-hidden />
                    <p className="login-rpg-label">登入報到</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                    <RpgInput
                      icon={<School size={16} />}
                      placeholder="班級"
                      value={classId}
                      onChange={setClassId}
                    />
                    <RpgInput
                      icon={<Hash size={16} />}
                      placeholder="座號"
                      value={seatNumber}
                      onChange={setSeatNumber}
                    />
                    <RpgInput
                      icon={<User size={16} />}
                      placeholder="姓名"
                      value={name}
                      onChange={setName}
                    />
                  </div>

                  <div className="relative">
                    <button
                      type="submit"
                      disabled={!canProceedInfo}
                      className="login-rpg-cta w-full py-3.5 sm:py-4 rounded-xl font-black
                        text-sm sm:text-base tracking-wide
                        disabled:opacity-35 disabled:pointer-events-none disabled:shadow-none
                        flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <LogIn size={18} aria-hidden />
                      開始遊戲 / 登入報到
                      <ArrowRight size={18} aria-hidden />
                    </button>
                  </div>

                  <p className="login-rpg-caption text-center">
                    填妥資料後選擇角色，進入小鎮後開始計時
                  </p>
                </motion.form>
              </div>
            </RpgScrollFrame>
          </motion.div>
        )}

        {step === 'character' && (
          <motion.div
            key="step-character"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
            className="relative z-10 flex flex-col flex-1 min-h-0 p-3 sm:p-4 overflow-y-auto"
          >
            <RpgScrollFrame className="max-w-2xl mx-auto w-full flex-1">
              <div className="px-4 sm:px-6 py-4 sm:py-6">
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={() => setStep('info')}
                    className="flex items-center gap-1 text-xs sm:text-sm text-amber-300/80
                      hover:text-amber-200 transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={16} /> 返回報到處
                  </button>
                  <span
                    className="text-[10px] font-bold text-amber-200 bg-amber-950/80 px-2 py-1
                      rounded-full border border-amber-600/50"
                  >
                    選擇角色
                  </span>
                </div>

                <h2 className="login-rpg-heading text-lg sm:text-xl mb-1 text-center">
                  選擇你的稽查員形象
                </h2>
                <p className="login-rpg-caption text-center mb-5">
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
                        className={`character-card group relative flex flex-col items-center rounded-xl p-4
                          transition-all duration-300 cursor-pointer border-2
                          bg-slate-950/50
                          ${
                            selected
                              ? 'border-amber-500 scale-105 shadow-lg shadow-amber-500/25 ring-2 ring-amber-400/40'
                              : 'border-amber-800/35 hover:border-amber-500/60 hover:scale-[1.02]'
                          }`}
                      >
                        <div
                          className={`w-full aspect-square rounded-lg mb-3 overflow-hidden flex items-center
                            justify-center p-2 bg-linear-to-br ${char.accentClass}
                            ${selected ? 'ring-2 ring-amber-400/60' : ''}`}
                        >
                          <img
                            src={char.portrait}
                            alt={char.name}
                            className={`${SPRITE_IMG_CLASS} group-hover:scale-105 transition-transform duration-300`}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                getPlayerImageFallback(char.id);
                            }}
                          />
                        </div>
                        <h3 className="text-sm font-black text-amber-100 mb-1">{char.name}</h3>
                        <p className="text-[10px] sm:text-xs text-amber-200/55 text-center leading-snug">
                          {char.description}
                        </p>
                        {selected && (
                          <span
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-500
                              text-slate-950 text-xs font-black flex items-center justify-center shadow-md"
                          >
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
                      className="login-rpg-cta login-rpg-cta--success w-full mt-6 py-4 rounded-xl
                        font-black text-base sm:text-lg
                        flex items-center justify-center gap-2 cursor-pointer"
                    >
                      進入小鎮，開始任務！ <ArrowRight size={22} aria-hidden />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </RpgScrollFrame>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RpgInput({
  icon,
  placeholder,
  value,
  onChange,
  className = '',
}: {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={`relative group ${className}`}>
      <span
        className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500/70
          group-focus-within:text-amber-400 transition-colors"
      >
        {icon}
      </span>
      <input
        type="text"
        required
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="login-rpg-input w-full pl-10 pr-3 py-3 rounded-lg text-sm sm:text-base
          border outline-none transition-all"
      />
    </div>
  );
}
