export interface GamesMap {
  [id: string]: GameState,
};

export class GameState {
  constructor(public id: string) {}
};
