import { isValidWord } from "@/shared/dictionary/dictionary";
import {
  GameConfig,
  GameState,
  MAX_PLAYERS,
  Player,
  PlayerWord,
} from "./schema";
import { baseTiles } from "./tiles";

const isRunningInDev = () => process.env.NODE_ENV === "development";

const DEFAULT_GAME_CONFIG: GameConfig = {
  isPublic: false,
};

interface ServerGameState {
  clientGameState: GameState;
  tilesLeft: string[];
  lastAccessed: number;
  endgameTimer: ReturnType<typeof setTimeout> | null;
}
export class GamesController {
  private games: { [gameId: string]: ServerGameState } = {};

  private static generateGameId() {
    const min = 0x10000000;
    const max = 0x100000000;
    let id = "";
    while (!id || id === "Infinity" || id === "NaN") {
      id = (Math.floor(Math.random() * (max - min)) + min).toString(16);
    }
    return id;
  }

  private cleanupAbandonedGames() {
    const oneDayAgo = new Date().setDate(new Date().getDate() - 1);
    const gamesToDelete = Object.entries(this.games).reduce<Array<string>>(
      (toDelete, [gameId, { lastAccessed }]) => {
        if (lastAccessed < oneDayAgo) {
          toDelete.push(gameId);
        }
        return toDelete;
      },
      []
    );
    console.log("Deleting abandoned games:", gamesToDelete);
    gamesToDelete.forEach((gameId) => delete this.games[gameId]);
  }

  private resetCurrPlayerIdx(game: GameState) {
    game.currPlayerIdx = 0;
    if (game.players[game.currPlayerIdx]?.status === "SPECTATING") {
      this.advanceCurrPlayer(game);
    }
  }

  private getPlayer(game: GameState, name: string): Player | undefined {
    return game?.players.find((p) => p.name === name);
  }

  private getNumPlayingPlayers(game: GameState): number {
    const playingStatus =
      game.status === "WAITING_TO_START" ? "READY_TO_START" : "PLAYING";
    return game.players.filter((p) => p.status === playingStatus).length;
  }

  private gameCanStart(game: GameState): boolean {
    return (
      game.status === "WAITING_TO_START" &&
      game.players.filter((player) => player.status === "READY_TO_START")
        .length > 1
    );
  }

  private addNewTileToPool(game: GameState, tilesLeft: string[]) {
    const tilesIdx = Math.floor(Math.random() * tilesLeft.length);
    const tile = tilesLeft[tilesIdx];
    if (!tile) {
      // TODO: this is impossible
      return;
    }
    game.tiles.push(tile);
    tilesLeft.splice(tilesIdx, 1);
    game.numTilesLeft = tilesLeft.length;
  }

  private advanceCurrPlayer(game: GameState) {
    const advance = (idx: number) => (idx + 1) % game.players.length;
    const isSpectating = (idx: number) =>
      game.players[idx]?.status === "SPECTATING";
    let newCurrPlayerIdx = advance(game.currPlayerIdx);
    while (isSpectating(newCurrPlayerIdx)) {
      newCurrPlayerIdx = advance(newCurrPlayerIdx);
    }
    game.currPlayerIdx = newCurrPlayerIdx;
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
      wordDiff = wordDiff.replace(char, "");
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
      const word =
        game.players[playerWord.playerIdx]?.words[playerWord.wordIdx];
      if (!word) {
        console.log("Invalid word taken");
        return;
      }
      newWordRemainder = this.getWordDiff(newWordRemainder, word);
      if (newWordRemainder == null) {
        console.log("Words taken are not a subset of the new word");
        return;
      }

      if (!newWordRemainder && wordsToClaim.length < 2) {
        console.log("No tiles added to existing word");
        return;
      }
    }

    const poolRemainder: string[] = [...game.tiles];
    for (let i = 0; i < newWordRemainder.length; ++i) {
      const poolIdx = poolRemainder.indexOf(newWordRemainder.charAt(i));
      if (poolIdx < 0) {
        console.log(
          `Remainder ('${newWordRemainder}') cannot be constructed with pool`
        );
        return;
      }
      poolRemainder.splice(poolIdx, 1);
    }
    return poolRemainder;
  }

  private removeClaimedWords(game: GameState, claimedWords?: PlayerWord[]) {
    if (!claimedWords) return;

    const wordsToRemoveByPlayer = claimedWords.reduce(
      (array, { playerIdx, wordIdx }) => {
        array[playerIdx] = array[playerIdx] || [];
        array[playerIdx].push(wordIdx);
        return array;
      },
      new Array(game.players.length) as number[][]
    );

    wordsToRemoveByPlayer.forEach((wordsToRemove, playerIdx) => {
      const player = game.players[playerIdx];
      if (!player) {
        return;
      }
      player.words = player.words.filter((w, i) => !wordsToRemove.includes(i));
    });
  }

  private endGame(game: GameState) {
    game.status = "ENDED";
    game.timeoutTime = null;
    game.players.forEach((player) => {
      if (player.status !== "SPECTATING") {
        player.status = "ENDED";
      }
    });
  }

  private checkForGameEnd(
    game: GameState,
    endgameTimer: ReturnType<typeof setTimeout> | null
  ) {
    if (
      (game.numTilesLeft === 0 && !game.tiles.length) ||
      game.players.every((player) =>
        ["READY_TO_END", "SPECTATING"].includes(player.status)
      )
    ) {
      if (endgameTimer) clearTimeout(endgameTimer);
      this.endGame(game);
    }
  }

  private restartGame(
    serverGameState: ServerGameState,
    toLobby: boolean = false
  ): GameState {
    serverGameState.tilesLeft = [...baseTiles];
    if (serverGameState.endgameTimer) {
      clearTimeout(serverGameState.endgameTimer);
      serverGameState.endgameTimer = null;
    }
    const { clientGameState: game } = serverGameState;
    this.resetCurrPlayerIdx(game);
    game.timeoutTime = null;
    game.status = toLobby ? "WAITING_TO_START" : "IN_PROGRESS";
    game.tiles = [];
    game.numTilesLeft = baseTiles.length;
    const newPlayingPlayerStatus = toLobby ? "READY_TO_START" : "PLAYING";
    game.players.forEach((p) => {
      p.words = [];
      if (p.status !== "SPECTATING") {
        p.status = newPlayingPlayerStatus;
      }
    });
    return game;
  }

  getGame(gameId: string): ServerGameState {
    const game = this.games[gameId];
    if (!game) {
      throw "Game does not exist";
    }
    game.lastAccessed = Date.now();
    return game;
  }

  createGame(gameConfig: GameConfig = DEFAULT_GAME_CONFIG): string {
    let id: string;
    let count: number = 0;
    this.cleanupAbandonedGames();
    do {
      if (++count > 5) {
        return "";
      }
      id = GamesController.generateGameId();
    } while (this.games[id]);
    this.games[id] = {
      tilesLeft: [...baseTiles],
      lastAccessed: Date.now(),
      endgameTimer: null,
      clientGameState: {
        players: [],
        currPlayerIdx: 0,
        status: "WAITING_TO_START",
        tiles: [],
        numTilesLeft: baseTiles.length,
        totalTiles: baseTiles.length,
        timeoutTime: null,
        gameConfig,
      },
    };
    return id;
  }

  getPublicGames(): { [gameId: string]: GameState } {
    return Object.fromEntries(
      Object.entries(this.games)
        .filter((entry) => entry[1].clientGameState.gameConfig.isPublic)
        .map(([gameId, serverGameState]) => [
          gameId,
          serverGameState.clientGameState,
        ])
    );
  }

  addPlayer(gameId: string, name: string): GameState | undefined {
    const { clientGameState: game } = this.getGame(gameId);
    if (!name || this.getPlayer(game, name)) {
      return;
    }
    // TODO: after multiple players supported, allow players to join mid game (different status?)
    const status =
      game.status === "WAITING_TO_START" &&
      this.getNumPlayingPlayers(game) < MAX_PLAYERS
        ? "READY_TO_START"
        : "SPECTATING";
    game.players.push({
      name,
      status,
      words: [],
    });
    return game;
  }

  renamePlayer(
    gameId: string,
    newName: string,
    oldName: string
  ): GameState | undefined {
    const { clientGameState: game } = this.getGame(gameId);
    const player = this.getPlayer(game, oldName);
    if (!player || !newName) {
      return;
    }
    player.name = newName;
    return game;
  }

  setPlayerSpectating(gameId: string, name: string): GameState | undefined {
    const { clientGameState: game } = this.getGame(gameId);
    const player = this.getPlayer(game, name);
    if (!player || player.status !== "READY_TO_START") {
      return;
    }
    player.status = "SPECTATING";
    return game;
  }

  setPlayerReadyToStart(gameId: string, name: string): GameState | undefined {
    const serverGameState = this.getGame(gameId);
    const { clientGameState: game } = serverGameState;
    const player = this.getPlayer(game, name);
    if (
      !player ||
      game.status !== "WAITING_TO_START" ||
      player.status !== "SPECTATING" ||
      this.getNumPlayingPlayers(game) >= MAX_PLAYERS
    ) {
      return;
    }
    player.status = "READY_TO_START";
    return game;
  }

  rematch(gameId: string): GameState | undefined {
    const serverGameState = this.getGame(gameId);
    const { clientGameState: game } = serverGameState;
    if (game.status === "ENDED") {
      return this.restartGame(serverGameState);
    }
  }

  startGame(gameId: string): GameState | undefined {
    const { clientGameState: game } = this.getGame(gameId);
    if (!this.gameCanStart(game)) {
      return;
    }
    game.status = "IN_PROGRESS";
    game.players.forEach((player) => {
      if (player.status === "READY_TO_START") {
        player.status = "PLAYING";
      }
    });
    this.resetCurrPlayerIdx(game);
    return game;
  }

  addTile(
    gameId: string,
    playerName: string,
    onEndgameTimerDone: (gameId: string, gameState: GameState) => void
  ): GameState | undefined {
    const serverGameState = this.getGame(gameId);
    const { clientGameState: game, tilesLeft } = serverGameState;
    if (
      game.numTilesLeft === 0 ||
      (!isRunningInDev() &&
        playerName !== game.players[game.currPlayerIdx]?.name)
    ) {
      return;
    }
    this.addNewTileToPool(game, tilesLeft);
    this.advanceCurrPlayer(game);
    if (game.numTilesLeft === 0) {
      game.timeoutTime = new Date(Date.now() + 60000).toISOString();
      serverGameState.endgameTimer = setTimeout(() => {
        console.log(`Endgame timer complete for ${gameId}. Ending game`);
        if (game.status !== "ENDED") {
          this.endGame(game);
          onEndgameTimerDone(gameId, game);
        }
      }, 60000);
    }
    return game;
  }

  claimWord(
    gameId: string,
    playerName: string,
    newWord: string,
    wordsToClaim?: PlayerWord[]
  ): GameState | undefined {
    const { clientGameState: game, endgameTimer } = this.getGame(gameId);
    const player = this.getPlayer(game, playerName);
    const playerIsSpectating = player?.status === "SPECTATING";
    if (
      !player ||
      !newWord ||
      newWord.length < 3 ||
      game.status !== "IN_PROGRESS" ||
      (playerIsSpectating && this.getNumPlayingPlayers(game) >= MAX_PLAYERS)
    ) {
      return;
    }
    const newPool = this.getNewTilePool(game, newWord, wordsToClaim || []);
    if (!newPool) {
      return;
    }
    if (!isValidWord(newWord)) {
      return;
    }
    game.tiles = newPool;
    this.removeClaimedWords(game, wordsToClaim);
    player.words.push(newWord);
    if (playerIsSpectating) {
      player.status = "PLAYING";
    }
    this.checkForGameEnd(game, endgameTimer);
    return game;
  }

  setPlayerReadyToEnd(
    gameId: string,
    playerName: string
  ): GameState | undefined {
    const { clientGameState: game, endgameTimer } = this.getGame(gameId);
    const player = this.getPlayer(game, playerName);
    if (!player || game.numTilesLeft || player.status !== "PLAYING") {
      return;
    }
    player.status = "READY_TO_END";
    this.checkForGameEnd(game, endgameTimer);
    return game;
  }

  setPlayerNotReadyToEnd(
    gameId: string,
    playerName: string
  ): GameState | undefined {
    const { clientGameState: game } = this.getGame(gameId);
    const player = this.getPlayer(game, playerName);
    if (!player || player.status !== "READY_TO_END") {
      return;
    }
    player.status = "PLAYING";
    return game;
  }

  backToLobby(gameId: string): GameState | undefined {
    const serverGameState = this.getGame(gameId);
    const { clientGameState: game } = serverGameState;
    if (game.status === "ENDED") {
      return this.restartGame(serverGameState, true);
    }
  }
}
