import {
  defaultStartingTiles,
  fewerStartingTiles,
  moreStartingTiles,
} from "@/shared/tiles";
import { keysSameAsValuesCheck } from "@/shared/utils/keysSameAsValuesCheck";

export const MAX_PLAYERS = 4;

export const MIN_ENDGAME_TIMEOUT_SECONDS = 10;
export const MAX_ENDGAME_TIMEOUT_SECONDS = 120;

export const NUM_STARTING_TILE_OPTIONS = [
  fewerStartingTiles.length,
  defaultStartingTiles.length,
  moreStartingTiles.length,
] as const;

export const ClientEvents = keysSameAsValuesCheck({
  CONNECT_TO_GAME: "CONNECT_TO_GAME",
  JOIN_GAME: "JOIN_GAME",
  CHANGE_NAME: "CHANGE_NAME",
  BECOME_SPECTATOR: "BECOME_SPECTATOR",
  BECOME_PLAYER: "BECOME_PLAYER",
  UPDATE_GAME_CONFIG: "UPDATE_GAME_CONFIG",
  RESET_GAME_CONFIG: "RESET_GAME_CONFIG",
  START_GAME: "START_GAME",
  ADD_TILE: "ADD_TILE",
  CLAIM_WORD: "CLAIM_WORD",
  READY_TO_END: "READY_TO_END",
  NOT_READY_TO_END: "NOT_READY_TO_END",
  REMATCH: "REMATCH",
  BACK_TO_LOBBY: "BACK_TO_LOBBY",
} as const);

export const ServerEvents = keysSameAsValuesCheck({
  GAME_DNE: "GAME_DNE",
  GAME_UPDATED: "GAME_UPDATED",
  NAME_CLAIMED: "NAME_CLAIMED",
  WORD_CLAIMED: "WORD_CLAIMED",
} as const);

export interface PlayerWord {
  playerIdx: number;
  wordIdx: number;
}

export interface PlayerInGameInLobby {
  name: string;
  status: "PLAYING" | "SPECTATING";
}

export interface PlayerInGameInProgress {
  name: string;
  status: "PLAYING" | "READY_TO_END" | "SPECTATING";
  words: Array<string>;
}

export interface PlayerInGameEnded {
  name: string;
  status: "ENDED" | "SPECTATING";
  words: Array<string>;
}

export interface GameStateInLobby {
  status: "IN_LOBBY";
  gameConfig: GameConfig;
  players: Array<PlayerInGameInLobby>;
}

export interface GameStateInProgress {
  status: "IN_PROGRESS";
  gameConfig: GameConfig;
  players: Array<PlayerInGameInProgress>;
  currPlayerIdx: number;
  tiles: Array<string>;
  numTilesLeft: number;
  endgameTimeoutTime: string | null;
}

export interface GameStateEnded {
  status: "ENDED";
  gameConfig: GameConfig;
  players: Array<PlayerInGameEnded>;
  tiles: Array<string>;
}

export type GameState = GameStateInLobby | GameStateInProgress | GameStateEnded;

export interface GameConfig {
  isPublic: boolean;
  numStartingTiles: (typeof NUM_STARTING_TILE_OPTIONS)[number];
  validTypedWordFeedback: boolean;
  endgameTimeoutSeconds: number;
}
