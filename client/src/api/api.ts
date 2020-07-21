import axios, { AxiosInstance } from 'axios';
import socketIOClient from 'socket.io-client';
import { GameState, ClientEvents, ServerEvents } from '../server-models';

const SERVER_URL = 'http://localhost:4001';

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

  createSubscriptions(onGameUpdate: (gameState: GameState) => void, onGameDne: () => void) {
    this.socket.on(ServerEvents.GAME_UPDATED, onGameUpdate);
    this.socket.on(ServerEvents.GAME_DNE, onGameDne);
  }

  joinGame(gameId: string, player: string) {
    this.socket.emit(ClientEvents.JOIN_GAME, gameId, player);
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

  claimWord(gameId: string, player: string, word: string) {
    this.socket.emit(ClientEvents.CLAIM_WORD, gameId, player, word);
  }
};

const api = new Api(SERVER_URL);
export default api;
