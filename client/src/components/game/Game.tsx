import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'
import { CircularProgress, Typography } from '@material-ui/core';
import Cookies from 'universal-cookie';
import MessagePage from '../shared/MessagePage';
import Page from '../shared/Page';
import { GameState, GameStatuses, PlayerStatuses } from '../../server-models';
import api from '../../api/api';
import GameLobby from './GameLobby';
import GameBoard from './GameBoard';

export const PLAYER_NAME_COOKIE = 'bramagrams-player-name';

const cookies = new Cookies();

const updateCookie = (newValue: string) => {
  cookies.remove(PLAYER_NAME_COOKIE);
  cookies.set(PLAYER_NAME_COOKIE, newValue);
};

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

  const handleNameClaimed = (newName: string, oldName: string) => {
    setPlayerName(newName);
    updateCookie(newName);
    api.joinGame(gameId, newName, oldName);
  };

  useEffect(() => {
    const onGameDne = () => setGameDne(true);
    const onGameUpdate = (gameState: GameState) => setGameState(gameState);
    api.createSubscriptions(onGameUpdate, onGameDne);
    api.connectToGame(gameId);
    const cookiePlayerName = cookies.get(PLAYER_NAME_COOKIE);
    if (cookiePlayerName && typeof cookiePlayerName === 'string') {
      setPlayerName(cookiePlayerName);
    }
  }, [gameId]);

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
      onNameClaimed={(newName, oldName) => handleNameClaimed(newName, oldName)}
      onGameDne={() => setGameDne(true)}
    />
  ) : gameStatus === GameStatuses.IN_PROGRESS ? (
    <GameBoard gameState={gameState} gameId={gameId} playerName={playerName} />
  ) : (
    <Page>
      <p>Done</p>
    </Page>
  );
};

export default Game;
