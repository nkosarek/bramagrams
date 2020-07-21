import express from 'express';
import http from 'http';
import socketIO from 'socket.io';
import cors from 'cors';
import { ServerEvents, ClientEvents, GameState } from './models';
import GamesController from './game-controller';

const port = process.env.PORT || 4001;

const gamesController = new GamesController();

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(cors({ origin: 'http://localhost:3000' }))
app.set('port', port);

// Routing
app.get('/', function(req: express.Request, res: express.Response) {
  res.send("Please go to bramagrams.com");
});

app.post('/games', (req: express.Request, res: express.Response) => {
  console.log("Received request to create game");
  const id = gamesController.createGame()
  if (!id) {
    res.status(500).send("ERROR: Failed to create a unique game ID\n");
    return;
  }
  console.log(`Created game ${id}`);
  res.send(id);
});

// Starts the server.
server.listen(port, function() {
  console.log(`Starting server on port ${port}`);
});

const updateGameStateWrapper = (
  socket: SocketIO.Socket,
  gameId: string,
  updateGameState: () => GameState | undefined
) => {
  try {
    const gameState = updateGameState();
    if (gameState) {
      console.log("Updated state:", gameState);
      io.to(gameId).emit(ServerEvents.GAME_UPDATED, gameState);
    }
  } catch (err) {
    socket.emit(ServerEvents.GAME_DNE);
  }
}

io.on('connection', (socket) => {
  console.log("New client connected");
  socket.on('disconnect', () => {
    // TODO: Keep track of client connect/disconnect per player?
    console.log("Client disconnected");
  });

  socket.on(ClientEvents.JOIN_GAME, (gameId: string, player: string) => {
    console.log(`Received JOIN_GAME request with args: gameId=${gameId} player=${player}`);
    updateGameStateWrapper(socket, gameId, () => {
      const gameState = gamesController.addPlayer(gameId, player);
      socket.join(gameId);
      return gameState;
    });
  });

  socket.on(ClientEvents.READY_TO_START, (gameId: string, player: string) => {
    console.log(`Received READY_TO_START request with args: gameId=${gameId} player=${player}`);
    updateGameStateWrapper(socket, gameId, () => gamesController.setPlayerReady(gameId, player));
  });

  socket.on(ClientEvents.START_GAME, (gameId: string) => {
    console.log(`Received START_GAME request with args: gameId=${gameId}`);
    updateGameStateWrapper(socket, gameId, () => gamesController.startGame(gameId));
  });

  socket.on(ClientEvents.ADD_TILE, (gameId: string, player: string) => {
    console.log(`Received ADD_TILE request with args: gameId=${gameId} player=${player}`);
    updateGameStateWrapper(socket, gameId, () => gamesController.addTile(gameId, player));
  });

  socket.on(ClientEvents.CLAIM_WORD, (gameId: string, player: string, word: string) => {
    console.log(`Received CLAIM_WORD request with args: gameId=${gameId} player=${player} word=${word}`);
    updateGameStateWrapper(socket, gameId, () => gamesController.claimWord(gameId, player, word));
  });
});
