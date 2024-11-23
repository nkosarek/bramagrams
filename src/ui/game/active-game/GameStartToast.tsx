import { GameState } from "@/shared/schema";
import { Close } from "@mui/icons-material";
import { IconButton, Slide, Snackbar } from "@mui/material";
import { FC } from "react";

export const initToastAcked = (
  game: GameState,
  playerName: string
): boolean => {
  const player = game.players.find((p) => p.name === playerName);
  const tilesFlipped = game.totalTiles - game.numTilesLeft;
  const numPlayingPlayers = game.players.reduce(
    (count, p) => (count += p.status !== "SPECTATING" ? 1 : 0),
    0
  );
  return (
    !!player &&
    player.status !== "SPECTATING" &&
    tilesFlipped >= numPlayingPlayers
  );
};

export const GameStartToast: FC<{
  open: boolean;
  onClose: () => void;
}> = ({ open, onClose }) => {
  return (
    <Snackbar
      open={open}
      TransitionComponent={Slide}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      message="Press the space bar to flip a tile!"
      action={
        <IconButton onClick={onClose} color="inherit">
          <Close />
        </IconButton>
      }
    />
  );
};
