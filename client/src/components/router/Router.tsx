import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Home from '../home/Home';
import Game from '../game/Game';
import NewGame from '../new-game/NewGame';

const Router = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/new">
          <NewGame />
        </Route>
        <Route path="/game/:gameId">
          <Game />
        </Route>
        <Route path="/">
          <Home />
        </Route>
      </Switch>
    </BrowserRouter>
  );
};

export default Router;
