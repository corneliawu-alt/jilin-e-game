import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  NPCS,
  DOLLS,
  TOTAL_QUESTS,
  TargetNPC,
  PLAYER_ROLE,
  calculateFinalScore,
  PLAYER_START,
  canMoveTo,
  getAdjacentNpc,
  getQuestPointAt,
  isRatEncounterCell,
  getTreasureAt,
  getQuestionById,
  PREVENTION_ITEMS_BY_ID,
  createEmptyInventory,
  hasFullBossKit,
  type GamePhase,
  type TreasureSpot,
  type PlayerInventory,
} from '../constants/gameData';
import QuestQuizDialog from './QuestQuizDialog';
import NpcDialog from './NpcDialog';
import GameMap from './GameMap';
import GameHeader from './GameHeader';
import RatTauntDialog from './RatTauntDialog';
import EnemyRat from './EnemyRat';
import RpgDialogBox, { RpgContinueHint } from './RpgDialogBox';
import {
  getPlayerPortraitPath,
  getPlayerPortraitFallback,
  type SpriteDirection,
  type PlayerCharacterId,
} from '../constants/characterAssets';
import { HelpCircle, ShieldCheck } from 'lucide-react';
import {
  findNearestTreasure,
  getUncollectedTreasures,
  generateBossBlockedTaunt,
  canUseRadarFree,
  canUseRadarWithScore,
  RADAR_SCORE_COST,
  RADAR_PING_DURATION_MS,
} from '../constants/treasureRadar';

const REQUIRED_NPCS: TargetNPC[] = ['Chef', 'Doctor', 'Captain'];

const CERTIFICATION_MESSAGE =
  '知識裝備完成！變異老鼠出現了，快去消滅牠們！';

export interface GameResultStats {
  score: number;
  completedQuests: number;
  firstTryCorrect: number;
  totalAttempts: number;
  elapsedSeconds: number;
  stars: 1 | 2 | 3;
}

interface GameProps {
  characterId: string;
  onComplete: (stats: GameResultStats) => void;
}

export default function Game({ characterId, onComplete }: GameProps) {
  const [playerPos, setPlayerPos] = useState(PLAYER_START);
  const [completedQuestIds, setCompletedQuestIds] = useState<Set<number>>(() => new Set());
  const [activeQuestionId, setActiveQuestionId] = useState<number | null>(null);
  const [preventionScore, setPreventionScore] = useState(0);
  const [showBadgeBurst, setShowBadgeBurst] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [seekingNpc, setSeekingNpc] = useState<TargetNPC | null>(null);
  const [activeNpc, setActiveNpc] = useState<(typeof NPCS)[0] | null>(null);
  const [npcLineIndex, setNpcLineIndex] = useState(0);
  const [npcClueMode, setNpcClueMode] = useState(false);
  const [firstTryCorrect, setFirstTryCorrect] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [questAttempted, setQuestAttempted] = useState(false);
  const [talkedToNPCs, setTalkedToNPCs] = useState<Set<TargetNPC>>(() => new Set());
  const [gamePhase, setGamePhase] = useState<GamePhase>('learning');
  const [ratsVisible, setRatsVisible] = useState(false);
  const [showRatBurst, setShowRatBurst] = useState(false);
  const [collectedTreasureIds, setCollectedTreasureIds] = useState<Set<string>>(() => new Set());
  const [inventory, setInventory] = useState<PlayerInventory>(() => createEmptyInventory());
  const [activeTreasure, setActiveTreasure] = useState<TreasureSpot | null>(null);
  const [showTreasureDialog, setShowTreasureDialog] = useState(false);
  const [showRatTauntDialog, setShowRatTauntDialog] = useState(false);
  const [bossGateMode, setBossGateMode] = useState<'blocked' | 'ready' | null>(null);
  const [bossBlockedMessage, setBossBlockedMessage] = useState('');
  const [lastRadarUsedAt, setLastRadarUsedAt] = useState<number | null>(null);
  const [radarTarget, setRadarTarget] = useState<{ x: number; y: number } | null>(null);
  const [radarToast, setRadarToast] = useState<string | null>(null);
  const [showCertificationModal, setShowCertificationModal] = useState(false);
  const [certModalDismissed, setCertModalDismissed] = useState(false);
  const [lastCapturedQuestId, setLastCapturedQuestId] = useState<number | null>(null);
  const [startTime] = useState(() => Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const prevPlayerPosRef = useRef(PLAYER_START);
  const [playerDirection, setPlayerDirection] = useState<SpriteDirection>('down');

  const doll = DOLLS.find((d) => d.id === characterId)!;
  const activeQuestion = activeQuestionId ? getQuestionById(activeQuestionId) : undefined;
  const completedQuests = completedQuestIds.size;
  const allQuestsDone = completedQuests >= TOTAL_QUESTS;
  const isCertified = talkedToNPCs.size >= REQUIRED_NPCS.length;
  const uiBlocked =
    showQuiz ||
    !!activeNpc ||
    showTreasureDialog ||
    showRatTauntDialog ||
    !!bossGateMode ||
    (showCertificationModal && !certModalDismissed);
  const movementBlocked = uiBlocked;
  const adjacentNpcId = getAdjacentNpc(playerPos);
  const adjacentNpcName = adjacentNpcId
    ? NPCS.find((n) => n.id === adjacentNpcId)?.name
    : null;
  const remainingQuests = TOTAL_QUESTS - completedQuests;

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  useEffect(() => {
    if (allQuestsDone) {
      const score = calculateFinalScore(completedQuests, firstTryCorrect, elapsedSeconds);
      const stars = score >= 85 ? 3 : score >= 60 ? 2 : 1;
      const t = setTimeout(
        () =>
          onComplete({
            score,
            completedQuests,
            firstTryCorrect,
            totalAttempts,
            elapsedSeconds,
            stars: stars as 1 | 2 | 3,
          }),
        800,
      );
      return () => clearTimeout(t);
    }
  }, [
    allQuestsDone,
    completedQuests,
    firstTryCorrect,
    totalAttempts,
    elapsedSeconds,
    onComplete,
  ]);

  useEffect(() => {
    if (isCertified && !certModalDismissed) {
      setShowCertificationModal(true);
    }
  }, [isCertified, certModalDismissed]);

  /** 移動觸發：尋寶優先，實戰期才觸發老鼠任務 */
  useEffect(() => {
    if (
      showQuiz ||
      activeNpc ||
      showTreasureDialog ||
      showRatTauntDialog ||
      bossGateMode ||
      (showCertificationModal && !certModalDismissed)
    ) {
      return;
    }

    const prev = prevPlayerPosRef.current;
    const moved = prev.x !== playerPos.x || prev.y !== playerPos.y;
    prevPlayerPosRef.current = playerPos;

    if (!moved) return;

    const treasure = getTreasureAt(playerPos.x, playerPos.y, collectedTreasureIds);
    if (treasure) {
      setActiveTreasure(treasure);
      setShowTreasureDialog(true);
      return;
    }

    const onRatCell = isRatEncounterCell(
      playerPos.x,
      playerPos.y,
      completedQuestIds,
    );
    if (!onRatCell) return;

    if (gamePhase === 'learning' || talkedToNPCs.size < REQUIRED_NPCS.length) {
      setShowRatTauntDialog(true);
      return;
    }

    const point = getQuestPointAt(playerPos.x, playerPos.y, completedQuestIds);
    if (!point) return;

    if (gamePhase !== 'combat' || !ratsVisible) return;

    const isBossQuest = point.questionId === 10 && completedQuestIds.size >= 9;
    if (isBossQuest) {
      if (!hasFullBossKit(inventory)) {
        setBossBlockedMessage(generateBossBlockedTaunt(inventory, collectedTreasureIds));
        setBossGateMode('blocked');
        return;
      }
      setActiveQuestionId(point.questionId);
      setQuestAttempted(false);
      setBossGateMode('ready');
      return;
    }

    setActiveQuestionId(point.questionId);
    setQuestAttempted(false);
    setShowQuiz(true);
  }, [
    playerPos,
    collectedTreasureIds,
    inventory,
    showQuiz,
    activeNpc,
    showTreasureDialog,
    showRatTauntDialog,
    bossGateMode,
    showCertificationModal,
    certModalDismissed,
    gamePhase,
    ratsVisible,
    completedQuestIds,
    talkedToNPCs,
  ]);

  const movePlayer = useCallback(
    (dx: number, dy: number) => {
      if (movementBlocked) return;

      if (dy < 0) setPlayerDirection('up');
      else if (dy > 0) setPlayerDirection('down');
      else if (dx < 0) setPlayerDirection('left');
      else if (dx > 0) setPlayerDirection('right');

      setPlayerPos((prev) => {
        const newX = prev.x + dx;
        const newY = prev.y + dy;
        if (!canMoveTo(newX, newY)) return prev;
        return { x: newX, y: newY };
      });
    },
    [movementBlocked],
  );

  const dismissCertificationModal = useCallback(() => {
    setCertModalDismissed(true);
    setShowCertificationModal(false);
    setGamePhase('combat');
    setShowRatBurst(true);
    window.setTimeout(() => {
      setRatsVisible(true);
      window.setTimeout(() => setShowRatBurst(false), 2200);
    }, 400);
  }, []);

  const dismissTreasureDialog = useCallback(() => {
    setActiveTreasure((current) => {
      if (current) {
        const item = PREVENTION_ITEMS_BY_ID[current.itemId];
        setCollectedTreasureIds((prev) => new Set(prev).add(current.id));
        setInventory((inv) => ({ ...inv, [current.itemId]: inv[current.itemId] + 1 }));
        setPreventionScore((s) => s + item.scoreBonus);
      }
      return null;
    });
    setShowTreasureDialog(false);
  }, []);

  const dismissBossGateReady = useCallback(() => {
    setBossGateMode(null);
    setShowQuiz(true);
  }, []);

  const dismissBossGateBlocked = useCallback(() => {
    setBossGateMode(null);
    setBossBlockedMessage('');
  }, []);

  const activateTreasureRadar = useCallback(() => {
    const now = Date.now();
    if (!canUseRadarWithScore(preventionScore, lastRadarUsedAt, now)) return;

    const target = findNearestTreasure(playerPos, collectedTreasureIds);
    if (!target) return;

    const free = canUseRadarFree(lastRadarUsedAt, now);
    if (!free) {
      setPreventionScore((s) => s - RADAR_SCORE_COST);
    }
    setLastRadarUsedAt(now);
    setRadarTarget({ x: target.x, y: target.y });

    const item = PREVENTION_ITEMS_BY_ID[target.itemId];
    setRadarToast(`雷達鎖定：${item.emoji} ${item.name}（距離 ${Math.abs(target.x - playerPos.x) + Math.abs(target.y - playerPos.y)} 格）`);

    window.setTimeout(() => setRadarTarget(null), RADAR_PING_DURATION_MS);
    window.setTimeout(() => setRadarToast(null), RADAR_PING_DURATION_MS + 1500);
  }, [preventionScore, lastRadarUsedAt, playerPos, collectedTreasureIds]);

  const interactWithNpc = useCallback(() => {
    if (showQuiz || activeNpc) return;

    const nearbyId = getAdjacentNpc(playerPos);
    if (!nearbyId) return;

    const nearby = NPCS.find((n) => n.id === nearbyId);
    if (!nearby) return;

    setActiveNpc(nearby);
    setNpcLineIndex(0);
    setNpcClueMode(seekingNpc === nearbyId);
  }, [showQuiz, activeNpc, playerPos, seekingNpc]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showTreasureDialog) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          dismissTreasureDialog();
        }
        return;
      }

      if (showCertificationModal && !certModalDismissed) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          dismissCertificationModal();
        }
        return;
      }

      if (bossGateMode === 'ready') {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          dismissBossGateReady();
        }
        return;
      }

      if (bossGateMode === 'blocked') {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          dismissBossGateBlocked();
        }
        return;
      }

      if (showRatTauntDialog || bossGateMode) return;

      if (showQuiz || activeNpc) return;

      const key = e.key.toLowerCase();

      if (
        ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', ' '].includes(
          key,
        )
      ) {
        e.preventDefault();
      }

      switch (key) {
        case 'arrowup':
        case 'w':
          movePlayer(0, -1);
          break;
        case 'arrowdown':
        case 's':
          movePlayer(0, 1);
          break;
        case 'arrowleft':
        case 'a':
          movePlayer(-1, 0);
          break;
        case 'arrowright':
        case 'd':
          movePlayer(1, 0);
          break;
        case ' ':
          interactWithNpc();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    movePlayer,
    interactWithNpc,
    showQuiz,
    activeNpc,
    showTreasureDialog,
    showCertificationModal,
    certModalDismissed,
    dismissCertificationModal,
    dismissTreasureDialog,
    showRatTauntDialog,
    bossGateMode,
    dismissBossGateReady,
    dismissBossGateBlocked,
  ]);

  const triggerBadgeBurst = useCallback(() => {
    setShowBadgeBurst(true);
    const t = setTimeout(() => setShowBadgeBurst(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const handleQuestCorrect = () => {
    if (activeQuestionId === null) return;

    const capturedId = activeQuestionId;
    setTotalAttempts((a) => a + 1);
    if (!questAttempted) {
      setFirstTryCorrect((c) => c + 1);
    }
    setPreventionScore((s) => s + 10);
    setCompletedQuestIds((prev) => new Set(prev).add(capturedId));
    setLastCapturedQuestId(capturedId);
    triggerBadgeBurst();
    setShowQuiz(false);
    setSeekingNpc(null);
    setQuestAttempted(false);
    setActiveQuestionId(null);
    setTimeout(() => setLastCapturedQuestId(null), 700);
  };

  const handleQuestWrong = (targetNPC: TargetNPC) => {
    setTotalAttempts((a) => a + 1);
    if (!questAttempted) setQuestAttempted(true);
    setSeekingNpc(targetNPC);
    setShowQuiz(false);
    setActiveQuestionId(null);
  };

  const closeNpc = (learningComplete = false) => {
    if (activeNpc && learningComplete && !npcClueMode) {
      setTalkedToNPCs((prev) => {
        const next = new Set(prev);
        next.add(activeNpc.id);
        return next;
      });
    }
    setActiveNpc(null);
    setNpcLineIndex(0);
    setNpcClueMode(false);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const npcProgress = talkedToNPCs.size;
  const uncollectedTreasureCount = getUncollectedTreasures(collectedTreasureIds).length;
  const hintText =
    gamePhase === 'learning'
      ? `探索地圖，找 3 位專家按空白鍵學習（${npcProgress}/3）— 碰到地圖上的老鼠會嘲諷你！`
      : seekingNpc
        ? `答錯了！請找【${NPCS.find((n) => n.id === seekingNpc)?.name}】取得線索，再回到地圖上的老鼠任務點`
        : adjacentNpcName
          ? `按空白鍵與【${adjacentNpcName}】對話`
          : `走向地圖上的老鼠觸發防疫任務（剩餘 ${remainingQuests} 個）— 尋寶收集三種防疫道具！`;

  return (
    <div className="relative w-full h-full overflow-hidden font-sans bg-slate-900 flex flex-col min-h-0">
      <GameHeader
        dollName={doll.name}
        playerPos={playerPos}
        elapsedSeconds={elapsedSeconds}
        completedQuests={completedQuests}
        completedQuestIds={completedQuestIds}
        lastCapturedQuestId={lastCapturedQuestId}
        preventionScore={preventionScore}
        showBadgeBurst={showBadgeBurst}
        formatTime={formatTime}
        gamePhase={gamePhase}
        npcProgress={npcProgress}
        inventory={inventory}
        talkedToNPCs={talkedToNPCs}
        seekingNpc={seekingNpc}
        uncollectedTreasureCount={uncollectedTreasureCount}
        lastRadarUsedAt={lastRadarUsedAt}
        onActivateRadar={activateTreasureRadar}
        radarUiDisabled={uiBlocked}
      />

      <div className="relative flex-1 min-h-0 w-full">
        <GameMap
          playerPos={playerPos}
          characterId={characterId as PlayerCharacterId}
          playerDirection={playerDirection}
          seekingNpc={seekingNpc}
          completedQuestIds={completedQuestIds}
          questRatsVisible={
            ratsVisible ||
            (gamePhase === 'learning' && talkedToNPCs.size < REQUIRED_NPCS.length)
          }
          ratsBurst={showRatBurst}
          collectedTreasureIds={collectedTreasureIds}
          radarTarget={radarTarget}
        />

        {!uiBlocked && (
          <div
            className="absolute bottom-0 left-0 right-0 z-[90] pointer-events-none
              p-2 pb-3 bg-linear-to-t from-black/50 via-black/25 to-transparent"
          >
            <div className="max-w-4xl mx-auto pointer-events-auto">
              {allQuestsDone ? (
                <div className="text-center py-2 bg-emerald-100 rounded-xl border-2 border-emerald-300 mb-1.5">
                  <p className="font-black text-emerald-800 text-sm">全部任務完成！正在結算……</p>
                </div>
              ) : null}

              <div className="flex items-center gap-1.5 text-[10px] text-white/90 px-1 drop-shadow">
                <HelpCircle size={12} className="shrink-0" />
                <span>{radarToast ?? hintText}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showRatBurst && (
          <motion.div
            key="rat-burst"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.2, 1, 1.1] }}
            transition={{ duration: 2, times: [0, 0.15, 0.7, 1] }}
            className="fixed inset-0 z-[180] flex items-center justify-center pointer-events-none"
          >
            <span
              className="text-5xl sm:text-7xl font-black text-amber-300 drop-shadow-[0_0_30px_rgba(251,191,36,0.9)]
                [text-shadow:4px_4px_0_#92400e]"
            >
              砰！
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTreasureDialog && activeTreasure && (() => {
          const item = PREVENTION_ITEMS_BY_ID[activeTreasure.itemId];
          return (
            <RpgDialogBox
              key={`treasure-${activeTreasure.id}`}
              speakerName="尋寶成功"
              speakerBadge={
                <span className="text-[10px] bg-amber-500/40 text-amber-100 px-2 py-0.5 rounded border border-amber-400/60 font-bold">
                  +{item.scoreBonus} 積分
                </span>
              }
              portrait={
                <span className="text-4xl leading-none" role="img" aria-label={item.name}>
                  {item.emoji}
                </span>
              }
              onClick={dismissTreasureDialog}
              footer={<RpgContinueHint />}
            >
              <p className="text-white text-sm sm:text-base leading-relaxed font-medium">
                獲得 {item.name} {item.emoji}！
              </p>
              <p className="mt-2 text-[10px] text-amber-200/80">
                {item.description} — 防疫積分 +{item.scoreBonus}，已放入背包。繼續探索地圖尋找更多寶物吧！
              </p>
            </RpgDialogBox>
          );
        })()}
      </AnimatePresence>

      <AnimatePresence>
        {showRatTauntDialog && (
          <RatTauntDialog key="rat-taunt" onClose={() => setShowRatTauntDialog(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {bossGateMode === 'ready' && (
          <RpgDialogBox
            key="boss-ready"
            speakerName="鼠王 Boss"
            speakerBadge={
              <span className="text-[10px] bg-red-600/50 text-red-100 px-2 py-0.5 rounded border border-red-400/70 font-bold">
                終極防疫攻擊
              </span>
            }
            portrait={
              <div className="w-full h-full flex items-center justify-center scale-125">
                <EnemyRat color="#991b1b" className="ring-4 ring-red-500/90 rounded-full drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
              </div>
            }
            onClick={dismissBossGateReady}
            footer={<RpgContinueHint />}
          >
            <p className="text-red-100 text-sm sm:text-base leading-relaxed font-bold">
              你裝備齊全，成功發動終極防疫攻擊！
            </p>
            <p className="mt-2 text-[10px] text-red-200/80">
              黏鼠板、漂白水、防護口罩已就緒 — 準備迎戰鼠王！
            </p>
          </RpgDialogBox>
        )}
        {bossGateMode === 'blocked' && (
          <RpgDialogBox
            key="boss-blocked"
            speakerName="鼠王 Boss"
            speakerBadge={
              <span className="text-[10px] bg-stone-600/50 text-stone-200 px-2 py-0.5 rounded border border-stone-400/70 font-bold">
                無法挑戰
              </span>
            }
            portrait={
              <div className="w-full h-full flex items-center justify-center scale-125">
                <EnemyRat color="#991b1b" className="ring-4 ring-red-500/90 rounded-full opacity-80" />
              </div>
            }
            onClick={dismissBossGateBlocked}
            footer={<RpgContinueHint />}
          >
            <p className="text-rose-100 text-sm sm:text-base leading-relaxed font-medium italic">
              {bossBlockedMessage}
            </p>
          </RpgDialogBox>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCertificationModal && !certModalDismissed && (
          <motion.div
            key="cert-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cert-modal-title"
            onClick={dismissCertificationModal}
          >
            <motion.div
              initial={{ scale: 0.85, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className="max-w-md w-full rounded-2xl border-2 border-amber-400 bg-gradient-to-b from-amber-50 to-orange-100
                shadow-[0_0_60px_rgba(251,191,36,0.45)] p-6 sm:p-8 text-center pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                <ShieldCheck size={36} className="text-white" strokeWidth={2.5} />
              </div>
              <h2
                id="cert-modal-title"
                className="text-lg sm:text-xl font-black text-amber-950 mb-3 leading-snug"
              >
                知識裝備完成！
              </h2>
              <p className="text-sm sm:text-base text-amber-900/90 font-medium leading-relaxed mb-5">
                {CERTIFICATION_MESSAGE}
              </p>
              <button
                type="button"
                onClick={dismissCertificationModal}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm
                  shadow-md transition-colors animate-pulse"
              >
                出發！（空白鍵）
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showQuiz && activeQuestion && (
          <QuestQuizDialog
            key={activeQuestion.id}
            question={activeQuestion}
            questNumber={activeQuestion.id}
            portraitSrc={getPlayerPortraitPath(characterId)}
            portraitFallback={getPlayerPortraitFallback(characterId)}
            portraitAlt={PLAYER_ROLE}
            onCorrect={handleQuestCorrect}
            onSeekNpc={handleQuestWrong}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeNpc && (
          <NpcDialog
            npc={activeNpc}
            lines={activeNpc.idleDialogue}
            lineIndex={npcLineIndex}
            isClueMode={npcClueMode}
            onNext={() => setNpcLineIndex((i) => i + 1)}
            onClose={closeNpc}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
