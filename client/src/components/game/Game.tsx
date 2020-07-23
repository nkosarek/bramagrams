import React, { useState, useEffect, useCallback } from 'react';
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

interface GameCookie {
  gameId: string;
  name: string;
}

const updateCookie = (gameId: string, name: string) => {
  const cookie: GameCookie = { gameId, name };
  cookies.remove(PLAYER_NAME_COOKIE);
  cookies.set(PLAYER_NAME_COOKIE, cookie, { path: '/' });
};

const Game = () => {
  const { gameId } = useParams();
  const [gameDne, setGameDne] = useState(false);
  const [gameState, setGameState] = useState<GameState | undefined>();
  const [playerName, setPlayerName] = useState("");
  const handleNameClaimed = useCallback((name: string) => {
    setPlayerName(name);
    updateCookie(gameId, name);
  }, [gameId]);

  const players = gameState?.players || [];
  const canStart = gameState?.status === GameStatuses.WAITING_TO_START &&
    players.length > 1 &&
    players.every(player => player.status === PlayerStatuses.READY_TO_START);


  useEffect(() => {
    const onGameDne = () => setGameDne(true);
    const onGameUpdate = (gameState: GameState) => setGameState(gameState);
    api.initGameSubscriptions(onGameUpdate, onGameDne);
    api.connectToGame(gameId);
  }, [gameId]);

  useEffect(() => {
    if (playerName || !gameState) {
      return;
    }
    const cookie = cookies.get(PLAYER_NAME_COOKIE);
    if (cookie && typeof cookie === 'object' && cookie.name) {
      const cookieNameInGame = gameState.players.find(p => p.name === cookie.name);
      if ((cookieNameInGame && gameId === cookie.gameId) || !cookieNameInGame) {
        setPlayerName(cookie.name);
      }
    }
  }, [gameId, gameState, playerName]);

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
  ) : gameState.status === GameStatuses.WAITING_TO_START ? (
    <GameLobby
      gameId={gameId}
      playerName={playerName}
      players={players}
      canStart={canStart}
      onNameClaimed={handleNameClaimed}
    />
  ) : gameState.status === GameStatuses.IN_PROGRESS ? (
    <GameBoard gameState={gameState} gameId={gameId} playerName={playerName} />
  ) : (
    <Page>
      <p>Done</p>
    </Page>
  );
};

export default Game;
