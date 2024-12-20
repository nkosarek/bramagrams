"use client";

import { GameState } from "@/shared/schema";
import { SidebarMenu } from "@/ui/shared/components/SidebarMenu";
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

  const handleGameUpdate = useRef<(game: GameState) => void>(() => {});

  useEffect(() => {
    handleGameUpdate.current = (gameState: GameState) => {
      setGameState(gameState);
      onGameStillActive();
    };
  }, [onGameStillActive]);

  useEffect(() => {
    gameClient.initGameSubscriptions({
      onGameUpdate: (gameState: GameState) =>
        handleGameUpdate.current(gameState),
      onGameDne: () => setGameDne(true),
    });
    gameClient.connectToGame(gameId);
  }, [gameId, gameClient]);

  return (
    <>
      <Box sx={{ position: "absolute", top: 0, left: 0, zIndex: 1 }}>
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
          <Typography variant="h4">
            Game ID {"'"}
            {gameId}
            {"'"} does not exist!
          </Typography>
        </Box>
      ) : !gameState ? (
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
      ) : gameState.status === "IN_LOBBY" ? (
        <GameLobbyView
          gameId={gameId}
          playerName={playerName}
          gameState={gameState}
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
