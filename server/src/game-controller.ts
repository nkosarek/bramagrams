import { GameState, Player, GameStatuses, PlayerStatuses } from './models';

const newTile = (): string => {
  return String.fromCharCode(Math.random() * 26 + 65);
};

const generateGameId = () => {
  const min = 0x10000000;
  const max = 0x100000000;
  return (Math.floor(Math.random() * (max - min)) + min).toString(16);
};

export default class GamesController {
  private games: { [gameId: string]: GameState} = {};

  private getPlayer(game: GameState, name: string): Player | undefined {
    return game?.players.find(p => p.name === name);
  }

  private gameCanStart(game: GameState): boolean {
    return game.status === GameStatuses.WAITING_TO_START &&
      game.players.length > 1 &&
      game.players.every(player => player.status === PlayerStatuses.READY_TO_START);
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
      players: [],
      currPlayerIdx: 0,
      status: GameStatuses.WAITING_TO_START,
      tiles: [],
    };
    return id;
  }

  addPlayer(gameId: string, name: string): GameState | undefined {
    const game = this.getGame(gameId);
    if (!name || this.getPlayer(game, name) || game.players.length >= 2) {
      return;
    }
    // TODO: after multiple players supported, allow players to join mid game (different status)
    game.players.push({
      name,
      status: PlayerStatuses.NOT_READY,
      words: [],
    });
    return game;
  }

  renamePlayer(gameId: string, newName: string, oldName: string): GameState | undefined {
    const game = this.getGame(gameId);
    const player = this.getPlayer(game, oldName);
    if (!player || !newName) {
      return;
    }
    player.name = newName;
    return game;
  }

  setPlayerReady(gameId: string, name: string): GameState | undefined {
    const game = this.getGame(gameId);
    const player = this.getPlayer(game, name);
    if (!player) {
      return;
    }
    if (player.status === PlayerStatuses.NOT_READY) {
      player.status = PlayerStatuses.READY_TO_START;
      return game;
    }
  }

  startGame(gameId: string): GameState | undefined {
    const game = this.getGame(gameId);
    if (this.gameCanStart(game)) {
      game.status = GameStatuses.IN_PROGRESS;
      return game;
    }
  }

  addTile(gameId: string, playerName: string): GameState | undefined {
    const game = this.getGame(gameId);
    if (playerName === game.players[game.currPlayerIdx].name) {
      game.tiles.push(newTile());
      game.currPlayerIdx = (game.currPlayerIdx + 1) % game.players.length;
      return game;
    }
  }

  claimWord(gameId: string, playerName: string, word: string): GameState | undefined {
    const game = this.getGame(gameId);
    const player = this.getPlayer(game, playerName);
    if (!player || !word) {
      return;
    }
    const tiles = [...game.tiles];
    for (let i = 0; i < word.length; ++i) {
      const index = tiles.indexOf(word.charAt(i));
      if (index < 0) {
        return;
      }
      tiles.splice(index, 1);
    }
    game.tiles = tiles;
    player.words.push(word);
    return game;
  }
}
