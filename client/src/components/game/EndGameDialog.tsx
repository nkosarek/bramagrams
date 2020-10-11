import React from 'react';
import { Player } from 'bramagrams-shared';
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
} from '@material-ui/core';
import StyledDialog from '../shared/StyledDialog';
import WinnerHandler from '../../util/winnerHandler';

interface EndGameDialogProps {
  players: Player[];
  open: boolean;
  disableRematch: boolean;
  onClose: () => void;
  onRematch: () => void;
  onBackToLobby: () => void;
}

const EndGameDialog = ({
  players,
  open,
  disableRematch,
  onClose,
  onRematch,
  onBackToLobby
}: EndGameDialogProps) => {
  const handler = new WinnerHandler(players);

  const dialogBody = `You can ${
    !disableRematch ? 'rematch with the current set of players or ' : ''
  }go back to the game lobby to change players.`;

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
    >
      <DialogTitle>{handler.winnersString}</DialogTitle>
        <DialogContent>
          {handler.winnersSubtext && (
            <DialogContentText>{handler.winnersSubtext}</DialogContentText>
          )}
          <DialogContentText>
            {dialogBody}
          </DialogContentText>
        </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button disabled={disableRematch} onClick={onRematch}>Rematch</Button>
        <Button onClick={onBackToLobby}>Change Players</Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default EndGameDialog;
