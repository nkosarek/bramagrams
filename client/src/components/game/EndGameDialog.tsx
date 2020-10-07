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
  onClose: () => void;
  onRematch: () => void;
}

const EndGameDialog = ({ players, open, onClose, onRematch }: EndGameDialogProps) => {
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

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
    >
      <DialogTitle>{dialogTitle}</DialogTitle>
      {sheWonAgain && (
        <DialogContent>
          <DialogContentText>Of course she did. She always does...</DialogContentText>
        </DialogContent>
      )}
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button onClick={onRematch}>Rematch</Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default EndGameDialog;
