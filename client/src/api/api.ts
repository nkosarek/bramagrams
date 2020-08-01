import axios, { AxiosInstance } from 'axios';
import socketIOClient from 'socket.io-client';
import { GameState, PlayerWord, ClientEvents, ServerEvents } from '../server-models';

const SERVER_URL = 'http://localhost:5000';

class Api {
  private socket: SocketIOClient.Socket;
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.socket = socketIOClient(SERVER_URL);
    this.client = axios.create({
      baseURL,
      timeout: 1000,
    });
  }

  async createGame(): Promise<string> {
    const response = await this.client.post('/games');
    return response.data;
  }

  initGameSubscriptions(
    onGameUpdate: (gameState: GameState) => void,
    onGameDne: () => void,
  ) {
    this.socket.on(ServerEvents.GAME_UPDATED, onGameUpdate);
    this.socket.on(ServerEvents.GAME_DNE, onGameDne);
  }

  initNameClaimedSubscription(onNameClaimed: (name: string) => void) {
    this.socket.on(ServerEvents.NAME_CLAIMED, onNameClaimed);
  }

  initWordClaimedSubscription(onWordClaimed: (word: string) => void) {
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

  readyToStart(gameId: string, player: string) {
    this.socket.emit(ClientEvents.READY_TO_START, gameId, player);
  }

  notReadyToStart(gameId: string, player: string) {
    this.socket.emit(ClientEvents.NOT_READY_TO_START, gameId, player);
  }

  startGame(gameId: string) {
    this.socket.emit(ClientEvents.START_GAME, gameId);
  }

  addTile(gameId: string, player: string) {
    this.socket.emit(ClientEvents.ADD_TILE, gameId, player);
  }

  claimWord(gameId: string, player: string, newWord: string, wordsToClaim?: PlayerWord[]) {
    this.socket.emit(ClientEvents.CLAIM_WORD, gameId, player, newWord, wordsToClaim);
  }

  readyToEnd(gameId: string, player: string) {
    this.socket.emit(ClientEvents.READY_TO_END, gameId, player);
  }

  notReadyToEnd(gameId: string, player: string) {
    this.socket.emit(ClientEvents.NOT_READY_TO_END, gameId, player);
  }
};

const api = new Api(SERVER_URL);
export default api;
