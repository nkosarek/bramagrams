"use client";

import { GameState } from "@/server/schema";
import { GameLobbyView } from "@/ui/game/GameLobbyView";
import { useGameClient } from "@/ui/game/useGameClient";
import { useStoredPlayerName } from "@/ui/game/useStoredPlayerName";
import { Box, CircularProgress, Typography } from "@mui/material";
import { FC, useEffect, useRef, useState } from "react";

const getPlayer = (gameState: GameState | undefined, name: string) =>
  gameState?.players.find((p) => p.name === name);

export const GamePage: FC<{
  gameId: string;
}> = ({ gameId }) => {
  const gameClient = useGameClient();
  const [gameDne, setGameDne] = useState(false);
  const [gameState, setGameState] = useState<GameState | undefined>();
  const { playerName, setPlayerName, onGameStillActive } =
    useStoredPlayerName(gameId);
  const [endGameDialogOpen, setEndGameDialogOpen] = useState(false);
  const [connectedToGame, setConnectedToGame] = useState(false);

  const handleGameUpdate = useRef<(game: GameState) => void>(() => {});

  const players = gameState?.players || [];

  useEffect(() => {
    handleGameUpdate.current = (gameState: GameState) => {
      setGameState(gameState);
      onGameStillActive();
      const player = getPlayer(gameState, playerName);
      if (
        gameState.status === "ENDED" &&
        (!player || ["ENDED", "SPECTATING"].includes(player?.status)) &&
        !endGameDialogOpen
      ) {
        setEndGameDialogOpen(true);
      } else if (gameState.status !== "ENDED" && endGameDialogOpen) {
        setEndGameDialogOpen(false);
      }
      setConnectedToGame(true);
    };
  });

  useEffect(() => {
    const onGameDne = () => setGameDne(true);
    const onGameUpdate = (gameState: GameState) =>
      handleGameUpdate.current(gameState);
    gameClient.initGameSubscriptions({ onGameUpdate, onGameDne });
    gameClient.connectToGame(gameId);
  }, [gameId, gameClient]);

  return gameDne ? (
    <Box
      sx={{
        flexGrow: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Typography variant="h4" color="secondary">
        Game ID {"'"}
        {gameId}
        {"'"} does not exist!
      </Typography>
    </Box>
  ) : !gameState || !connectedToGame ? (
    <Box
      sx={{
        flexGrow: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <CircularProgress />
    </Box>
  ) : gameState.status === "WAITING_TO_START" ? (
    <GameLobbyView
      gameId={gameId}
      playerName={playerName}
      players={players}
      onNameClaimed={setPlayerName}
    />
  ) : (
    <>Game board</>
  );
};
