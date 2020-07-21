import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'
import { CircularProgress, Typography } from '@material-ui/core';
import MessagePage from '../shared/MessagePage';
import Page from '../shared/Page';
import { GameState } from '../../server-models';
import api from '../../api/api';

const genRandomId = () => {
  const min = 0x10000;
  const max = 0x100000;
  return Math.floor(Math.random() * (max - min) + min).toString(16);
};

const Game = () => {
  const { gameId } = useParams();
  const [gameDne, setGameDne] = useState(false);
  const [gameState, setGameState] = useState<GameState | undefined>();
  const [playerName, setPlayerName] = useState('player_' + genRandomId());

  useEffect(() => {
    const onGameDne = () => setGameDne(true);
    const onGameUpdate = (gameState: GameState) => setGameState(gameState);
    api.createSubscriptions(onGameUpdate, onGameDne);
  }, []);

  useEffect(() => {
    api.joinGame(gameId, playerName);
  }, [gameId, playerName]);

  return gameDne ? (
    <MessagePage>
      <Typography variant="h4" color="secondary">
        Game ID '{gameId}' does not exist!
      </Typography>
    </MessagePage>
  ) : !gameState ? (
    <MessagePage>
      <Typography variant="h4" color="secondary">
        Loading game '{gameId}'...
      </Typography>
      <CircularProgress />
    </MessagePage>
  ) : (
    <Page>
      <p>Game</p>
    </Page>
  );
};

export default Game;
