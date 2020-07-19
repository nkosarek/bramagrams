import React, { useState, useEffect } from 'react';
import socketIOClient from 'socket.io-client';
import logo from './logo.svg';
import './App.css';

const SERVER_URL = "http://127.0.0.1:4001";

function App() {
  const [response, setResponse] = useState("");

  useEffect(() => {
    console.log("connecting");
    const socket = socketIOClient(SERVER_URL);
    socket.on("FromAPI", (data: string) => {
      setResponse(data);
    });
    // TODO: remove listener
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Message from server: {response}
        </p>
      </header>
    </div>
  );
}

export default App;
