import {
  ClientEvents,
  GameState,
  PlayerWord,
  ServerEvents,
} from "@/server/schema";
import { SOCKET_SERVER_PORT, WEB_SERVER_PORT } from "@/shared/constants/ports";
import { io, Socket } from "socket.io-client";

export class GameClient {
  private socket: Socket;
  private webserverUrl: string;

  constructor(hostname: string) {
    const baseUrl = `http://${hostname}`;
    this.webserverUrl = `${baseUrl}:${WEB_SERVER_PORT}`;
    this.socket = io(`${baseUrl}:${SOCKET_SERVER_PORT}`);
  }

  async createGame(isPublic = false): Promise<string> {
    const response = await fetch(`${this.webserverUrl}/api/games`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ gameConfig: { isPublic } }),
    });
    return await response.text();
  }

  async getPublicGames(): Promise<{ [gameId: string]: GameState }> {
    const response = await fetch(`${this.webserverUrl}/api/public-games`);
    return await response.json();
  }

  initGameSubscriptions({
    onGameUpdate,
    onGameDne,
  }: {
    onGameUpdate: (gameState: GameState) => void;
    onGameDne: () => void;
  }) {
    this.socket.on(ServerEvents.GAME_UPDATED, onGameUpdate);
    this.socket.on(ServerEvents.GAME_DNE, onGameDne);
  }

  initNameClaimedSubscription(onNameClaimed: (name: string) => void) {
    this.socket.on(ServerEvents.NAME_CLAIMED, onNameClaimed);
  }

  initWordClaimedSubscription(
    onWordClaimed: (claimed: boolean, word: string) => void
  ) {
    this.socket.on(ServerEvents.WORD_CLAIMED, onWordClaimed);
  }

  connectToGame(gameId: string) {
    this.socket.emit(ClientEvents.CONNECT_TO_GAME, gameId);
  }

  joinGame(gameId: string, playerName: string) {
    this.socket.emit(ClientEvents.JOIN_GAME, gameId, playerName);
  }

  changeName(gameId: string, newName: string, oldName: string) {
    this.socket.emit(ClientEvents.CHANGE_NAME, gameId, newName, oldName);
  }

  becomeSpectator(gameId: string, player: string) {
    this.socket.emit(ClientEvents.BECOME_SPECTATOR, gameId, player);
  }

  readyToStart(gameId: string, player: string) {
    this.socket.emit(ClientEvents.READY_TO_START, gameId, player);
  }

  startGame(gameId: string) {
    this.socket.emit(ClientEvents.START_GAME, gameId);
  }

  addTile(gameId: string, player: string) {
    this.socket.emit(ClientEvents.ADD_TILE, gameId, player);
  }

  claimWord(
    gameId: string,
    player: string,
    newWord: string,
    wordsToClaim?: PlayerWord[]
  ) {
    this.socket.emit(
      ClientEvents.CLAIM_WORD,
      gameId,
      player,
      newWord,
      wordsToClaim
    );
  }

  readyToEnd(gameId: string, player: string) {
    this.socket.emit(ClientEvents.READY_TO_END, gameId, player);
  }

  notReadyToEnd(gameId: string, player: string) {
    this.socket.emit(ClientEvents.NOT_READY_TO_END, gameId, player);
  }

  rematch(gameId: string) {
    this.socket.emit(ClientEvents.REMATCH, gameId);
  }

  backToLobby(gameId: string) {
    this.socket.emit(ClientEvents.BACK_TO_LOBBY, gameId);
  }
}
