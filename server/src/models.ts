export enum ClientEvents {
  JOIN_GAME = 'joinGame',
  READY_TO_START = 'readyToStart',
  START_GAME = 'startGame',
  ADD_TILE = 'addTile',
  CLAIM_WORD = 'claimWord',
}

export enum ServerEvents {
  GAME_DNE = 'gameDNE',
  GAME_UPDATED = 'gameUpdated',
}

export enum PlayerStatuses {
  NOT_READY,
  READY_TO_START,
  PLAYING,
  SPECTATING,
  DISCONNECTED,
}

export enum GameStatuses {
  WAITING_TO_START,
  IN_PROGRESS,
  ENDED,
}

export interface Player {
  name: string;
  status: PlayerStatuses;
  words: string[];
}

export interface GameState {
  players: { [name: string]: Player };
  currPlayer?: string;
  started: boolean;
  tiles: string[];
}

export interface GamesMap {
  [id: string]: GameState;
}
