import { GameState } from "@/server/schema";
import { Box, Button, ButtonGroup, Paper, Typography } from "@mui/material";
import { FC, useState } from "react";
import { EndGameButtons } from "./EndGameButtons";
import { GameStartToast, initToastAcked } from "./GameStartToast";
import { SpectatorsList } from "./SpectatorsList";
import { TilePool } from "./TilePool";
import { TypedWord } from "./TypedWord";

const TOP_CORNER_BOX_WIDTH = "20%";

export const ActiveGameHeader: FC<{
  gameState: GameState;
  gameId: string;
  playerName: string;
  disableHandlers: boolean;
}> = ({ gameState, gameId, playerName, disableHandlers }) => {
  const [toastAcked, setToastAcked] = useState(
    initToastAcked(gameState, playerName)
  );

  const playerIdx = gameState.players.findIndex((p) => p.name === playerName);
  const playerState = gameState.players[playerIdx];

  const spectatingPlayers = gameState.players.filter(
    (p) => p.status === "SPECTATING"
  );

  const showEndGameButtons =
    !gameState.numTilesLeft &&
    !!playerState &&
    (playerState.status !== "SPECTATING" || gameState.status === "ENDED");

  return (
    <>
      <GameStartToast
        open={gameState.currPlayerIdx === playerIdx && !toastAcked}
        onClose={() => setToastAcked(true)}
      />
      <Box display="flex" alignItems="flex-start">
        <Box sx={{ p: 1, width: TOP_CORNER_BOX_WIDTH }}>
          <ButtonGroup variant="outlined" color="secondary">
            <Button href="/">Home</Button>
            {/* TODO */}
            {/* <HowToPlayButtonAndDialog hideGameLobby /> */}
          </ButtonGroup>
        </Box>
        <Box
          flexGrow={1}
          width="90%"
          py={2}
          display="flex"
          flexDirection="column"
          alignItems="center"
        >
          <Box mb={2}>
            {showEndGameButtons ? (
              <EndGameButtons
                gameId={gameId}
                playerName={playerName}
                playerState={playerState}
                gameTimeoutTime={gameState.timeoutTime}
              />
            ) : (
              <Typography variant="h5" fontWeight="bold">
                Tiles Left: {gameState.numTilesLeft}
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
            disableHandlers={disableHandlers}
            onTileFlip={() => setToastAcked(true)}
          />
        </Box>
        {/* TODO: Move width up to parent Box */}
        {spectatingPlayers.length ? (
          <Paper
            elevation={3}
            sx={{ width: TOP_CORNER_BOX_WIDTH, m: 1, bgcolor: "primary.dark" }}
          >
            <SpectatorsList
              spectators={spectatingPlayers}
              playerName={playerName}
            />
          </Paper>
        ) : (
          <Box sx={{ width: TOP_CORNER_BOX_WIDTH }}></Box>
        )}
      </Box>
    </>
  );
};
