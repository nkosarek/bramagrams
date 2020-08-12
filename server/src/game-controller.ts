import {
  Dictionary,
  TILES,
  GameState,
  GameStatuses,
  Player,
  PlayerWord,
  PlayerStatuses,
} from 'bramagrams-shared';
import { isRunningInDev } from './server';

interface ServerGameState {
  clientGameState: GameState;
  tilesLeft: string[];
  lastAccessed: number;
}

export default class GamesController {
  private games: { [gameId: string]: ServerGameState} = {};

  private static generateGameId() {
    const min = 0x10000000;
    const max = 0x100000000;
    let id = '';
    while (!id || id === 'Infinity' || id === 'NaN') {
      id = (Math.floor(Math.random() * (max - min)) + min).toString(16);
    }
    return id;
  };

  private cleanupAbandonedGames() {
    const gamesToDelete: string[] = [];
    const oneDayAgo = new Date().setDate(new Date().getDate() - 1);
    Object.keys(this.games).forEach(gameId =>
      this.games[gameId].lastAccessed < oneDayAgo && gamesToDelete.push(gameId));
    console.log('Deleting abandoned games:', gamesToDelete);
    gamesToDelete.forEach(gameId => delete this.games[gameId]);
  }

  private getPlayer(game: GameState, name: string): Player | undefined {
    return game?.players.find(p => p.name === name);
  }

  private gameCanStart(game: GameState): boolean {
    return [GameStatuses.WAITING_TO_START, GameStatuses.ENDED].includes(game.status) &&
      game.players.length > 1 &&
      game.players.every(player => player.status === PlayerStatuses.READY_TO_START);
  }

  private advanceCurrPlayer(game: GameState) {
    game.currPlayerIdx = (game.currPlayerIdx + 1) % game.players.length;
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
    wordsToClaim: PlayerWord[]
  ): string[] | undefined {
    let newWordRemainder: string | null = newWord;
    for (const playerWord of wordsToClaim) {
      const word = game.players[playerWord.playerIdx]?.words[playerWord.wordIdx];
      if (!word) {
        console.log('Invalid word taken');
        return;
      }
      newWordRemainder = this.getWordDiff(newWordRemainder, word);
      if (newWordRemainder == null) {
        console.log('Words taken are not a subset of the new word');
        return;
      }

      if (!newWordRemainder && wordsToClaim.length < 2) {
        console.log('No tiles added to existing word')
        return;
      }
    }

    const poolRemainder: string[] = [...game.tiles];
    for (let i = 0; i < newWordRemainder.length; ++i) {
      const poolIdx = poolRemainder.indexOf(newWordRemainder.charAt(i));
      if (poolIdx < 0) {
        console.log(`Remainder ('${newWordRemainder}') cannot be constructed with pool`);
        return;
      }
      poolRemainder.splice(poolIdx, 1);
    }
    return poolRemainder;
  }

  private removeClaimedWords(game: GameState, claimedWords?: PlayerWord[]) {
    if (!claimedWords) return;

    const wordsToRemoveByPlayer = claimedWords.reduce((array, word) => {
      if (array[word.playerIdx] != null) {
        array[word.playerIdx].push(word.wordIdx);
      } else {
        array[word.playerIdx] = [word.wordIdx];
      }
      return array;
    }, new Array(game.players.length) as number[][]);

    wordsToRemoveByPlayer.forEach((wordsToRemove, playerIdx) => {
      const player = game.players[playerIdx];
      player.words = player.words.filter((w, i) => !wordsToRemove.includes(i));
    });
  }

  private checkForGameEnd(game: GameState) {
    if (game.players.every(player => player.status === PlayerStatuses.READY_TO_END)) {
      game.status = GameStatuses.ENDED;
      game.players.forEach(player => player.status = PlayerStatuses.ENDED);
    }
  }

  private restartGame(serverGameState: ServerGameState): GameState {
    serverGameState.tilesLeft = [...TILES];
    const { clientGameState: game } = serverGameState;
    game.currPlayerIdx = 0;
    game.status = GameStatuses.IN_PROGRESS;
    game.tiles = [];
    game.numTilesLeft = TILES.length;
    game.players.forEach(p => {
      p.words = [];
      p.status = PlayerStatuses.PLAYING;
    });
    return game;
  }

  getGame(gameId: string) {
    const game = this.games[gameId];
    if (!game) {
      throw 'Game does not exist';
    }
    game.lastAccessed = Date.now();
    return game;
  }

  createGame(): string {
    let id: string;
    let count: number = 0;
    this.cleanupAbandonedGames();
    do {
      if (++count > 5) {
        return '';
      }
      id = GamesController.generateGameId();
    } while (this.games[id]);
    this.games[id] = {
      tilesLeft: [...TILES],
      lastAccessed: Date.now(),
      clientGameState: {
        players: [],
        currPlayerIdx: 0,
        status: GameStatuses.WAITING_TO_START,
        tiles: [],
        numTilesLeft: TILES.length,
      },
    }
    return id;
  }

  addPlayer(gameId: string, name: string): GameState | undefined {
    const { clientGameState: game } = this.getGame(gameId);
    if (!name || this.getPlayer(game, name) || game.players.length >= 2) {
      return;
    }
    // TODO: after multiple players supported, allow players to join mid game (different status?)
    game.players.push({
      name,
      status: PlayerStatuses.NOT_READY_TO_START,
      words: [],
    });
    return game;
  }

  renamePlayer(gameId: string, newName: string, oldName: string): GameState | undefined {
    const { clientGameState: game } = this.getGame(gameId);
    const player = this.getPlayer(game, oldName);
    if (!player || !newName) {
      return;
    }
    player.name = newName;
    return game;
  }

  setPlayerReadyToStart(gameId: string, name: string): GameState | undefined {
    const serverGameState = this.getGame(gameId);
    let { clientGameState: game } = serverGameState;
    const player = this.getPlayer(game, name);
    if (!player ||
        ![PlayerStatuses.NOT_READY_TO_START, PlayerStatuses.ENDED].includes(player.status)) {
      return;
    }
    player.status = PlayerStatuses.READY_TO_START;
    if (game.status === GameStatuses.ENDED && this.gameCanStart(game)) {
      return this.restartGame(serverGameState);
    }
    return game;
  }

  setPlayerNotReadyToStart(gameId: string, name: string): GameState | undefined {
    const { clientGameState: game } = this.getGame(gameId);
    const player = this.getPlayer(game, name);
    if (!player) {
      return;
    }
    if (player.status === PlayerStatuses.READY_TO_START) {
      player.status = PlayerStatuses.NOT_READY_TO_START;
      return game;
    }
  }

  startGame(gameId: string): GameState | undefined {
    const { clientGameState: game } = this.getGame(gameId);
    if (this.gameCanStart(game)) {
      game.status = GameStatuses.IN_PROGRESS;
      game.players.forEach(player => player.status = PlayerStatuses.PLAYING);
      return game;
    }
  }

  addTile(gameId: string, playerName: string): GameState | undefined {
    const { clientGameState: game, tilesLeft } = this.getGame(gameId);
    if ((isRunningInDev() || playerName === game.players[game.currPlayerIdx].name) &&
        game.numTilesLeft > 0) {
      const tilesIdx = Math.floor(Math.random() * tilesLeft.length);
      const tile = tilesLeft[tilesIdx];
      game.tiles.push(tile);
      tilesLeft.splice(tilesIdx, 1);
      game.numTilesLeft = tilesLeft.length;
      this.advanceCurrPlayer(game);
      return game;
    }
  }

  claimWord(
    gameId: string,
    playerName: string,
    newWord: string,
    wordsToClaim?: PlayerWord[]
  ): GameState | undefined {
    const { clientGameState: game } = this.getGame(gameId);
    const player = this.getPlayer(game, playerName);
    if (!player || !newWord || newWord.length < 3) {
      return;
    }
    const newPool = this.getNewTilePool(game, newWord, wordsToClaim || []);
    if (!newPool) {
      return;
    }
    if (!Dictionary.isValidWord(newWord)) {
      return;
    }
    game.tiles = newPool;
    this.removeClaimedWords(game, wordsToClaim);
    player.words.push(newWord);
    return game;
  }

  setPlayerReadyToEnd(gameId: string, playerName: string): GameState | undefined {
    const { clientGameState: game } = this.getGame(gameId);
    const player = this.getPlayer(game, playerName);
    if (!player || game.numTilesLeft || player.status !== PlayerStatuses.PLAYING) {
      return;
    }
    player.status = PlayerStatuses.READY_TO_END;
    this.checkForGameEnd(game)
    return game;
  }

  setPlayerNotReadyToEnd(gameId: string, playerName: string): GameState | undefined {
    const { clientGameState: game } = this.getGame(gameId);
    const player = this.getPlayer(game, playerName);
    if (!player || player.status !== PlayerStatuses.READY_TO_END) {
      return;
    }
    player.status = PlayerStatuses.PLAYING;
    return game;
  }
}
