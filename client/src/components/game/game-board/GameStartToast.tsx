import React from 'react';
import { GameState, PlayerStatuses } from 'bramagrams-shared';
import { IconButton, Slide, Snackbar } from '@material-ui/core';
import { Close } from '@material-ui/icons';

export const initToastAcked = (game: GameState, name: string): boolean => {
  const playerIdx = game.players.findIndex(p => p.name === name);
  const tilesFlipped = game.totalTiles - game.numTilesLeft;
  const numPlayingPlayers = game.players.reduce((count, p) =>
    count += p.status !== PlayerStatuses.SPECTATING ? 1 : 0,
    0);
  return playerIdx >= 0 &&
    game.players[playerIdx].status !== PlayerStatuses.SPECTATING &&
    tilesFlipped >= numPlayingPlayers;
};

interface GameStartToastProps {
  open: boolean;
  onClose: () => void;
}

const GameStartToast = ({ open, onClose }: GameStartToastProps) => (
  <Snackbar
    open={open}
    TransitionComponent={Slide}
    anchorOrigin={{
      vertical: 'top',
      horizontal: 'left',
    }}
    message="Press the space bar to flip a tile!"
    action={
      <IconButton onClick={onClose} color="inherit">
        <Close />
      </IconButton>
    }
  />
);

export default GameStartToast;
