import { isValidWord } from "@/shared/dictionary/isValidWord";
import { exhaustiveSwitchCheck } from "@/shared/utils/exhaustiveSwitchCheck";
import {
  GameConfig,
  GameState,
  GameStateEnded,
  GameStateInLobby,
  GameStateInProgress,
  MAX_ENDGAME_TIMEOUT_SECONDS,
  MAX_PLAYERS,
  MIN_ENDGAME_TIMEOUT_SECONDS,
  PlayerInGameEnded,
  PlayerInGameInLobby,
  PlayerInGameInProgress,
  PlayerWord,
} from "../shared/schema";
import {
  defaultStartingTiles,
  fewerStartingTiles,
  moreStartingTiles,
} from "../shared/tiles";

const isRunningInDev = () => process.env.NODE_ENV === "development";

const DEFAULT_GAME_CONFIG = {
  isPublic: false,
  numStartingTiles: isRunningInDev() ? 91 : 144,
  validTypedWordFeedback: true,
  endgameTimeoutSeconds: 60,
} as const satisfies GameConfig;

interface BaseServerGameState {
  lastAccessed: number;
}

interface ServerGameStateInLobby extends BaseServerGameState {
  status: "IN_LOBBY";
  players: Array<PlayerInGameInLobby>;
  gameConfig: Readonly<GameConfig>;
}

interface ServerGameStateInProgress extends BaseServerGameState {
  status: "IN_PROGRESS";
  players: Array<PlayerInGameInProgress>;
  currPlayerIdx: number;
  tiles: Array<string>;
  tilesLeft: Array<string>;
  endgameTimeoutTime: string | null;
  endgameTimeout: ReturnType<typeof setTimeout> | null;
  readonly gameConfig: Readonly<GameConfig>;
}

interface ServerGameStateEnded extends BaseServerGameState {
  status: "ENDED";
  players: Array<PlayerInGameEnded>;
  tiles: Array<string>;
  readonly gameConfig: Readonly<GameConfig>;
}

type ServerGameState =
  | ServerGameStateInLobby
  | ServerGameStateInProgress
  | ServerGameStateEnded;

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

  private resetCurrPlayerIdx(players: ServerGameState["players"]) {
    if (players[0]?.status === "SPECTATING") {
      return this.advanceCurrPlayer(0, players);
    } else {
      return 0;
    }
  }

  private getPlayer<G extends ServerGameState>(
    game: G,
    name: string
  ): G["players"][number] | undefined {
    return game?.players.find((p) => p.name === name);
  }

  private getNumPlayingPlayers({ status, players }: ServerGameState): number {
    switch (status) {
      case "IN_LOBBY":
        return players.filter((p) => p.status === "PLAYING").length;
      case "IN_PROGRESS":
        return players.filter(
          (p) => p.status === "PLAYING" || p.status === "READY_TO_END"
        ).length;
      case "ENDED":
        return players.filter((p) => p.status === "ENDED").length;
      default:
        return exhaustiveSwitchCheck(status);
    }
  }

  private getStartingTiles({ numStartingTiles }: GameConfig): Array<string> {
    switch (numStartingTiles) {
      case 91:
        return [...fewerStartingTiles];
      case 144:
        return [...defaultStartingTiles];
      case 288:
        return [...moreStartingTiles];
      default:
        return exhaustiveSwitchCheck(numStartingTiles);
    }
  }

  private advanceCurrPlayer(
    currPlayerIdx: number,
    players: ServerGameState["players"]
  ) {
    const advance = (idx: number) => (idx + 1) % players.length;
    const isSpectating = (idx: number) => players[idx]?.status === "SPECTATING";
    let newCurrPlayerIdx = advance(currPlayerIdx);
    while (isSpectating(newCurrPlayerIdx)) {
      newCurrPlayerIdx = advance(newCurrPlayerIdx);
    }
    return newCurrPlayerIdx;
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
    game: ServerGameStateInProgress,
    newWord: string,
    wordsToClaim: PlayerWord[] = []
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

  private removeClaimedWords(
    game: ServerGameStateInProgress,
    claimedWords?: PlayerWord[]
  ) {
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

  private endGame(gameId: string, oldGame: ServerGameStateInProgress) {
    if (oldGame.endgameTimeout) {
      clearTimeout(oldGame.endgameTimeout);
    }
    const newGameState = {
      status: "ENDED",
      players: oldGame.players.map((p) => ({
        status: p.status === "SPECTATING" ? p.status : "ENDED",
        name: p.name,
        words: p.words,
      })),
      gameConfig: oldGame.gameConfig,
      tiles: oldGame.tiles,
      lastAccessed: oldGame.lastAccessed,
    } satisfies ServerGameStateEnded;
    this.games[gameId] = newGameState;
    return newGameState;
  }

  private shouldGameEnd(game: ServerGameStateInProgress): boolean {
    return (
      (game.tilesLeft.length === 0 && !game.tiles.length) ||
      game.players.every(
        (p) => p.status === "READY_TO_END" || p.status === "SPECTATING"
      )
    );
  }

  private convertInLobbyToClientState(
    game: ServerGameStateInLobby
  ): GameStateInLobby {
    return {
      status: game.status,
      gameConfig: game.gameConfig,
      players: game.players,
    };
  }

  private convertInProgressToClientState(
    game: ServerGameStateInProgress
  ): GameStateInProgress {
    return {
      status: game.status,
      gameConfig: game.gameConfig,
      players: game.players,
      currPlayerIdx: game.currPlayerIdx,
      tiles: game.tiles,
      numTilesLeft: game.tilesLeft.length,
      endgameTimeoutTime: game.endgameTimeoutTime,
    };
  }

  private convertEndedToClientState(
    game: ServerGameStateEnded
  ): GameStateEnded {
    return {
      status: game.status,
      gameConfig: game.gameConfig,
      players: game.players,
      tiles: game.tiles,
    };
  }

  private convertToClientState(game: ServerGameState): GameState {
    switch (game.status) {
      case "IN_LOBBY":
        return this.convertInLobbyToClientState(game);
      case "IN_PROGRESS":
        return this.convertInProgressToClientState(game);
      case "ENDED":
        return this.convertEndedToClientState(game);
      default:
        return exhaustiveSwitchCheck(game);
    }
  }

  // TODO: Use conditional return type when typescript 5.8 is released
  // https://github.com/microsoft/TypeScript/milestone/212
  // https://github.com/microsoft/TypeScript/pull/56941
  // private convertToClientState<S extends ServerGameState>(
  //   game: ServerGameState
  // ): S extends ServerGameStateInLobby
  //   ? GameStateInLobby
  //   : S extends ServerGameStateInProgress
  //   ? GameStateInProgress
  //   : S extends ServerGameStateEnded
  //   ? GameStateEnded
  //   : never {
  //   switch (game.status) {
  //     case "IN_LOBBY":
  //       return {
  //         status: game.status,
  //         gameConfig: game.gameConfig,
  //         players: game.players,
  //       };
  //     case "IN_PROGRESS":
  //       return {
  //         status: game.status,
  //         gameConfig: game.gameConfig,
  //         players: game.players,
  //         currPlayerIdx: game.currPlayerIdx,
  //         tiles: game.tiles,
  //         numTilesLeft: game.tilesLeft.length,
  //         endgameTimeoutTime: game.endgameTimeoutTime,
  //       };
  //     case "ENDED":
  //       return {
  //         status: game.status,
  //         gameConfig: game.gameConfig,
  //         players: game.players,
  //         tiles: game.tiles,
  //       };
  //     default:
  //       return exhaustiveSwitchCheck(game);
  //   }
  // }

  private getGameState(gameId: string): ServerGameState {
    const game = this.games[gameId];
    if (!game) {
      throw Error("Game does not exist");
    }
    game.lastAccessed = Date.now();
    return game;
  }

  createGame(): string {
    let id: string;
    let retries: number = 0;
    this.cleanupAbandonedGames();
    do {
      if (++retries > 5) {
        return "";
      }
      id = GamesController.generateGameId();
    } while (this.games[id]);
    this.games[id] = {
      status: "IN_LOBBY",
      gameConfig: DEFAULT_GAME_CONFIG,
      players: [],
      lastAccessed: Date.now(),
    };
    return id;
  }

  getPublicGames(): { [gameId: string]: GameState } {
    return Object.fromEntries(
      Object.entries(this.games)
        .filter(([, game]) => game.gameConfig.isPublic)
        .map(([gameId, game]) => [gameId, this.convertToClientState(game)])
    );
  }

  getGame(gameId: string): GameState {
    return this.convertToClientState(this.getGameState(gameId));
  }

  addPlayer(gameId: string, name: string): GameState | undefined {
    const game = this.getGameState(gameId);
    if (!name || this.getPlayer(game, name)) {
      return;
    }
    if (game.status === "IN_LOBBY") {
      game.players.push({
        name,
        status:
          this.getNumPlayingPlayers(game) < MAX_PLAYERS
            ? "PLAYING"
            : "SPECTATING",
      });
    } else {
      game.players.push({
        name,
        status: "SPECTATING",
        words: [],
      });
    }
    return this.convertToClientState(game);
  }

  renamePlayer(
    gameId: string,
    newName: string,
    oldName: string
  ): GameStateInLobby | undefined {
    const game = this.getGameState(gameId);
    if (game.status !== "IN_LOBBY" || !newName) {
      return;
    }
    const player = this.getPlayer(game, oldName);
    if (!player) {
      return;
    }
    player.name = newName;
    return this.convertInLobbyToClientState(game);
  }

  setPlayerSpectating(
    gameId: string,
    name: string
  ): GameStateInLobby | undefined {
    const game = this.getGameState(gameId);
    if (game.status !== "IN_LOBBY") {
      return;
    }
    const player = this.getPlayer(game, name);
    if (!player || player.status !== "PLAYING") {
      return;
    }
    player.status = "SPECTATING";
    return this.convertInLobbyToClientState(game);
  }

  setPlayerPlaying(gameId: string, name: string): GameStateInLobby | undefined {
    const game = this.getGameState(gameId);
    if (game.status !== "IN_LOBBY") {
      return;
    }
    const player = this.getPlayer(game, name);
    if (
      !player ||
      player.status !== "SPECTATING" ||
      this.getNumPlayingPlayers(game) >= MAX_PLAYERS
    ) {
      return;
    }
    player.status = "PLAYING";
    return this.convertInLobbyToClientState(game);
  }

  updateGameConfig(
    gameId: string,
    gameConfig: GameConfig = { ...DEFAULT_GAME_CONFIG }
  ): GameStateInLobby | undefined {
    const game = this.getGameState(gameId);
    if (
      game.status !== "IN_LOBBY" ||
      gameConfig.endgameTimeoutSeconds < MIN_ENDGAME_TIMEOUT_SECONDS ||
      gameConfig.endgameTimeoutSeconds > MAX_ENDGAME_TIMEOUT_SECONDS
    ) {
      return;
    }
    game.gameConfig = gameConfig;
    return this.convertInLobbyToClientState(game);
  }

  // IN_LOBBY -> IN_PROGRESS
  startGame(gameId: string): GameStateInProgress | undefined {
    const game = this.getGameState(gameId);
    if (
      game.status !== "IN_LOBBY" ||
      game.players.filter((player) => player.status === "PLAYING").length <= 1
    ) {
      return;
    }
    const getNewPlayerStatus = (
      p: PlayerInGameInLobby
    ): PlayerInGameInProgress["status"] => {
      switch (p.status) {
        case "PLAYING":
          return "PLAYING";
        case "SPECTATING":
          return "SPECTATING";
        default:
          return exhaustiveSwitchCheck(p.status);
      }
    };
    const players = game.players.map((p) => ({
      name: p.name,
      status: getNewPlayerStatus(p),
      words: [],
    })) satisfies ServerGameStateInProgress["players"];
    const newGameState = {
      status: "IN_PROGRESS",
      gameConfig: game.gameConfig,
      players,
      currPlayerIdx: this.resetCurrPlayerIdx(players),
      tiles: [],
      tilesLeft: this.getStartingTiles(game.gameConfig),
      endgameTimeoutTime: null,
      endgameTimeout: null,
      lastAccessed: game.lastAccessed,
    } satisfies ServerGameStateInProgress;

    this.games[gameId] = newGameState;
    return this.convertInProgressToClientState(newGameState);
  }

  addTile(gameId: string, playerName: string): GameStateInProgress | undefined {
    const game = this.getGameState(gameId);
    if (game.status !== "IN_PROGRESS") {
      return;
    }
    if (
      game.tilesLeft.length === 0 ||
      (!isRunningInDev() &&
        playerName !== game.players[game.currPlayerIdx]?.name)
    ) {
      return;
    }
    const tilesIdx = Math.floor(Math.random() * game.tilesLeft.length);
    game.tiles.push(...game.tilesLeft.splice(tilesIdx, 1));
    game.currPlayerIdx = this.advanceCurrPlayer(
      game.currPlayerIdx,
      game.players
    );
    return this.convertInProgressToClientState(game);
  }

  claimWord(
    gameId: string,
    playerName: string,
    newWord: string,
    wordsToClaim?: PlayerWord[]
  ): GameStateInProgress | GameStateEnded | undefined {
    const game = this.getGameState(gameId);
    if (game.status !== "IN_PROGRESS") {
      return;
    }
    const player = this.getPlayer(game, playerName);
    if (
      !player ||
      (player.status === "SPECTATING" &&
        this.getNumPlayingPlayers(game) >= MAX_PLAYERS)
    ) {
      return;
    }
    if (newWord.length < 3 || !isValidWord(newWord)) {
      return;
    }
    const newPool = this.getNewTilePool(game, newWord, wordsToClaim);
    if (!newPool) {
      return;
    }
    game.tiles = newPool;
    this.removeClaimedWords(game, wordsToClaim);
    player.words.push(newWord);
    player.status = "PLAYING";
    if (this.shouldGameEnd(game)) {
      return this.convertEndedToClientState(this.endGame(gameId, game));
    }
    return this.convertInProgressToClientState(game);
  }

  setPlayerReadyToEnd(
    gameId: string,
    playerName: string,
    onEndgameTimerDone: (gameId: string, gameState: GameStateEnded) => void
  ): GameStateInProgress | GameStateEnded | undefined {
    const game = this.getGameState(gameId);
    if (game.status !== "IN_PROGRESS" || game.tilesLeft.length) {
      return;
    }
    const player = this.getPlayer(game, playerName);
    if (!player || player.status !== "PLAYING") {
      return;
    }
    // If this is the first player to be ready, start endgame timer
    if (game.players.every((p) => p.status !== "READY_TO_END")) {
      const timeoutMs = game.gameConfig.endgameTimeoutSeconds * 1000;
      game.endgameTimeoutTime = new Date(Date.now() + timeoutMs).toISOString();
      game.endgameTimeout = setTimeout(() => {
        console.log(`Endgame timer complete for ${gameId}. Ending game`);
        const latestGameState = this.getGameState(gameId);
        if (latestGameState.status === "IN_PROGRESS") {
          const newGameState = this.endGame(gameId, latestGameState);
          onEndgameTimerDone(
            gameId,
            this.convertEndedToClientState(newGameState)
          );
        }
      }, timeoutMs);
    }
    player.status = "READY_TO_END";
    if (this.shouldGameEnd(game)) {
      return this.convertEndedToClientState(this.endGame(gameId, game));
    }
    return this.convertInProgressToClientState(game);
  }

  setPlayerNotReadyToEnd(
    gameId: string,
    playerName: string
  ): GameStateInProgress | undefined {
    const game = this.getGameState(gameId);
    if (game.status !== "IN_PROGRESS") {
      return;
    }
    const player = this.getPlayer(game, playerName);
    if (!player || player.status !== "READY_TO_END") {
      return;
    }
    player.status = "PLAYING";
    // If no players are ready to end, clear endgame timer
    if (game.players.every((p) => p.status !== "READY_TO_END")) {
      game.endgameTimeoutTime = null;
      if (game.endgameTimeout) {
        clearTimeout(game.endgameTimeout);
        game.endgameTimeout = null;
      }
    }
    return this.convertInProgressToClientState(game);
  }

  // ENDED -> IN_PROGRESS
  rematch(gameId: string): GameStateInProgress | undefined {
    const game = this.getGameState(gameId);
    if (game.status !== "ENDED") {
      return;
    }
    const getNewPlayerStatus = (
      p: PlayerInGameEnded
    ): PlayerInGameInProgress["status"] => {
      switch (p.status) {
        case "ENDED":
          return "PLAYING";
        case "SPECTATING":
          return "SPECTATING";
        default:
          return exhaustiveSwitchCheck(p.status);
      }
    };
    const players = game.players.map((p) => ({
      name: p.name,
      status: getNewPlayerStatus(p),
      words: [],
    })) satisfies ServerGameStateInProgress["players"];
    const newGameState = {
      status: "IN_PROGRESS",
      gameConfig: game.gameConfig,
      players,
      currPlayerIdx: this.resetCurrPlayerIdx(players),
      tiles: [],
      tilesLeft: this.getStartingTiles(game.gameConfig),
      endgameTimeoutTime: null,
      endgameTimeout: null,
      lastAccessed: game.lastAccessed,
    } satisfies ServerGameStateInProgress;

    this.games[gameId] = newGameState;
    return this.convertInProgressToClientState(newGameState);
  }

  // ENDED -> IN_LOBBY
  backToLobby(gameId: string): GameStateInLobby | undefined {
    const game = this.getGameState(gameId);
    if (game.status !== "ENDED") {
      return;
    }

    const getNewPlayerStatus = (
      p: PlayerInGameEnded
    ): PlayerInGameInLobby["status"] => {
      switch (p.status) {
        case "ENDED":
          return "PLAYING";
        case "SPECTATING":
          return "SPECTATING";
        default:
          return exhaustiveSwitchCheck(p.status);
      }
    };
    const players = game.players.map((p) => ({
      name: p.name,
      status: getNewPlayerStatus(p),
      words: [],
    })) satisfies ServerGameStateInLobby["players"];
    const newGameState = {
      status: "IN_LOBBY",
      gameConfig: game.gameConfig,
      players,
      lastAccessed: game.lastAccessed,
    } satisfies ServerGameStateInLobby;

    this.games[gameId] = newGameState;
    return this.convertInLobbyToClientState(newGameState);
  }
}
