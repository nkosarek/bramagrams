import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom'
import { CircularProgress, Typography } from '@material-ui/core';
import Cookies from 'universal-cookie';
import MessagePage from '../shared/MessagePage';
import { GameState, GameStatuses, PlayerStatuses } from 'bramagrams-shared';
import api from '../../api/api';
import GameLobby from './GameLobby';
import GameBoard from './GameBoard';
import EndGameDialog from './EndGameDialog';

export const PLAYER_NAME_COOKIE = 'bramagrams-player-name';

const cookies = new Cookies();

interface UrlParams {
  gameId: string;
}

interface GameCookie {
  gameId: string;
  name: string;
}

const updateCookie = (gameId: string, name: string) => {
  const cookie: GameCookie = { gameId, name };
  cookies.remove(PLAYER_NAME_COOKIE);
  cookies.set(PLAYER_NAME_COOKIE, cookie, { path: '/' });
};

const getPlayer = (gameState: GameState, name: string) =>
  gameState.players.find(p => p.name === name);

const Game = () => {
  const { gameId } = useParams<UrlParams>();
  const [gameDne, setGameDne] = useState(false);
  const [gameState, setGameState] = useState<GameState | undefined>();
  const [playerName, setPlayerName] = useState("");
  const [endGameDialogOpen, setEndGameDialogOpen] = useState(false);

  const handleGameUpdate = useRef<(game: GameState) => void>((game) => {});

  const players = gameState?.players || [];
  const canStart = gameState?.status === GameStatuses.WAITING_TO_START &&
    players.length > 1 &&
    players.every(player => player.status === PlayerStatuses.READY_TO_START);

  useEffect(() => {
    handleGameUpdate.current = (gameState: GameState) => {
      setGameState(gameState);
      let name = playerName;
      if (!playerName) {
        const cookie = cookies.get(PLAYER_NAME_COOKIE);
        if (cookie && typeof cookie === 'object' && cookie.name) {
          const cookieNameInGame = getPlayer(gameState, cookie.name);
          if ((cookieNameInGame && gameId === cookie.gameId) || !cookieNameInGame) {
            setPlayerName(cookie.name);
            name = cookie.name;
          }
        }
      }
      const player = getPlayer(gameState, name);
      if (gameState.status === GameStatuses.ENDED &&
          player?.status === PlayerStatuses.ENDED &&
          !endGameDialogOpen) {
        setEndGameDialogOpen(true);
      }
    };
  });

  const onEndGameDialogClosed = () => {
    setEndGameDialogOpen(false);
  };

  const onRematch = () => {
    onEndGameDialogClosed();
    api.readyToStart(gameId, playerName);
  }

  const handleNameClaimed = useCallback((name: string) => {
    setPlayerName(name);
    updateCookie(gameId, name);
  }, [gameId]);

  useEffect(() => {
    const onGameDne = () => setGameDne(true);
    const onGameUpdate = (gameState: GameState) => handleGameUpdate.current(gameState);
    api.initGameSubscriptions(onGameUpdate, onGameDne);
    api.connectToGame(gameId);
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
  ) : gameState.status === GameStatuses.WAITING_TO_START ? (
    <GameLobby
      gameId={gameId}
      playerName={playerName}
      players={players}
      canStart={canStart}
      onNameClaimed={handleNameClaimed}
    />
  ) : (
    <>
      <GameBoard gameState={gameState} gameId={gameId} playerName={playerName} />
      <EndGameDialog
        open={endGameDialogOpen}
        players={players}
        onClose={onEndGameDialogClosed}
        onRematch={onRematch}
      />
    </>
  );
};

export default Game;
