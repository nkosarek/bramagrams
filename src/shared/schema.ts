import {
  defaultStartingTiles,
  fewerStartingTiles,
  moreStartingTiles,
} from "@/shared/tiles";
import { keysSameAsValuesCheck } from "@/shared/utils/keysSameAsValuesCheck";

export const MAX_PLAYERS = 4;

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
  UPDATE_GAME_CONFIG: "UPDATE_GAME_CONFIG",
  RESET_GAME_CONFIG: "RESET_GAME_CONFIG",
  READY_TO_START: "READY_TO_START",
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

export type PlayerStatus =
  // TODO?: rename READY_TO_START -> WAITING_TO_START
  | "READY_TO_START"
  | "PLAYING"
  | "READY_TO_END"
  | "ENDED"
  | "SPECTATING"
  | "DISCONNECTED";

export type GameStatus = "WAITING_TO_START" | "IN_PROGRESS" | "ENDED";

export interface PlayerWord {
  playerIdx: number;
  wordIdx: number;
}

export interface Player {
  name: string;
  status: PlayerStatus;
  words: string[];
}

export interface GameState {
  players: Player[];
  currPlayerIdx: number;
  status: GameStatus;
  tiles: string[];
  numTilesLeft: number;
  timeoutTime: string | null;
  gameConfig: GameConfig;
}

export interface GameConfig {
  isPublic: boolean;
  numStartingTiles: (typeof NUM_STARTING_TILE_OPTIONS)[number];
  validTypedWordFeedback: boolean;
}
