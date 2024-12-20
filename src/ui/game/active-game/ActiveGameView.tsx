import { GameStateEnded, GameStateInProgress } from "@/shared/schema";
import { exhaustiveSwitchCheck } from "@/shared/utils/exhaustiveSwitchCheck";
import {
  GameStartToast,
  initToastAcked,
} from "@/ui/game/active-game/GameStartToast";
import { TilePool } from "@/ui/game/active-game/TilePool";
import { TypedWord } from "@/ui/game/active-game/TypedWord";
import { useGameClient } from "@/ui/game/useGameClient";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { FC, PropsWithChildren, useEffect, useState } from "react";
import { EndGameDialog } from "./EndGameDialog";
import { EnterNameDialog } from "./EnterNameDialog";
import { PlayerHand } from "./PlayerHand";

export const ActiveGameView: FC<{
  gameState: GameStateInProgress | GameStateEnded;
  gameId: string;
  playerName: string;
  onNameClaimed: (name: string) => void;
}> = ({ gameState, gameId, playerName, onNameClaimed }) => {
  const gameClient = useGameClient();
  const [toastAcked, setToastAcked] = useState(
    initToastAcked(gameState, playerName)
  );
  const [endGameDialogOpen, setEndGameDialogOpen] = useState(false);

  // Save each player's original index into the players list before filtering out spectators and reordering
  const playingPlayers = gameState.players
    .map((player, idx) => ({ player, idx }))
    .filter((p) => p.player.status !== "SPECTATING");
  const selfIdx = playingPlayers.findIndex((p) => p.player.name === playerName);
  const playingPlayersStartingWithSelf =
    selfIdx < 0
      ? playingPlayers
      : [...playingPlayers.slice(selfIdx), ...playingPlayers.slice(0, selfIdx)];

  const playerIdx = gameState.players.findIndex((p) => p.name === playerName);
  const playerState = gameState.players[playerIdx];
  const playerStatus = playerState?.status;

  useEffect(() => {
    if (
      gameState.status === "ENDED" &&
      (!playerStatus || ["ENDED", "SPECTATING"].includes(playerStatus))
    ) {
      setEndGameDialogOpen(true);
    } else if (gameState.status !== "ENDED") {
      setEndGameDialogOpen(false);
    }
  }, [gameState.status, playerStatus]);

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <GameStartToast
          open={
            gameState.status === "IN_PROGRESS" &&
            gameState.currPlayerIdx === playerIdx &&
            !toastAcked
          }
          onClose={() => setToastAcked(true)}
        />
        <Container
          maxWidth="md"
          sx={{
            my: 2,
            mx: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box sx={{ mb: 1.5, height: "40px" }}>
            {gameState.status === "IN_PROGRESS" &&
            !gameState.numTilesLeft &&
            gameState.players[playerIdx] &&
            gameState.players[playerIdx].status !== "SPECTATING" ? (
              <GameCanEndControlButtons
                gameId={gameId}
                playerName={playerName}
                playerStatus={gameState.players[playerIdx].status}
                gameTimeoutTime={gameState.endgameTimeoutTime}
              />
            ) : gameState.status === "IN_PROGRESS" ? (
              <GameHeaderTypography>
                {gameState.numTilesLeft} Tiles Left
              </GameHeaderTypography>
            ) : gameState.status === "ENDED" ? (
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  onClick={() => gameClient.backToLobby(gameId)}
                >
                  Go Back to Lobby
                </Button>
                <Button
                  variant="contained"
                  disabled={!playerState || playerState.status === "SPECTATING"}
                  onClick={() => gameClient.rematch(gameId)}
                >
                  Rematch
                </Button>
              </Stack>
            ) : (
              exhaustiveSwitchCheck(gameState)
            )}
          </Box>
          <Box flexGrow={1} display="flex" pb={3}>
            <TilePool
              letters={gameState.tiles || []}
              disabled={gameState.status === "ENDED"}
            />
          </Box>
          <TypedWord
            gameState={gameState}
            gameId={gameId}
            playerName={playerName}
            disableHandlers={!playerState}
            onTileFlip={() => setToastAcked(true)}
          />
        </Container>
      </Box>
      <Box flexGrow={1} display="flex" px={3} pb={3}>
        {playingPlayersStartingWithSelf.map(({ player, idx }) => (
          <Box key={idx} width={1 / playingPlayersStartingWithSelf.length}>
            <PlayerHand
              name={player.name}
              words={player.words}
              isSelf={player.name === playerName}
              isCurrPlayer={
                gameState.status === "IN_PROGRESS" &&
                !!gameState.numTilesLeft &&
                idx === gameState.currPlayerIdx
              }
              isReady={player.status === "READY_TO_END"}
              disabled={gameState.status === "ENDED"}
              small={playingPlayersStartingWithSelf.length > 2}
            />
          </Box>
        ))}
      </Box>
      <EnterNameDialog
        open={!playerState}
        gameId={gameId}
        playerName={playerName}
        players={gameState.players}
        onNameClaimed={onNameClaimed}
      />
      {gameState.status === "ENDED" && (
        <EndGameDialog
          open={!!playerState && endGameDialogOpen}
          gameId={gameId}
          players={gameState.players}
          disableRematch={!playerState || playerState.status === "SPECTATING"}
          onClose={() => setEndGameDialogOpen(false)}
        />
      )}
    </>
  );
};

const GameHeaderTypography: FC<PropsWithChildren> = ({ children }) => (
  <Typography
    variant="overline"
    fontWeight="bold"
    sx={({ typography: { h6 } }) => ({
      fontSize: h6.fontSize,
      lineHeight: h6.lineHeight,
    })}
  >
    {children}
  </Typography>
);

const calculateMsLeft = (
  gameTimeoutTime: string | null
): number | undefined => {
  if (!gameTimeoutTime) return;
  const msLeft = new Date(gameTimeoutTime).getTime() - Date.now();
  return msLeft > 0 ? msLeft : 0;
};

const GameCanEndControlButtons: FC<{
  gameId: string;
  playerName: string;
  playerStatus: "PLAYING" | "READY_TO_END";
  gameTimeoutTime: string | null;
}> = ({ gameId, playerName, playerStatus, gameTimeoutTime }) => {
  const gameClient = useGameClient();
  const [msLeft, setMsLeft] = useState<number | undefined>(
    calculateMsLeft(gameTimeoutTime)
  );

  useEffect(() => {
    if (!gameTimeoutTime) {
      setMsLeft(undefined);
      return;
    }

    setMsLeft(calculateMsLeft(gameTimeoutTime));
    const interval = setInterval(
      () => setMsLeft(calculateMsLeft(gameTimeoutTime)),
      500
    );
    return () => clearInterval(interval);
  }, [gameTimeoutTime]);

  return (
    <Stack
      direction="row"
      spacing={3}
      sx={{ display: "flex", alignItems: "center" }}
    >
      {playerStatus === "PLAYING" ? (
        <Button
          variant="contained"
          onClick={() => gameClient.readyToEnd(gameId, playerName)}
        >
          I can{"'"}t find any more words
        </Button>
      ) : playerStatus === "READY_TO_END" ? (
        <Button
          variant="contained"
          onClick={() => gameClient.notReadyToEnd(gameId, playerName)}
        >
          No wait
        </Button>
      ) : (
        exhaustiveSwitchCheck(playerStatus)
      )}

      {msLeft !== undefined && (
        <GameHeaderTypography>{Math.ceil(msLeft / 1000)}</GameHeaderTypography>
      )}
    </Stack>
  );
};
