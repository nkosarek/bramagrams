import express from 'express';
import http from 'http';
import socketIO from 'socket.io';
import cors from 'cors';
import { ServerEvents, ClientEvents, GameState } from './models';
import GamesController from './game-controller';
import { runInNewContext } from 'vm';

const port = process.env.PORT || 4001;

const gamesController = new GamesController();
const claimedNames: { [gameId: string]: Set<string> } = {}

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
  const id = gamesController.createGame();
  claimedNames[id] = new Set();
  if (!id) {
    res.status(500).send("ERROR: Failed to create a unique game ID\n");
    return;
  }
  console.log(`Created game ${id}`);
  res.status(201).send(id);
});

app.post('/games/:id/claim-name', (req: express.Request, res: express.Response) => {
  const newName = req.query.newName;
  const oldName = req.query.oldName;
  const gameId = req.params.id;
  console.log(`Receive request to claim name '${newName}' in game ${gameId}`);
  if (!gamesController.gameExists(gameId)) {
    res.status(400).send("Game does not exist");
  } else if (!newName || typeof newName !== 'string') {
    res.status(400).send("Exactly one new name must be requested");
  } else if (oldName && typeof oldName !== 'string') {
    res.status(400).send("At most one old name must be specified");
  } else if (claimedNames[gameId].has(newName)) {
    res.status(409).send("Name already claimed");
  } else {
    claimedNames[gameId].add(newName);
    console.log(`Claimed name '${newName}' in game ${gameId}`);
    if (oldName) {
      claimedNames[gameId].delete(oldName);
      console.log(`Freed up name '${oldName}' in game ${gameId}`)
    }
    res.sendStatus(200);
  }
});

// Starts the server.
server.listen(port, function() {
  console.log(`Starting server on port ${port}`);
});

const updateGameStateWrapper = (
  socket: SocketIO.Socket,
  gameId: string,
  updateGameState: () => GameState | undefined,
  broadcast: boolean = true,
) => {
  try {
    const gameState = updateGameState();
    if (gameState) {
      console.log("Game state:", gameState);
      if (broadcast) {
        io.to(gameId).emit(ServerEvents.GAME_UPDATED, gameState);
      } else {
        socket.emit(ServerEvents.GAME_UPDATED, gameState);
      }
    }
  } catch (err) {
    socket.emit(ServerEvents.GAME_DNE);
  }
}

io.on('connection', (socket) => {
  console.log("New client connected");
  socket.on('disconnect', () => {
    // TODO: Keep track of client connect/disconnect per player to delete abandoned games
    console.log("Client disconnected");
  });

  socket.on(ClientEvents.CONNECT_TO_GAME, (gameId: string) => {
    console.log(`Received CONNECT_TO_GAME request with args: gameId=${gameId}`);
    updateGameStateWrapper(socket, gameId, () => {
      const gameState = gamesController.getGame(gameId);
      socket.join(gameId);
      console.log(`Connected to game ${gameId}`);
      return gameState;
    }, false);
  });

  socket.on(ClientEvents.JOIN_GAME, (gameId: string, playerName: string, oldName: string) => {
    console.log(`Received JOIN_GAME request with args: gameId=${gameId} playerName=${playerName} oldName=${oldName}`);
    updateGameStateWrapper(socket, gameId, () => {
      if (oldName) {
        gamesController.removePlayer(gameId, oldName);
      }
      return gamesController.addPlayer(gameId, playerName);
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
