import express from 'express';
import http from 'http';
import socketIO from 'socket.io';

let app = express();
let server = new http.Server(app);
let io = socketIO(server);

app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));

// Routing
app.get('/', function(request: any, response: any) {
  response.send("Please go to bramagrams.com");
});

// Starts the server.
server.listen(5000, function() {
  console.log('Starting server on port 5000');
});
