import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'
import { Box, Button, CircularProgress, Typography } from '@material-ui/core';
import MessagePage from '../shared/MessagePage';
import Page from '../shared/Page';
import { GameState, GameStatuses } from '../../server-models';
import api from '../../api/api';
import TilePool from './TilePool';

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

  const letters = (gameState && gameState.tiles) || [];
  const gameStatus = gameState && gameState.status;

  useEffect(() => {
    const onGameDne = () => setGameDne(true);
    const onGameUpdate = (gameState: GameState) => setGameState(gameState);
    api.createSubscriptions(onGameUpdate, onGameDne);
  }, []);

  useEffect(() => {
    api.joinGame(gameId, playerName);
    window.addEventListener('keydown', (event) => {
      if (event.charCode === 32 || event.keyCode === 32) {
        api.addTile(gameId, playerName);
      }
    });
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
  ) : gameStatus === GameStatuses.WAITING_TO_START ? (
    <Page>
      <Button onClick={() => api.readyToStart(gameId, playerName)}>Ready</Button>
      <Button onClick={() => api.startGame(gameId)}>Start</Button>
    </Page>
  ) : gameStatus === GameStatuses.IN_PROGRESS ? (
    <Page>
      <Box px="10%" py={2} display="flex" justifyContent="center">
        <TilePool letters={letters} />
      </Box>
    </Page>
  ) : (
    <Page>
      <p>Done</p>
    </Page>
  );
};

export default Game;
