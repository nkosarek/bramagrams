import express, { Request, Response } from 'express';
import http from 'http';
import socketIO from 'socket.io';
import path from 'path';
import cors from 'cors';
import { ServerEvents, ClientEvents, GameState, PlayerWord } from 'bramagrams-shared';
import { GamesController } from './game-controller';

export const isRunningInDev = () => process.env.NODE_ENV === 'development';

const port = process.env.PORT || 5000;

const gamesController = new GamesController();

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

isRunningInDev() && app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.static(path.join(__dirname, "..", "..", "client", "build")));
app.use(express.json());
app.set('port', port);

// Routing
app.get('/api/public-games', (req, res) => {
  console.log("Received request to get public games");
  res.status(200).send(gamesController.getPublicGames());
});

app.post('/api/games', (req: Request, res: Response) => {
  console.log("Received request to create game: body=", req.body);
  const id = gamesController.createGame(req.body?.gameConfig);
  if (!id) {
    res.status(500).send("ERROR: Failed to create a unique game ID\n");
    return;
  }
  console.log("Created game", id);
  res.status(201).send(id);
});

app.all('/api/*', (req, res) => {
  res.status(404).send("Server endpoint not found");
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, "..", "..", "client", "build", "index.html"));
});

app.all('*', (req, res) => res.sendStatus(404));

// Starts the server.
server.listen(port, () => {
  console.log("Starting server on port", port);
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
    } else {
      console.log("State not updated");
    }
  } catch (err) {
    socket.emit(ServerEvents.GAME_DNE);
    console.log(err);
  }
}

io.on('connection', (socket) => {
  console.log("New client connected");
  socket.on('disconnect', () => {
    // TODO: Keep track of client connect/disconnect per player to delete abandoned games
    console.log("Client disconnected");
  });

  socket.on(ClientEvents.CONNECT_TO_GAME, (gameId: string) => {
    console.log("Received CONNECT_TO_GAME request with args: gameId=", gameId);
    updateGameStateWrapper(socket, gameId, () => {
      const { clientGameState: gameState } = gamesController.getGame(gameId);
      socket.join(gameId);
      console.log(`Connected to game ${gameId}`);
      return gameState;
    }, false);
  });

  socket.on(ClientEvents.JOIN_GAME, (gameId: string, playerName: string) => {
    console.log("Received JOIN_GAME request with args: gameId=", gameId,
      "playerName=", playerName);
    updateGameStateWrapper(socket, gameId, () => {
      const game = gamesController.addPlayer(gameId, playerName);
      if (game) {
        socket.emit(ServerEvents.NAME_CLAIMED, playerName);
      }
      return game;
    });
  });

  socket.on(ClientEvents.CHANGE_NAME, (gameId: string, newName: string, oldName: string) => {
    console.log("Received CHANGE_NAME request with args: gameId=", gameId,
      "newName=", newName, "oldName=", oldName);
    updateGameStateWrapper(socket, gameId, () => {
      const game = gamesController.renamePlayer(gameId, newName, oldName);
      if (game) {
        socket.emit(ServerEvents.NAME_CLAIMED, newName);
      }
      return game;
    });
  });

  socket.on(ClientEvents.BECOME_SPECTATOR, (gameId: string, player: string) => {
    console.log("Received BECOME_SPECTATOR request with args: gameId=", gameId, "player=", player);
    updateGameStateWrapper(socket, gameId, () =>
      gamesController.setPlayerSpectating(gameId, player));
  });

  socket.on(ClientEvents.READY_TO_START, (gameId: string, player: string) => {
    console.log("Received READY_TO_START request with args: gameId=", gameId, "player=", player);
    updateGameStateWrapper(socket, gameId, () =>
      gamesController.setPlayerReadyToStart(gameId, player));
  });

  socket.on(ClientEvents.START_GAME, (gameId: string) => {
    console.log("Received START_GAME request with args: gameId=", gameId);
    updateGameStateWrapper(socket, gameId, () => gamesController.startGame(gameId));
  });

  socket.on(ClientEvents.ADD_TILE, (gameId: string, player: string) => {
    console.log("Received ADD_TILE request with args: gameId=", gameId, "player=", player);
    updateGameStateWrapper(socket, gameId, () => {
      const onEndgameTimerDone = (gameId: string, game: GameState) => {
        io.to(gameId).emit(ServerEvents.GAME_UPDATED, game);
      }
      return gamesController.addTile(gameId, player, onEndgameTimerDone);
    });
  });

  socket.on(ClientEvents.CLAIM_WORD,
    (gameId: string, player: string, newWord: string, wordsToClaim?: PlayerWord[]) => {
      console.log("Received CLAIM_WORD request with args: gameId=", gameId,
        "player=", player, "newWord=", newWord, "wordsToClaim=", wordsToClaim);
      updateGameStateWrapper(socket, gameId, () => {
        const game = gamesController.claimWord(gameId, player, newWord, wordsToClaim);
        if (game) {
          socket.emit(ServerEvents.WORD_CLAIMED, true, newWord);
        } else {
          socket.emit(ServerEvents.WORD_CLAIMED, false, newWord);
        }
        return game;
      });
  });

  socket.on(ClientEvents.READY_TO_END, (gameId: string, player: string) => {
    console.log("Received READY_TO_END request with args: gameId=", gameId, "player=", player);
    updateGameStateWrapper(socket, gameId, () =>
      gamesController.setPlayerReadyToEnd(gameId, player));
  });

  socket.on(ClientEvents.NOT_READY_TO_END, (gameId: string, player: string) => {
    console.log("Received NOT_READY_TO_END request with args: gameId=", gameId,
      "player=", player);
    updateGameStateWrapper(socket, gameId, () =>
      gamesController.setPlayerNotReadyToEnd(gameId, player));
  });

  socket.on(ClientEvents.REMATCH, (gameId: string) => {
    console.log("Received REMATCH request with args: gameId=", gameId);
    updateGameStateWrapper(socket, gameId, () => gamesController.rematch(gameId));
  });

  socket.on(ClientEvents.BACK_TO_LOBBY, (gameId: string) => {
    console.log("Received BACK_TO_LOBBY request with args: gameId=", gameId);
    updateGameStateWrapper(socket, gameId, () => gamesController.backToLobby(gameId));
  });
});
