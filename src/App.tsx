/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Login from './components/Login';
import GameIntro from './components/GameIntro';
import Game, { GameResultStats } from './components/Game';
import Result from './components/Result';
import { BgmAutoplayUnlock } from './contexts/BgmContext';
import type { PlayerCharacterId } from './constants/characterAssets';

export type GameState = 'LOGIN' | 'INTRO' | 'PLAYING' | 'RESULT';

export interface UserInfo {
  classId: string;
  seatNumber: string;
  name: string;
}

const GAME_SHELL =
  'max-w-4xl h-[min(92vh,820px)] bg-white rounded-3xl border-4 border-amber-100';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('LOGIN');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<PlayerCharacterId | null>(null);
  const [resultStats, setResultStats] = useState<GameResultStats | null>(null);

  const handleStartGame = (info: UserInfo, characterId: PlayerCharacterId) => {
    setUserInfo(info);
    setSelectedCharacter(characterId);
    setGameState('INTRO');
  };

  const handleIntroComplete = () => {
    setGameState('PLAYING');
  };

  const handleGameComplete = (stats: GameResultStats) => {
    setResultStats(stats);
    setGameState('RESULT');
  };

  const handleRestart = () => {
    setGameState('LOGIN');
    setUserInfo(null);
    setSelectedCharacter(null);
    setResultStats(null);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-sky-50 via-amber-50 to-orange-50 flex items-center justify-center p-4 font-sans selection:bg-amber-200">
      <BgmAutoplayUnlock />
      <div
        className={`w-full overflow-hidden relative flex flex-col shadow-2xl ${
          gameState === 'PLAYING' || gameState === 'INTRO'
            ? GAME_SHELL
            : gameState === 'LOGIN'
              ? 'max-w-4xl min-h-[min(92vh,720px)] rounded-3xl border border-amber-200/80 login-shell shadow-xl shadow-amber-100/60'
              : 'max-w-2xl aspect-[4/3] bg-white rounded-3xl border-4 border-amber-100'
        }`}
      >
        <AnimatePresence mode="wait">
          {gameState === 'LOGIN' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 min-h-0"
            >
              <Login onStartGame={handleStartGame} />
            </motion.div>
          )}

          {gameState === 'INTRO' && selectedCharacter && userInfo && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 min-h-0 overflow-hidden rounded-[1.25rem]"
            >
              <GameIntro
                characterId={selectedCharacter}
                playerName={userInfo.name}
                onContinue={handleIntroComplete}
              />
            </motion.div>
          )}

          {gameState === 'PLAYING' && selectedCharacter && userInfo && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 min-h-0 overflow-hidden"
            >
              <Game
                characterId={selectedCharacter}
                playerName={userInfo.name}
                onComplete={handleGameComplete}
              />
            </motion.div>
          )}

          {gameState === 'RESULT' && resultStats && userInfo && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1"
            >
              <Result
                userInfo={userInfo}
                stats={resultStats}
                onRestart={handleRestart}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
