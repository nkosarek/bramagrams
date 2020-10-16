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

const getPlayer = (gameState: GameState | undefined, name: string) =>
  gameState?.players.find(p => p.name === name);

const Game = () => {
  const { gameId } = useParams<UrlParams>();
  const [gameDne, setGameDne] = useState(false);
  const [gameState, setGameState] = useState<GameState | undefined>();
  const [playerName, setPlayerName] = useState("");
  const [endGameDialogOpen, setEndGameDialogOpen] = useState(false);
  const [connectedToGame, setConnectedToGame] = useState(false);

  const handleGameUpdate = useRef<(game: GameState) => void>((game) => {});

  const players = gameState?.players || [];
  const playerState = getPlayer(gameState, playerName);

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
          (!player || [PlayerStatuses.ENDED, PlayerStatuses.SPECTATING].includes(player?.status)) &&
          !endGameDialogOpen) {
        setEndGameDialogOpen(true);
      } else if (gameState.status !== GameStatuses.ENDED && endGameDialogOpen) {
        setEndGameDialogOpen(false);
      }
      setConnectedToGame(true);
    };
  });

  const onEndGameDialogClosed = () => {
    setEndGameDialogOpen(false);
  };

  const onRematch = () => {
    onEndGameDialogClosed();
    api.rematch(gameId);
  }

  const onBackToLobby = () => {
    onEndGameDialogClosed();
    api.backToLobby(gameId);
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
    <MessagePage showHomeButton>
      <Typography variant="h4" color="secondary">
        Game ID '{gameId}' does not exist!
      </Typography>
    </MessagePage>
  ) : !gameState || !connectedToGame ? (
    <MessagePage>
      <CircularProgress />
    </MessagePage>
  ) : gameState.status === GameStatuses.WAITING_TO_START ? (
    <GameLobby
      gameId={gameId}
      playerName={playerName}
      players={players}
      onNameClaimed={handleNameClaimed}
    />
  ) : (
    <>
      <GameBoard gameState={gameState} gameId={gameId} playerName={playerName} />
      <EndGameDialog
        open={endGameDialogOpen}
        players={players}
        disableRematch={!playerState || playerState.status === PlayerStatuses.SPECTATING}
        onClose={onEndGameDialogClosed}
        onRematch={onRematch}
        onBackToLobby={onBackToLobby}
      />
    </>
  );
};

export default Game;
