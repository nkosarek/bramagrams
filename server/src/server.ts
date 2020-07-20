import express from 'express';
import http from 'http';
import socketIO from 'socket.io';
import cors from 'cors';
import { ServerEvents, ClientEvents } from './models';
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

io.on('connection', (socket) => {
  console.log("New client connected");
  socket.on('disconnect', () => {
    console.log("Client disconnected");
  });

  socket.on(ClientEvents.JOIN_GAME, (gameId: string, player: string) => {
    try {
      const gameState = gamesController.addPlayer(gameId, player);
      socket.join(gameId);
      io.to(gameId).emit(ServerEvents.GAME_UPDATED, gameState);
    } catch (err) {
      socket.emit(ServerEvents.GAME_DNE);
    }
  });

  socket.on(ClientEvents.READY_TO_START, (gameId: string, player: string) => {
    try {
      const gameState = gamesController.setPlayerReady(gameId, player);
      if (gameState) {
        io.to(gameId).emit(ServerEvents.GAME_UPDATED, gameState);
      }
    } catch (err) {
      socket.emit(ServerEvents.GAME_DNE);
    }
  });

  socket.on(ClientEvents.START_GAME, (gameId: string) => {
    try {
      const gameState = gamesController.startGame(gameId);
      if (gameState) {
        io.to(gameId).emit(ServerEvents.GAME_UPDATED, gameState);
      }
    } catch (err) {
      socket.emit(ServerEvents.GAME_DNE);
    }
  });
});
