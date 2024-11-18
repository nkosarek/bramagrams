import { GameState } from "@/server/schema";
import { Box } from "@mui/material";
import { FC, useEffect, useState } from "react";
import { EndGameDialog } from "./EndGameDialog";
import { EnterNameDialog } from "./EnterNameDialog";
import { GameBoardHeader } from "./GameBoardHeader";
import { PlayerHand } from "./PlayerHand";

export const GameBoardView: FC<{
  gameState: GameState;
  gameId: string;
  playerName: string;
  onNameClaimed: (name: string) => void;
}> = ({ gameState, gameId, playerName, onNameClaimed }) => {
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

  const playerState = gameState.players.find((p) => p.name === playerName);
  const playerStatus = playerState?.status;

  const isCurrPlayer = (playerIdx: number) =>
    gameState.status === "IN_PROGRESS" &&
    !!gameState.numTilesLeft &&
    playerIdx === gameState.currPlayerIdx;

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
      <GameBoardHeader
        gameState={gameState}
        gameId={gameId}
        playerName={playerName}
        disableHandlers={!playerState}
      />
      <Box flexGrow={1} display="flex" px={3} pb={3}>
        {playingPlayersStartingWithSelf.map(({ player, idx }) => (
          <Box key={idx} width={1 / playingPlayersStartingWithSelf.length}>
            <PlayerHand
              name={player.name}
              words={player.words}
              isSelf={player.name === playerName}
              isCurrPlayer={isCurrPlayer(idx)}
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
