import React from 'react';
import { Player, PlayerStatuses } from 'bramagrams-shared';
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
} from '@material-ui/core';
import StyledDialog from '../shared/StyledDialog';

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
  let dialogTitle;
  let winners: string[] = [];
  let maxWords = -1;
  players.forEach(player => {
    if (player.status === PlayerStatuses.SPECTATING) {
      return;
    } else if (player.words.length > maxWords) {
      winners = [player.name];
      maxWords = player.words.length;
    } else if (player.words.length === maxWords) {
      winners.push(player.name);
    }
  });
  if (winners.length === 1) {
    dialogTitle = `${winners[0]} wins!`;
  } else {
    dialogTitle = winners.reduce((msg, winner, i) => {
      if (!i) {
        return msg + winner;
      } else if (i === winners.length - 1) {
        return msg + `${winners.length > 2 ? ',' : ''} and ${winner} tied!`;
      } else {
        return msg + `, ${winner}`;
      }
    }, '');
  };

  const sheWonAgain = winners.length === 1 && winners[0].toLowerCase() === 'emily';

  const dialogBody = `You can ${
    !disableRematch ? 'rematch with the current set of players or ' : ''
  }go back to the game lobby to change players.`;

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
    >
      <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          {sheWonAgain && (
            <DialogContentText>Of course she did. She always does...</DialogContentText>
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
