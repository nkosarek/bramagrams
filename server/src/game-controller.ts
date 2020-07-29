import { GameState, Player, PlayerWord, GameStatuses, PlayerStatuses } from './models';
import Dictionary from './dictionary';

const TILES = ['d', 'i', 's', 'h', 'w', 'a', 's', 'h', 'e', 'r'];
let TILES_IDX = 0;

const newTile = (): string => {
  if (TILES_IDX < TILES.length) {
    return TILES[TILES_IDX++].toUpperCase();
  }
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

  private getWordDiff(word1: string, word2: string): string | null {
    if (word1.length < word2.length) {
      return null;
    }
    let wordDiff: string = word1;
    for (let i = 0; i < word2.length; ++i) {
      const char = word2.charAt(i);
      if (!wordDiff.includes(char)) {
        return null;
      }
      wordDiff = wordDiff.replace(char, '');
    }
    return wordDiff;
  }

  private getNewTilePool(
    game: GameState,
    newWord: string,
    wordsToSteal: PlayerWord[]
  ): string[] | undefined {
    let newWordRemainder: string | null = newWord;
    for (const playerWord of wordsToSteal) {
      const word = game.players[playerWord.playerIdx]?.words[playerWord.wordIdx];
      // There must be at least one tile from the pool used to create the new word
      if (!word || word.length >= newWordRemainder.length) {
        return;
      }
      newWordRemainder = this.getWordDiff(newWordRemainder, word);
      if (newWordRemainder == null) {
        return;
      }
    }

    const poolRemainder: string[] = [...game.tiles];
    for (let i = 0; i < newWordRemainder.length; ++i) {
      const poolIdx = poolRemainder.indexOf(newWordRemainder.charAt(i));
      if (poolIdx < 0) {
        return;
      }
      poolRemainder.splice(poolIdx, 1);
    }
    return poolRemainder;
  }

  gameExists(gameId: string) {
    return !!this.games[gameId];
  }

  getGame(gameId: string) {
    const game = this.games[gameId];
    if (!game) {
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

  claimWord(
    gameId: string,
    playerName: string,
    newWord: string,
    wordsToSteal?: PlayerWord[]
  ): GameState | undefined {
    const game = this.getGame(gameId);
    const player = this.getPlayer(game, playerName);
    if (!player || !newWord || newWord.length < 3) {
      return;
    }
    const newPool = this.getNewTilePool(game, newWord, wordsToSteal || []);
    if (!newPool) {
      return;
    }
    if (!Dictionary.isValidWord(newWord)) {
      return;
    }
    game.tiles = newPool;
    wordsToSteal?.forEach(playerWord =>
      game.players[playerWord.playerIdx]?.words.splice(playerWord.wordIdx, 1))
    player.words.push(newWord);
    return game;
  }
}
