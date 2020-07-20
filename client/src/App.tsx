import React, { useState, useEffect } from 'react';
import socketIOClient from 'socket.io-client';
import Router from './components/router/Router';
import AppThemeProvider from './components/theme/AppThemeProvider';

const SERVER_URL = "http://127.0.0.1:4001";

function App() {
  // const [response, setResponse] = useState("");

  // useEffect(() => {
  //   console.log("connecting");
  //   const socket = socketIOClient(SERVER_URL);
  //   socket.on("FromAPI", (data: string) => {
  //     setResponse(data);
  //   });
  //   // TODO: remove listener
  // }, []);

  return (
    <AppThemeProvider>
      <Router />
    </AppThemeProvider>
    // <div className="App">
    //   <header className="App-header">
    //     <img src={logo} className="App-logo" alt="logo" />
    //     <p>
    //       Message from server: {response}
    //     </p>
    //   </header>
    // </div>
  );
}

export default App;
