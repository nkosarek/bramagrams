"use client";

import { GameState } from "@/server/schema";
import { SidebarMenu } from "@/ui/game/SidebarMenu";
import { Box, CircularProgress, Typography } from "@mui/material";
import { FC, useEffect, useRef, useState } from "react";
import { ActiveGameView } from "./active-game/ActiveGameView";
import { GameLobbyView } from "./GameLobbyView";
import { useGameClient } from "./useGameClient";
import { useStoredPlayerName } from "./useStoredPlayerName";

export const GamePage: FC<{
  gameId: string;
}> = ({ gameId }) => {
  const gameClient = useGameClient();
  const [gameDne, setGameDne] = useState(false);
  const [gameState, setGameState] = useState<GameState | undefined>();
  const { playerName, setPlayerName, onGameStillActive } =
    useStoredPlayerName(gameId);
  const [connectedToGame, setConnectedToGame] = useState(false);

  const handleGameUpdate = useRef<(game: GameState) => void>(() => {});

  const players = gameState?.players || [];

  useEffect(() => {
    handleGameUpdate.current = (gameState: GameState) => {
      setGameState(gameState);
      onGameStillActive();
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

  return (
    <>
      <Box sx={{ mt: 1, ml: 1, position: "absolute", top: 0, left: 0 }}>
        <SidebarMenu gameState={gameState} />
      </Box>
      {gameDne ? (
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
        <ActiveGameView
          gameState={gameState}
          gameId={gameId}
          playerName={playerName}
          onNameClaimed={setPlayerName}
        />
      )}
    </>
  );
};
