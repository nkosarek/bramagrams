import express from 'express';
import http from 'http';
import socketIO from 'socket.io';

const port = process.env.PORT || 4001;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.set('port', port);
app.use('/static', express.static(__dirname + '/static'));

// Routing
app.get('/', function(request: any, response: any) {
  response.send("Please go to bramagrams.com");
});

// Starts the server.
server.listen(5000, function() {
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
