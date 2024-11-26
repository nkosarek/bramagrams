import { GameState } from "@/shared/schema";
import { EndGameButtons } from "@/ui/game/active-game/EndGameButtons";
import {
  GameStartToast,
  initToastAcked,
} from "@/ui/game/active-game/GameStartToast";
import { TilePool } from "@/ui/game/active-game/TilePool";
import { TypedWord } from "@/ui/game/active-game/TypedWord";
import { Box, Container, Typography } from "@mui/material";
import { FC, useEffect, useState } from "react";
import { EndGameDialog } from "./EndGameDialog";
import { EnterNameDialog } from "./EnterNameDialog";
import { PlayerHand } from "./PlayerHand";

export const ActiveGameView: FC<{
  gameState: GameState;
  gameId: string;
  playerName: string;
  onNameClaimed: (name: string) => void;
}> = ({ gameState, gameId, playerName, onNameClaimed }) => {
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

  const showEndGameButtons =
    !gameState.numTilesLeft &&
    !!playerState &&
    (playerState.status !== "SPECTATING" || gameState.status === "ENDED");

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
          open={gameState.currPlayerIdx === playerIdx && !toastAcked}
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
            {showEndGameButtons ? (
              <EndGameButtons
                gameId={gameId}
                playerName={playerName}
                playerState={playerState}
                gameTimeoutTime={gameState.timeoutTime}
              />
            ) : (
              <Typography
                variant="overline"
                fontWeight="bold"
                sx={({ typography: { h6 } }) => ({
                  fontSize: h6.fontSize,
                  lineHeight: h6.lineHeight,
                })}
              >
                {gameState.numTilesLeft} Tiles Left
              </Typography>
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
      <EndGameDialog
        open={!!playerState && endGameDialogOpen}
        gameId={gameId}
        players={gameState.players}
        disableRematch={!playerState || playerState.status === "SPECTATING"}
        onClose={() => setEndGameDialogOpen(false)}
      />
    </>
  );
};
