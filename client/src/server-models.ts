// TODO: import this instead of copying it
export enum ClientEvents {
  CONNECT_TO_GAME = 'connectToGame',
  JOIN_GAME = 'joinGame',
  CHANGE_NAME = 'changeName',
  READY_TO_START = 'readyToStart',
  NOT_READY_TO_START = 'notReadyToStart',
  START_GAME = 'startGame',
  ADD_TILE = 'addTile',
  CLAIM_WORD = 'claimWord',
  READY_TO_END = 'readyToEnd',
  NOT_READY_TO_END = 'notReadyToEnd',
}

export enum ServerEvents {
  GAME_DNE = 'gameDNE',
  GAME_UPDATED = 'gameUpdated',
  NAME_CLAIMED = 'nameClaimed',
  WORD_CLAIMED = 'wordClaimed',
}

export enum PlayerStatuses {
  NOT_READY_TO_START,
  READY_TO_START,
  PLAYING,
  READY_TO_END,
  ENDED,
  SPECTATING,
  DISCONNECTED,
}

export enum GameStatuses {
  WAITING_TO_START,
  IN_PROGRESS,
  ENDED,
}

export interface PlayerWord {
  playerIdx: number;
  wordIdx: number;
}

export interface Player {
  name: string;
  status: PlayerStatuses;
  words: string[];
}

export interface GameState {
  players: Player[];
  currPlayerIdx: number;
  status: GameStatuses;
  tiles: string[];
  numTilesLeft: number;
}
