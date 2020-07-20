import express from 'express';
import http from 'http';
import socketIO from 'socket.io';
import { GameState, GamesMap } from './models';

const port = process.env.PORT || 4001;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const generateGameId = () => {
  const min = 0x10000000;
  const max = 0x100000000;
  return (Math.floor(Math.random() * (max - min)) + min).toString(16);
};

const games: GamesMap = {};

app.set('port', port);

// Routing
app.get('/', function(req: express.Request, res: express.Response) {
  res.send("Please go to bramagrams.com");
});

app.post('/games', (req: express.Request, res: express.Response) => {
  console.log("Received request to create game");
  let id: string;
  let count: number = 0;
  do {
    if (++count > 5) {
      res.status(500).send("ERROR: Failed to create a unique game ID\n");
      return;
    }
    id = generateGameId();
  } while (games[id]);
  games[id] = new GameState(id);
  console.log(`Created game ${id}`);
  res.send(id);
});

// Starts the server.
server.listen(port, function() {
  console.log(`Starting server on port ${port}`);
});

let interval: NodeJS.Timeout;

io.on("connection", (socket) => {
  console.log("New client connected");
  if (interval) {
    clearInterval(interval);
  }
  interval = setInterval(() => getApiAndEmit(socket), 1000);
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    clearInterval(interval);
  });
});

const getApiAndEmit = (socket: socketIO.Socket) => {
  const response = new Date();
  // Emitting a new message. Will be consumed by the client
  socket.emit("FromAPI", response);
};
