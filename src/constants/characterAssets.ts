import type { TargetNPC } from './gameData';

/** RPG Maker 角色圖：PNG 放在 public/characters/ */
export const ACTOR_FILES = {
  player1: { portrait: 'Actor1_1.png', sprite: 'Actor1_1_1.png' },
  player2: { portrait: 'Actor1_2.png', sprite: 'Actor1_2_1.png' },
  npcChef: { portrait: 'Actor1_5.png', sprite: 'Actor1_5_1.png' },
  npcDoctor: { portrait: 'Actor1_6.png', sprite: 'Actor1_6_1.png' },
  npcCaptain: { portrait: 'Actor1_8.png', sprite: 'Actor1_8_1.png' },
} as const;

export type SpriteDirection = 'down' | 'left' | 'right' | 'up';
export type PlayerCharacterId = 'actor1' | 'actor2';

/** 4 欄 × 2 列（RPG Maker 標準行走圖） */
export const SPRITE_SHEET_COLS = 4;
export const SPRITE_SHEET_ROWS = 2;

const char = (file: string) => `/characters/${file}`;

export const DEFAULT_PLAYER_PORTRAIT = char(ACTOR_FILES.player1.portrait);
export const DEFAULT_PLAYER_SPRITE = char(ACTOR_FILES.player1.sprite);

/** @deprecated 請改用 getPlayerPortraitPath */
export const DEFAULT_PLAYER_IMAGE = DEFAULT_PLAYER_PORTRAIT;

const PLAYER_PORTRAIT_PATHS: Record<PlayerCharacterId, string> = {
  actor1: char(ACTOR_FILES.player1.portrait),
  actor2: char(ACTOR_FILES.player2.portrait),
};

const PLAYER_SPRITE_PATHS: Record<PlayerCharacterId, string> = {
  actor1: char(ACTOR_FILES.player1.sprite),
  actor2: char(ACTOR_FILES.player2.sprite),
};

/** @deprecated 請改用 getPlayerPortraitPath */
export const PLAYER_IMAGE_PATHS: Record<string, string> = PLAYER_PORTRAIT_PATHS;

const NPC_PORTRAIT_FILES: Record<TargetNPC, string> = {
  Chef: ACTOR_FILES.npcChef.portrait,
  Doctor: ACTOR_FILES.npcDoctor.portrait,
  Captain: ACTOR_FILES.npcCaptain.portrait,
};

const NPC_SPRITE_FILES: Record<TargetNPC, string> = {
  Chef: ACTOR_FILES.npcChef.sprite,
  Doctor: ACTOR_FILES.npcDoctor.sprite,
  Captain: ACTOR_FILES.npcCaptain.sprite,
};

/** 對話框大頭照 */
export const NPC_PORTRAIT_PATHS: Record<TargetNPC, string> = {
  Chef: char(NPC_PORTRAIT_FILES.Chef),
  Doctor: char(NPC_PORTRAIT_FILES.Doctor),
  Captain: char(NPC_PORTRAIT_FILES.Captain),
};

/** 地圖行走圖（4×2 方向小圖） */
export const NPC_SPRITE_PATHS: Record<TargetNPC, string> = {
  Chef: char(NPC_SPRITE_FILES.Chef),
  Doctor: char(NPC_SPRITE_FILES.Doctor),
  Captain: char(NPC_SPRITE_FILES.Captain),
};

/** @deprecated 請改用 getNpcPortraitPath / getNpcSpritePath */
export const NPC_IMAGE_PATHS: Record<TargetNPC, string> = NPC_PORTRAIT_PATHS;

export const NPC_PORTRAIT_FALLBACKS = NPC_PORTRAIT_PATHS;
export const NPC_SPRITE_FALLBACKS = NPC_SPRITE_PATHS;
export const NPC_IMAGE_FALLBACKS = NPC_PORTRAIT_FALLBACKS;

export const PLAYER_PORTRAIT_FALLBACKS: Record<PlayerCharacterId | 'default', string> = {
  actor1: char(ACTOR_FILES.player1.portrait),
  actor2: char(ACTOR_FILES.player2.portrait),
  default: char(ACTOR_FILES.player1.portrait),
};

export const PLAYER_SPRITE_FALLBACKS: Record<PlayerCharacterId | 'default', string> = {
  actor1: char(ACTOR_FILES.player1.sprite),
  actor2: char(ACTOR_FILES.player2.sprite),
  default: char(ACTOR_FILES.player1.sprite),
};

/** @deprecated 請改用 getPlayerPortraitFallback */
export const PLAYER_IMAGE_FALLBACKS = PLAYER_PORTRAIT_FALLBACKS;

/** NPC 無玩家互動時的預設朝向（依地圖站位） */
export const NPC_DEFAULT_FACING: Record<TargetNPC, SpriteDirection> = {
  Chef: 'down',
  Doctor: 'down',
  Captain: 'left',
};

export const SPRITE_IMG_CLASS =
  'w-full h-full object-contain drop-shadow-md pointer-events-none';

/** 玩家選角（Actor1_1 / Actor1_2） */
export const PLAYER_CHARACTERS: {
  id: PlayerCharacterId;
  name: string;
  shortTitle: string;
  portrait: string;
  color: string;
  accentClass: string;
  description: string;
}[] = [
  {
    id: 'actor1',
    name: '環境稽查員',
    shortTitle: '環境稽查',
    portrait: char(ACTOR_FILES.player1.portrait),
    color: '#3b82f6',
    accentClass: 'from-sky-100 to-blue-200',
    description: '眼尖手快，專門揪出廚房與倉庫的衛生死角！',
  },
  {
    id: 'actor2',
    name: '防疫稽查員',
    shortTitle: '防疫稽查',
    portrait: char(ACTOR_FILES.player2.portrait),
    color: '#f59e0b',
    accentClass: 'from-amber-100 to-orange-200',
    description: '熟讀漢他病毒衛教手冊，是小鎮的防疫智囊。',
  },
];

export function resolvePlayerActorKey(characterId: PlayerCharacterId | string): string {
  if (characterId === 'actor1' || characterId === 'actor2') return characterId;
  return PLAYER_CHARACTERS.find((c) => c.id === characterId)?.id ?? 'actor1';
}

export function getPlayerCharacter(characterId: PlayerCharacterId | string) {
  return PLAYER_CHARACTERS.find((c) => c.id === characterId) ?? PLAYER_CHARACTERS[0];
}

/** 地圖姓名標籤：超過 4 字截斷並加省略號 */
export function truncatePlayerName(name: string, maxLength = 4): string {
  const trimmed = name.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength)}...`;
}

export function getPlayerCharacterShortTitle(characterId: PlayerCharacterId | string): string {
  return getPlayerCharacter(characterId).shortTitle;
}

/** 地圖姓名標籤格式：{簡化姓名}・{角色簡稱} */
export function formatPlayerNameTag(
  playerName: string,
  characterId: PlayerCharacterId | string,
): string {
  return `${truncatePlayerName(playerName)}・${getPlayerCharacterShortTitle(characterId)}`;
}

/** 對話框用大圖（Actor1_1 / Actor1_2） */
export function getPlayerPortraitPath(characterId: string): string {
  const actorKey = resolvePlayerActorKey(characterId) as PlayerCharacterId;
  return PLAYER_PORTRAIT_PATHS[actorKey] ?? DEFAULT_PLAYER_PORTRAIT;
}

/** 地圖行走用小圖（Actor1_1_1 / Actor1_2_1，4 方向） */
export function getPlayerSpritePath(characterId: string): string {
  const actorKey = resolvePlayerActorKey(characterId) as PlayerCharacterId;
  return PLAYER_SPRITE_PATHS[actorKey] ?? DEFAULT_PLAYER_SPRITE;
}

/** @deprecated 請改用 getPlayerPortraitPath */
export function getPlayerImagePath(characterId: string): string {
  return getPlayerPortraitPath(characterId);
}

export function getPlayerPortraitFallback(characterId: string): string {
  const actorKey = resolvePlayerActorKey(characterId) as PlayerCharacterId;
  return PLAYER_PORTRAIT_FALLBACKS[actorKey] ?? PLAYER_PORTRAIT_FALLBACKS.default;
}

export function getPlayerSpriteFallback(characterId: string): string {
  const actorKey = resolvePlayerActorKey(characterId) as PlayerCharacterId;
  return PLAYER_SPRITE_FALLBACKS[actorKey] ?? PLAYER_SPRITE_FALLBACKS.default;
}

/** @deprecated 請改用 getPlayerPortraitFallback */
export function getPlayerImageFallback(characterId: string): string {
  return getPlayerPortraitFallback(characterId);
}

/** 對話框用大圖 */
export function getNpcPortraitPath(npcId: TargetNPC): string {
  return NPC_PORTRAIT_PATHS[npcId];
}

/** 地圖用小圖（sprite sheet） */
export function getNpcSpritePath(npcId: TargetNPC): string {
  return NPC_SPRITE_PATHS[npcId];
}

/** @deprecated 同 getNpcPortraitPath */
export function getNpcImagePath(npcId: TargetNPC): string {
  return getNpcPortraitPath(npcId);
}

export function getNpcPortraitFallback(npcId: TargetNPC): string {
  return NPC_PORTRAIT_FALLBACKS[npcId];
}

export function getNpcSpriteFallback(npcId: TargetNPC): string {
  return NPC_SPRITE_FALLBACKS[npcId];
}

/** @deprecated 同 getNpcPortraitFallback */
export function getNpcImageFallback(npcId: TargetNPC): string {
  return getNpcPortraitFallback(npcId);
}

/** 依 4×2 行走圖計算 background-position（down=col0, left=1, right=2, up=3） */
export function getSpriteSheetBackgroundPosition(
  direction: SpriteDirection,
  frame: 0 | 1 = 0,
): string {
  const col = { down: 0, left: 1, right: 2, up: 3 }[direction];
  const xPct = SPRITE_SHEET_COLS > 1 ? (col / (SPRITE_SHEET_COLS - 1)) * 100 : 0;
  const yPct = SPRITE_SHEET_ROWS > 1 ? (frame / (SPRITE_SHEET_ROWS - 1)) * 100 : 0;
  return `${xPct}% ${yPct}%`;
}

export function getSpriteSheetBackgroundSize(): string {
  return `${SPRITE_SHEET_COLS * 100}% ${SPRITE_SHEET_ROWS * 100}%`;
}

/** 依玩家相對位置決定 NPC 面向 */
export function resolveNpcFacing(
  npcX: number,
  npcY: number,
  playerX: number,
  playerY: number,
  npcId: TargetNPC,
): SpriteDirection {
  const dx = playerX - npcX;
  const dy = playerY - npcY;

  if (dx === 0 && dy === 0) return NPC_DEFAULT_FACING[npcId];

  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 'right' : 'left';
  }
  if (Math.abs(dy) > Math.abs(dx)) {
    return dy > 0 ? 'down' : 'up';
  }

  return dx > 0 ? 'right' : 'left';
}
