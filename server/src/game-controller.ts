import { GameState, GameStatuses, PlayerStatuses } from './models';

const newTile = (): string => {
  return String.fromCharCode(Math.random() * 26 + 65);
};

const generateGameId = () => {
  const min = 0x10000000;
  const max = 0x100000000;
  return (Math.floor(Math.random() * (max - min)) + min).toString(16);
};

export default class GamesController {
  public games: { [gameId: string]: GameState} = {};

  private gameCanStart(game: GameState): boolean {
    const players = Object.values(game.players);
    return game.status === GameStatuses.WAITING_TO_START &&
      players.length > 1 &&
      players.every(player => player.status === PlayerStatuses.READY_TO_START);
  }

  gameExists(gameId: string) {
    return !!this.games[gameId];
  }

  getGame(gameId: string) {
    const game = this.games[gameId];
    if (!game) {
      // TODO: what to do here?
      throw 'Game does not exist';
    }
    return game;
  }

  createGame(): string {
    let id: string;
    let count: number = 0;
    do {
      if (++count > 5) {
        return "";
      }
      id = generateGameId();
    } while (this.games[id]);
    this.games[id] = {
      players: {},
      status: GameStatuses.WAITING_TO_START,
      tiles: [],
    };
    return id;
  }

  addPlayer(gameId: string, name: string): GameState {
    const game = this.getGame(gameId);
    game.players[name] = {
      name,
      status: PlayerStatuses.NOT_READY,
      words: [],
    };
    return game;
  }

  setPlayerReady(gameId: string, name: string): GameState | undefined {
    const game = this.getGame(gameId);
    const player = game.players[name];
    if (player.status === PlayerStatuses.NOT_READY) {
      player.status = PlayerStatuses.READY_TO_START;
      return game;
    }
  }

  startGame(gameId: string): GameState | undefined {
    const game = this.getGame(gameId);
    if (this.gameCanStart(game)) {
      game.status = GameStatuses.IN_PROGRESS;
      const playerNames = Object.keys(game.players);
      game.currPlayer = playerNames[0];
      return game;
    }
  }

  addTile(gameId: string, playerName: string): GameState | undefined {
    const game = this.getGame(gameId);
    // TODO: Advance currPlayer
    if (playerName === game.currPlayer) {
      game.tiles.push(newTile());
      return game;
    }
  }

  claimWord(gameId: string, playerName: string, word: string): GameState | undefined {
    const game = this.getGame(gameId);
    const tiles = [...game.tiles];
    for (let i = 0; i < word.length; ++i) {
      const index = tiles.indexOf(word.charAt(i));
      if (index < 0) {
        return;
      }
      tiles.splice(index, 1);
    }
    game.tiles = tiles;
    game.players[playerName].words.push(word);
    return game;
  }
}
