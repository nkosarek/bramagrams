import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Home from '../home/Home';
import Game from '../game/Game';
import { JoinGamePage } from '../join-game/JoinGamePage';

const Router = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/game/:gameId">
          <Game />
        </Route>
        <Route path="/public-games">
          <JoinGamePage />
        </Route>
        <Route path="/">
          <Home />
        </Route>
      </Switch>
    </BrowserRouter>
  );
};

export default Router;
