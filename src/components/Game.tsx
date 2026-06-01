import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  NPCS,
  DOLLS,
  TOTAL_QUESTS,
  QUEST_POINTS,
  QUESTIONS,
  TargetNPC,
  PLAYER_ROLE,
  calculateFinalScore,
  calculateStars,
  PLAYER_START,
  canMoveTo,
  getNearbyNpc,
  findNearestInteractableQuest,
  resolveRatQuestTarget,
  normalizeQuestPoint,
  isWithinRatInteractionRange,
  type QuestPoint,
  type ResolvedRatQuest,
  getTreasureAt,
  getQuestionById,
  isValidQuestQuestion,
  type QuestQuestion,
  PREVENTION_ITEMS_BY_ID,
  createEmptyInventory,
  hasFullBossKit,
  type GamePhase,
  type TreasureSpot,
  type PlayerInventory,
} from '../constants/gameData';
import QuestQuizDialog, { type QuestAnswerOutcome } from './QuestQuizDialog';
import NpcDialog from './NpcDialog';
import GameMap from './GameMap';
import GameHeader from './GameHeader';
import RatTauntDialog from './RatTauntDialog';
import RatSprite from './RatSprite';
import RpgDialogBox, { RpgContinueHint } from './RpgDialogBox';
import {
  getPlayerPortraitPath,
  getPlayerPortraitFallback,
  type SpriteDirection,
  type PlayerCharacterId,
} from '../constants/characterAssets';
import {
  cloneNpcPositions,
  computeNpcWanderTick,
  nudgeNpcsOffCell,
  applyDialogueFacing,
  NPC_SPAWN_POSITIONS,
  pickNpcWanderIntervalMs,
  type NpcPositionsMap,
} from '../constants/npcWander';
import {
  buildInitialRatPositions,
  computeRatWanderTick,
  pickRatWanderIntervalMs,
} from '../constants/ratWander';
import { resolvePlayerFacingTowardRat } from '../constants/ratAssets';
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
import {
  generateLearningRatTaunt,
  REQUIRED_LEARNING_NPCS,
} from '../constants/ratTaunt';
import { useBgm } from '../contexts/BgmContext';
import type { UserInfo } from '../App';
import VictoryCutscene from './VictoryCutscene';
import HonorCertificate from './HonorCertificate';

const REQUIRED_NPCS: TargetNPC[] = REQUIRED_LEARNING_NPCS;

const CERTIFICATION_MESSAGE =
  '知識裝備完成！變異老鼠出現了，快去消滅牠們！';

/** 除錯：老鼠任務觸發流程（開發者工具篩選 [RatQuest]） */
function logRatQuest(...args: unknown[]) {
  console.log('[RatQuest]', ...args);
}

export interface GameResultStats {
  score: number;
  completedQuests: number;
  firstTryCorrect: number;
  totalAttempts: number;
  elapsedSeconds: number;
  stars: 1 | 2 | 3;
}

type EndgamePhase = null | 'cutscene' | 'certificate';

interface GameProps {
  characterId: string;
  playerName: string;
  userInfo: UserInfo;
  onPlayAgain: () => void;
  onExitHome: () => void;
}

export default function Game({
  characterId,
  playerName,
  userInfo,
  onPlayAgain,
  onExitHome,
}: GameProps) {
  const [playerPos, setPlayerPos] = useState(PLAYER_START);
  const [completedQuestIds, setCompletedQuestIds] = useState<Set<number>>(() => new Set());
  const [activeQuestionId, setActiveQuestionId] = useState<number | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<QuestQuestion | null>(null);
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
  const [failedAttempts, setFailedAttempts] = useState<Record<number, number>>({});
  const [lockedQuestId, setLockedQuestId] = useState<number | null>(null);
  const [showQuestLockDialog, setShowQuestLockDialog] = useState(false);
  const [questSystemDialog, setQuestSystemDialog] = useState<{
    title: string;
    text: string;
  } | null>(null);
  const [talkedToNPCs, setTalkedToNPCs] = useState<Set<TargetNPC>>(() => new Set());
  const [gamePhase, setGamePhase] = useState<GamePhase>('learning');
  const [ratsVisible, setRatsVisible] = useState(false);
  const [showRatBurst, setShowRatBurst] = useState(false);
  const [collectedTreasureIds, setCollectedTreasureIds] = useState<Set<string>>(() => new Set());
  const [inventory, setInventory] = useState<PlayerInventory>(() => createEmptyInventory());
  const [activeTreasure, setActiveTreasure] = useState<TreasureSpot | null>(null);
  const [showTreasureDialog, setShowTreasureDialog] = useState(false);
  const [showRatTauntDialog, setShowRatTauntDialog] = useState(false);
  const [ratTauntMessage, setRatTauntMessage] = useState('');
  const [bossGateMode, setBossGateMode] = useState<'blocked' | 'ready' | null>(null);
  const [bossBlockedMessage, setBossBlockedMessage] = useState('');
  const [lastRadarUsedAt, setLastRadarUsedAt] = useState<number | null>(null);
  const [radarTarget, setRadarTarget] = useState<{ x: number; y: number } | null>(null);
  const [radarToast, setRadarToast] = useState<string | null>(null);
  const [interactionToast, setInteractionToast] = useState<string | null>(null);
  const interactionToastTimerRef = useRef(0);
  const [showCertificationModal, setShowCertificationModal] = useState(false);
  const [certModalDismissed, setCertModalDismissed] = useState(false);
  const [lastCapturedQuestId, setLastCapturedQuestId] = useState<number | null>(null);
  const [startTime] = useState(() => Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const prevPlayerPosRef = useRef(PLAYER_START);
  const ratUnlockBompPlayedRef = useRef(false);
  const [playerDirection, setPlayerDirection] = useState<SpriteDirection>('up');
  const [npcPositions, setNpcPositions] = useState<NpcPositionsMap>(() =>
    cloneNpcPositions(NPC_SPAWN_POSITIONS),
  );
  const [ratPositions, setRatPositions] = useState(() =>
    buildInitialRatPositions(QUEST_POINTS),
  );
  const [endgamePhase, setEndgamePhase] = useState<EndgamePhase>(null);
  const [endgameStats, setEndgameStats] = useState<GameResultStats | null>(null);
  const endgameTriggeredRef = useRef(false);

  const { playRatUnlockBomp, playSfx, beginVictoryMusic, stopVictoryMusic } = useBgm();

  const npcWanderPaused = !!activeNpc || showQuiz || endgamePhase !== null;
  const needsNpcLearning = talkedToNPCs.size < REQUIRED_NPCS.length;
  const isCertified = talkedToNPCs.size >= REQUIRED_NPCS.length;
  const canCaptureRats = isCertified && certModalDismissed && ratsVisible;
  const questRatsOnMap = ratsVisible || needsNpcLearning;
  const ratWanderPaused = npcWanderPaused || !questRatsOnMap;

  const doll = DOLLS.find((d) => d.id === characterId)!;
  const completedQuests = completedQuestIds.size;
  const allQuestsDone = completedQuests >= TOTAL_QUESTS;
  const uiBlocked =
    showQuiz ||
    !!activeNpc ||
    showTreasureDialog ||
    showRatTauntDialog ||
    showQuestLockDialog ||
    !!bossGateMode ||
    (showCertificationModal && !certModalDismissed) ||
    endgamePhase !== null;
  const movementBlocked = uiBlocked;
  const adjacentNpcId = getNearbyNpc(playerPos, npcPositions);
  const adjacentNpcName = adjacentNpcId
    ? NPCS.find((n) => n.id === adjacentNpcId)?.name
    : null;
  /** 學習期：尚未與 3 位 NPC 完成對話（與 gamePhase 無關） */
  const isLearningPhase = needsNpcLearning;
  const adjacentQuestPoint = findNearestInteractableQuest(
    playerPos,
    completedQuestIds,
    ratPositions,
  );
  const highlightQuestId =
    adjacentQuestPoint && (canCaptureRats || needsNpcLearning)
      ? adjacentQuestPoint.questionId
      : null;
  const remainingQuests = TOTAL_QUESTS - completedQuests;

  useEffect(() => {
    if (Object.keys(ratPositions).length >= QUEST_POINTS.length) return;
    setRatPositions(buildInitialRatPositions(QUEST_POINTS));
  }, [ratPositions]);

  useEffect(() => {
    if (endgamePhase !== null) return;
    const timer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime, endgamePhase]);

  /** 完成 10 隻老鼠：暫停計時、淡出 BGM、播放 win、進入加冕劇碼 */
  useEffect(() => {
    if (!allQuestsDone || endgameTriggeredRef.current) return;
    endgameTriggeredRef.current = true;

    const frozenSeconds = Math.floor((Date.now() - startTime) / 1000);
    setElapsedSeconds(frozenSeconds);
    const score = calculateFinalScore(completedQuests, firstTryCorrect, frozenSeconds);
    setEndgameStats({
      score,
      completedQuests,
      firstTryCorrect,
      totalAttempts,
      elapsedSeconds: frozenSeconds,
      stars: calculateStars(score),
    });
    beginVictoryMusic();
    setEndgamePhase('cutscene');
  }, [
    allQuestsDone,
    completedQuests,
    firstTryCorrect,
    totalAttempts,
    startTime,
    beginVictoryMusic,
  ]);

  useEffect(() => {
    if (isCertified && !certModalDismissed) {
      setShowCertificationModal(true);
      if (!ratUnlockBompPlayedRef.current) {
        ratUnlockBompPlayedRef.current = true;
        playRatUnlockBomp();
      }
    }
  }, [isCertified, certModalDismissed, playRatUnlockBomp]);

  /** NPC 小範圍漫遊；對話或答題時暫停 */
  useEffect(() => {
    if (npcWanderPaused) return;

    let timeoutId = 0;
    let cancelled = false;

    const schedule = () => {
      timeoutId = window.setTimeout(() => {
        if (cancelled) return;
        setNpcPositions((prev) => computeNpcWanderTick(prev, playerPos));
        schedule();
      }, pickNpcWanderIntervalMs());
    };

    schedule();
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [npcWanderPaused, playerPos]);

  /** 任務鼠微步漫遊（出生點半徑 1 格）；玩家靠近或 UI 開啟時暫停 */
  useEffect(() => {
    if (ratWanderPaused) return;

    let timeoutId = 0;
    let cancelled = false;

    const schedule = () => {
      timeoutId = window.setTimeout(() => {
        if (cancelled) return;
        setRatPositions((prev) =>
          computeRatWanderTick(prev, playerPos, npcPositions, completedQuestIds),
        );
        schedule();
      }, pickRatWanderIntervalMs());
    };

    schedule();
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [ratWanderPaused, playerPos, npcPositions, completedQuestIds]);

  /** 移動觸發：尋寶優先，實戰期才觸發老鼠任務 */
  useEffect(() => {
    if (
      showQuiz ||
      activeNpc ||
      showTreasureDialog ||
      showRatTauntDialog ||
      showQuestLockDialog ||
      endgamePhase !== null ||
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

  }, [
    playerPos,
    collectedTreasureIds,
    showQuiz,
    activeNpc,
    showTreasureDialog,
    showRatTauntDialog,
    showQuestLockDialog,
    endgamePhase,
    bossGateMode,
    showCertificationModal,
    certModalDismissed,
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
        if (!canMoveTo(newX, newY, npcPositions, completedQuestIds, ratPositions))
          return prev;

        const nextPos = { x: newX, y: newY };
        setNpcPositions((npcPos) =>
          nudgeNpcsOffCell(npcPos, newX, newY, nextPos),
        );
        return nextPos;
      });
    },
    [movementBlocked, npcPositions, completedQuestIds, ratPositions],
  );

  const dismissCertificationModal = useCallback(() => {
    logRatQuest('dismissCertificationModal → 進入實戰期');
    setCertModalDismissed(true);
    setShowCertificationModal(false);
    setGamePhase('combat');
    setRatsVisible(true);
    setShowRatBurst(true);
    window.setTimeout(() => setShowRatBurst(false), 2200);
  }, []);

  /** 已認證後確保可進入抓鼠任務（修復 ratsVisible / gamePhase 未同步） */
  const ensureCombatReady = useCallback(() => {
    if (!isCertified || !certModalDismissed) return false;
    if (gamePhase !== 'combat') {
      logRatQuest('ensureCombatReady: 修正 gamePhase → combat');
      setGamePhase('combat');
    }
    if (!ratsVisible) {
      logRatQuest('ensureCombatReady: 修正 ratsVisible → true');
      setRatsVisible(true);
    }
    return true;
  }, [isCertified, certModalDismissed, gamePhase, ratsVisible]);

  const showQuestSystemMessage = useCallback((text: string) => {
    setQuestSystemDialog({ title: '系統提示', text });
  }, []);

  const showInteractionToast = useCallback((message: string) => {
    window.clearTimeout(interactionToastTimerRef.current);
    setInteractionToast(message);
    interactionToastTimerRef.current = window.setTimeout(() => {
      setInteractionToast(null);
    }, 2200);
  }, []);

  const showLearningRatTaunt = useCallback(() => {
    setShowQuiz(false);
    setActiveQuestion(null);
    setActiveQuestionId(null);
    setBossGateMode(null);
    setRatTauntMessage(generateLearningRatTaunt(talkedToNPCs));
    setShowRatTauntDialog(true);
    playSfx('laugh');
  }, [talkedToNPCs, playSfx]);

  const interactWithNpc = useCallback(() => {
    if (showQuiz || activeNpc) return;

    const nearbyId = getNearbyNpc(playerPos, npcPositions);
    if (!nearbyId) return;

    const nearby = NPCS.find((n) => n.id === nearbyId);
    if (!nearby) return;

    const { positions: facedPositions, playerFacing } = applyDialogueFacing(
      playerPos,
      nearbyId,
      npcPositions,
    );
    setNpcPositions(facedPositions);
    setPlayerDirection(playerFacing);

    setActiveNpc(nearby);
    setNpcLineIndex(0);
    setNpcClueMode(seekingNpc === nearbyId);
  }, [showQuiz, activeNpc, playerPos, seekingNpc, npcPositions]);

  const openQuestQuiz = useCallback((question: QuestQuestion) => {
    if (!isValidQuestQuestion(question)) {
      logRatQuest('openQuestQuiz 失敗：題目資料不完整', question);
      setShowQuiz(false);
      setActiveQuestion(null);
      setActiveQuestionId(null);
      showQuestSystemMessage(
        `任務 #${question?.id ?? '?'} 的題目資料載入失敗，請重新整理頁面後再試。`,
      );
      return false;
    }
    logRatQuest('openQuestQuiz 成功', { questionId: question.id });
    setShowRatTauntDialog(false);
    setActiveQuestion(question);
    setActiveQuestionId(question.id);
    setQuestAttempted(false);
    setShowQuiz(true);
    return true;
  }, [showQuestSystemMessage]);

  /** 已解析題目後的任務流程（避免點擊後二次 find 失敗） */
  const beginRatQuestFromResolved = useCallback(
    (resolved: ResolvedRatQuest) => {
      const { point, question } = resolved;
      logRatQuest('beginRatQuestFromResolved', { point, playerPos });

      setPlayerDirection(
        resolvePlayerFacingTowardRat(
          playerPos.x,
          playerPos.y,
          point.x,
          point.y,
        ),
      );

      if (showQuiz || activeNpc || endgamePhase) {
        logRatQuest('阻擋：已有問答／NPC／結局');
        return;
      }

      if (needsNpcLearning) {
        logRatQuest('學習期 → 僅嘲諷對話', { questId: point.questionId });
        showLearningRatTaunt();
        return;
      }

      if (!isCertified) {
        showQuestSystemMessage(
          '請先與餐廳大廚、鎮守醫師、清潔隊長三位專家對話學習！',
        );
        return;
      }

      if (!certModalDismissed) {
        showQuestSystemMessage(
          '請先關閉「知識裝備完成」畫面（按空白鍵），再出發抓老鼠！',
        );
        return;
      }

      ensureCombatReady();

      if (lockedQuestId === point.questionId) {
        const uncapturedCount = QUEST_POINTS.filter(
          (p) => !completedQuestIds.has(p.questionId),
        ).length;
        if (uncapturedCount > 1) {
          setShowQuestLockDialog(true);
          return;
        }
      }

      const isBossQuest =
        point.questionId === 10 && completedQuestIds.size >= 9;
      if (isBossQuest) {
        if (!hasFullBossKit(inventory)) {
          setBossBlockedMessage(
            generateBossBlockedTaunt(inventory, collectedTreasureIds),
          );
          setBossGateMode('blocked');
          return;
        }
        setActiveQuestion(question);
        setActiveQuestionId(point.questionId);
        setQuestAttempted(false);
        setBossGateMode('ready');
        return;
      }

      openQuestQuiz(question);
    },
    [
      showQuiz,
      activeNpc,
      endgamePhase,
      playerPos,
      needsNpcLearning,
      isCertified,
      certModalDismissed,
      showLearningRatTaunt,
      showQuestSystemMessage,
      ensureCombatReady,
      lockedQuestId,
      completedQuestIds,
      inventory,
      collectedTreasureIds,
      openQuestQuiz,
    ],
  );

  /**
   * 空白鍵：先 resolve 單一目標，再進入任務流程
   */
  const beginRatQuest = useCallback(
    (targetPoint: QuestPoint) => {
      const normalized = normalizeQuestPoint(targetPoint);
      const resolved = resolveRatQuestTarget(
        normalized,
        completedQuestIds,
        ratPositions,
      );
      if (!resolved) {
        console.error('[RatQuest] 找不到完整的題目資料', normalized);
        showQuestSystemMessage('找不到目標老鼠，請移動一步後再試一次！');
        return;
      }
      beginRatQuestFromResolved(resolved);
    },
    [
      completedQuestIds,
      ratPositions,
      showQuestSystemMessage,
      beginRatQuestFromResolved,
    ],
  );

  /** 空白鍵：學習期 NPC 優先；實戰期（已完 3 位 NPC）老鼠優先 */
  const handleInteract = useCallback(() => {
    if (showQuiz || activeNpc || endgamePhase) return;

    const targetQuest = findNearestInteractableQuest(
      playerPos,
      completedQuestIds,
      ratPositions,
    );
    const nearbyNpc = getNearbyNpc(playerPos, npcPositions);

    if (isCertified) {
      if (targetQuest) {
        logRatQuest('handleInteract → 單一老鼠（實戰優先）', targetQuest);
        beginRatQuest(targetQuest);
        return;
      }
      if (nearbyNpc) {
        logRatQuest('handleInteract → NPC（實戰、僅相鄰）', nearbyNpc);
        interactWithNpc();
        return;
      }
    } else {
      if (nearbyNpc) {
        logRatQuest('handleInteract → NPC（學習期優先）', nearbyNpc);
        interactWithNpc();
        return;
      }
      if (targetQuest) {
        logRatQuest('handleInteract → 單一老鼠（學習期）', targetQuest);
        beginRatQuest(targetQuest);
        return;
      }
    }

    logRatQuest('handleInteract：範圍內無 NPC 或老鼠');
  }, [
    showQuiz,
    activeNpc,
    endgamePhase,
    playerPos,
    npcPositions,
    completedQuestIds,
    ratPositions,
    isCertified,
    interactWithNpc,
    beginRatQuest,
  ]);

  /** 滑鼠點擊：直接帶入被點老鼠的 quest，不再從陣列 find */
  const handleRatClick = useCallback(
    (clickedQuest: QuestPoint) => {
      const quest = normalizeQuestPoint(clickedQuest);
      logRatQuest('handleRatClick', { quest, playerPos });

      if (showCertificationModal && !certModalDismissed) {
        showQuestSystemMessage(
          '請先關閉「知識裝備完成」畫面（按空白鍵），再點擊老鼠！',
        );
        return;
      }

      if (
        uiBlocked &&
        !showRatTauntDialog &&
        !showQuestLockDialog &&
        !bossGateMode
      ) {
        return;
      }

      const resolved = resolveRatQuestTarget(
        quest,
        completedQuestIds,
        ratPositions,
      );
      const livePoint = resolved?.point ?? quest;

      if (!isWithinRatInteractionRange(playerPos, livePoint)) {
        showInteractionToast('太遠了，請靠近一點！');
        return;
      }

      if (!resolved) {
        console.error('[RatQuest] 點擊但題目資料不完整', quest);
        showQuestSystemMessage('找不到目標老鼠，請移動一步後再試一次！');
        return;
      }

      beginRatQuestFromResolved(resolved);
    },
    [
      playerPos,
      completedQuestIds,
      ratPositions,
      beginRatQuestFromResolved,
      showInteractionToast,
      uiBlocked,
      showCertificationModal,
      certModalDismissed,
      showRatTauntDialog,
      showQuestLockDialog,
      bossGateMode,
      showQuestSystemMessage,
    ],
  );

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

      if (showQuestLockDialog) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          setShowQuestLockDialog(false);
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
          handleInteract();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    movePlayer,
    handleInteract,
    playerPos,
    npcPositions,
    showQuiz,
    activeNpc,
    showTreasureDialog,
    showCertificationModal,
    certModalDismissed,
    dismissCertificationModal,
    dismissTreasureDialog,
    showRatTauntDialog,
    showQuestLockDialog,
    bossGateMode,
    dismissBossGateReady,
    dismissBossGateBlocked,
  ]);

  const triggerBadgeBurst = useCallback(() => {
    setShowBadgeBurst(true);
    const t = setTimeout(() => setShowBadgeBurst(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const handleQuestAnswer = useCallback(
    (selectedIndex: number): QuestAnswerOutcome => {
      if (!activeQuestion) {
        return { kind: 'retry', message: '答錯了！請再想一想，再試一次！' };
      }

      const questId = activeQuestion.id;
      setTotalAttempts((a) => a + 1);

      if (selectedIndex === activeQuestion.correctAnswer) {
        playSfx('success');
        setFailedAttempts((prev) => {
          const next = { ...prev };
          delete next[questId];
          return next;
        });
        return { kind: 'correct' };
      }

      playSfx('fail');
      if (!questAttempted) setQuestAttempted(true);

      const priorFails = failedAttempts[questId] ?? 0;
      if (priorFails === 0) {
        setFailedAttempts((prev) => ({ ...prev, [questId]: 1 }));
        return { kind: 'retry', message: '答錯了！請再想一想，再試一次！' };
      }

      const correctText = activeQuestion.options[activeQuestion.correctAnswer];
      setFailedAttempts((prev) => ({ ...prev, [questId]: 2 }));
      setLockedQuestId(questId);
      return {
        kind: 'locked',
        message: `又答錯囉！這題的正確答案是：${correctText}`,
      };
    },
    [activeQuestion, failedAttempts, questAttempted, playSfx],
  );

  const handleQuestCorrect = useCallback(() => {
    if (activeQuestionId === null) return;

    const capturedId = activeQuestionId;
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
    setActiveQuestion(null);
    setActiveQuestionId(null);

    setLockedQuestId((locked) => {
      if (locked !== null) {
        setFailedAttempts((prev) => {
          const next = { ...prev };
          delete next[locked];
          return next;
        });
      }
      return null;
    });

    setFailedAttempts((prev) => {
      const next = { ...prev };
      delete next[capturedId];
      return next;
    });

    setTimeout(() => setLastCapturedQuestId(null), 700);
  }, [activeQuestionId, questAttempted, triggerBadgeBurst]);

  const handleQuestDismissLocked = useCallback(() => {
    setShowQuiz(false);
    setActiveQuestion(null);
    setActiveQuestionId(null);
    setQuestAttempted(false);
  }, []);

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
    needsNpcLearning
      ? adjacentQuestPoint
        ? `按空白鍵聽老鼠嘲諷你！先找 3 位專家學習（${npcProgress}/3）`
        : `探索地圖，找 3 位專家按空白鍵學習（${npcProgress}/3）— 靠近老鼠也可按空白鍵互動`
      : isCertified && !certModalDismissed
        ? '知識裝備完成！請按空白鍵關閉證書視窗，出發抓老鼠！'
        : isCertified && !ratsVisible
          ? '變異老鼠正在出沒…'
          : lockedQuestId !== null
        ? '這隻老鼠太狡猾了！請先去小鎮其他地方抓別隻老鼠，晚點再回來對付牠吧！'
        : adjacentQuestPoint
          ? `按空白鍵抓住身旁的變異老鼠！（防疫任務 ${adjacentQuestPoint.questionId}／剩餘 ${remainingQuests} 個）`
          : adjacentNpcName
            ? `按空白鍵與【${adjacentNpcName}】對話（僅相鄰時）`
            : `靠近地圖上的老鼠後按空白鍵觸發任務（剩餘 ${remainingQuests} 個）— 尋寶收集三種防疫道具！`;

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
          playerName={playerName}
          playerDirection={playerDirection}
          npcPositions={npcPositions}
          seekingNpc={seekingNpc}
          completedQuestIds={completedQuestIds}
          ratPositions={ratPositions}
          questRatsVisible={questRatsOnMap}
          ratsBurst={showRatBurst}
          collectedTreasureIds={collectedTreasureIds}
          radarTarget={radarTarget}
          highlightQuestId={highlightQuestId}
          freezeEntityFacing={!!activeNpc || showQuiz}
          onQuestRatClick={handleRatClick}
        />

        {!uiBlocked && (
          <div
            className="absolute bottom-0 left-0 right-0 z-[90] pointer-events-none
              p-2 pb-3 bg-linear-to-t from-black/50 via-black/25 to-transparent"
          >
            <div className="max-w-4xl mx-auto pointer-events-auto">
              <div className="flex items-center gap-1.5 text-[10px] text-white/90 px-1 drop-shadow">
                <HelpCircle size={12} className="shrink-0" />
                <span>{interactionToast ?? radarToast ?? hintText}</span>
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
          <RatTauntDialog
            key="rat-taunt"
            message={ratTauntMessage}
            onClose={() => setShowRatTauntDialog(false)}
          />
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
                <RatSprite
                  variant="boss"
                  direction="down"
                  animateWalk={false}
                  className="!animate-none drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]"
                />
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
                <RatSprite
                  variant="boss"
                  direction="down"
                  animateWalk={false}
                  className="!animate-none opacity-80"
                />
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
        {questSystemDialog && (
          <RpgDialogBox
            key="quest-system"
            speakerName={questSystemDialog.title}
            onClick={() => setQuestSystemDialog(null)}
            footer={<RpgContinueHint />}
          >
            <p className="text-amber-100 text-sm sm:text-base leading-relaxed font-medium">
              {questSystemDialog.text}
            </p>
          </RpgDialogBox>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showQuestLockDialog && (
          <RpgDialogBox
            key="quest-lock"
            speakerName="變異老鼠"
            speakerBadge={
              <span className="text-[10px] bg-stone-600/50 text-stone-200 px-2 py-0.5 rounded border border-stone-400/70 font-bold">
                暫時逃脫
              </span>
            }
            portrait={
              <div className="w-full h-full flex items-center justify-center scale-125">
                <RatSprite
                  variant="muted"
                  direction="down"
                  animateWalk={false}
                  className="!animate-none drop-shadow-lg"
                />
              </div>
            }
            onClick={() => setShowQuestLockDialog(false)}
            footer={<RpgContinueHint />}
          >
            <p className="text-amber-100 text-sm sm:text-base leading-relaxed font-medium">
              這隻老鼠太狡猾了！請先去小鎮其他地方抓別隻老鼠，晚點再回來對付牠吧！
            </p>
          </RpgDialogBox>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showQuiz && activeQuestion ? (
          <QuestQuizDialog
            key={activeQuestion.id}
            question={activeQuestion}
            questNumber={activeQuestion.id}
            portraitSrc={getPlayerPortraitPath(characterId)}
            portraitFallback={getPlayerPortraitFallback(characterId)}
            portraitAlt={PLAYER_ROLE}
            onAnswer={handleQuestAnswer}
            onCompleteCorrect={handleQuestCorrect}
            onDismissLocked={handleQuestDismissLocked}
          />
        ) : null}
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

      <AnimatePresence>
        {endgamePhase === 'cutscene' && (
          <VictoryCutscene
            key="victory-cutscene"
            onComplete={() => setEndgamePhase('certificate')}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {endgamePhase === 'certificate' && endgameStats && (
          <HonorCertificate
            key="honor-certificate"
            userInfo={userInfo}
            stats={endgameStats}
            preventionScore={preventionScore}
            onPlayAgain={() => {
              stopVictoryMusic();
              onPlayAgain();
            }}
            onExitHome={() => {
              stopVictoryMusic();
              onExitHome();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
