import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'
import { Box, CircularProgress, Typography } from '@material-ui/core';
import MessagePage from '../shared/MessagePage';
import Page from '../shared/Page';
import { GameState, GameStatuses, PlayerStatuses } from '../../server-models';
import api from '../../api/api';
import TilePool from './TilePool';
import GameLobby from './GameLobby';

const Game = () => {
  const { gameId } = useParams();
  const [gameDne, setGameDne] = useState(false);
  const [gameState, setGameState] = useState<GameState | undefined>();
  const [playerName, setPlayerName] = useState("");

  const gameStatus = gameState?.status;
  const players = (gameState && Object.values(gameState.players)) || [];
  const canStart = gameState?.status === GameStatuses.WAITING_TO_START &&
    players.length > 1 &&
    players.every(player => player.status === PlayerStatuses.READY_TO_START);

  useEffect(() => {
    const onGameDne = () => setGameDne(true);
    const onGameUpdate = (gameState: GameState) => {
      console.log("State update:", gameState);
      setGameState(gameState);
    }
    api.createSubscriptions(onGameUpdate, onGameDne);
    api.connectToGame(gameId);
  }, [gameId]);

  useEffect(() => {
    if (playerName) {
      window.addEventListener('keydown', (event) => {
        if (event.charCode === 32 || event.keyCode === 32) {
          api.addTile(gameId, playerName);
        }
      });
    }
  }, [gameId, playerName]);

  return gameDne ? (
    <MessagePage>
      <Typography variant="h4" color="secondary">
        Game ID '{gameId}' does not exist!
      </Typography>
    </MessagePage>
  ) : !gameState ? (
    <MessagePage>
      <CircularProgress />
    </MessagePage>
  ) : gameStatus === GameStatuses.WAITING_TO_START ? (
    <GameLobby
      gameId={gameId}
      playerName={playerName}
      players={players}
      canStart={canStart}
      onNameClaimed={(name) => setPlayerName(name)}
      onGameDne={() => setGameDne(true)}
    />
  ) : gameStatus === GameStatuses.IN_PROGRESS ? (
    <Page>
      <Box px="10%" py={2} display="flex" justifyContent="center">
        <TilePool letters={gameState?.tiles || []} />
      </Box>
    </Page>
  ) : (
    <Page>
      <p>Done</p>
    </Page>
  );
};

export default Game;
