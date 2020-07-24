import { GameState, Player, GameStatuses, PlayerStatuses } from './models';
import Dictionary from './dictionary';

const newTile = (): string => {
  return String.fromCharCode(Math.random() * 26 + 65);
};

const generateGameId = () => {
  const min = 0x10000000;
  const max = 0x100000000;
  return (Math.floor(Math.random() * (max - min)) + min).toString(16);
};

interface PlayerWord {
  playerIdx: number;
  wordIdx: number;
}

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

  private wordCanBeStolen(game: GameState, newWord: string, wordToSteal: string): boolean {
    if (newWord.length <= wordToSteal.length) {
      return false;
    }
    // Check that the word to steal is a subset of the new word
    let newWordRemainder: string = newWord;
    for (let i = 0; i < wordToSteal.length; ++i) {
      const char = wordToSteal.charAt(i);
      if (!newWordRemainder.includes(char)) {
        return false;
      }
      newWordRemainder.replace(char, '');
    }

    // Check that the remainder of the new word can be constructed from the pool
    const poolRemainder: string[] = [...game.tiles];
    for (let i = 0; i < newWordRemainder.length; ++i) {
      const poolIdx = poolRemainder.indexOf(newWordRemainder.charAt(i));
      if (poolIdx < 0) {
        return false;
      }
      poolRemainder.splice(poolIdx, 1);
    }
    return true;;
  }

  private getWordsThatCanBeStolen(game: GameState, newWord: string): PlayerWord[] {
    const allPlayerWords: PlayerWord[] = game.players.reduce((allWords, player, playerIdx) => {
      allWords.push(...player.words.map((word, wordIdx) => ({ playerIdx, wordIdx })));
      return allWords;
    }, [] as PlayerWord[]);

    const wordsThatCanBeStolen = allPlayerWords.filter((playerWord: PlayerWord) => {
      const word = game.players[playerWord.playerIdx].words[playerWord.wordIdx];
      return this.wordCanBeStolen(game, newWord, word);
    });

    return wordsThatCanBeStolen;
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

  claimWord(gameId: string, playerName: string, word: string): GameState | undefined {
    const game = this.getGame(gameId);
    const player = this.getPlayer(game, playerName);
    if (!player || !word) {
      return;
    }
    // Check if a word can be stolen.
    const stolenWords = this.getWordsThatCanBeStolen(game, word);

    // Check if word can be constructed solely from the tile pool.
    const tiles = [...game.tiles];
    // for (let i = 0; i < word.length; ++i) {
    //   const index = tiles.indexOf(word.charAt(i));
    //   if (index < 0) {
    //     return;
    //   }
    //   tiles.splice(index, 1);
    // }
    if (!Dictionary.isValidWord(word)) {
      return;
    }
    game.tiles = tiles;
    player.words.push(word);
    return game;
  }
}
