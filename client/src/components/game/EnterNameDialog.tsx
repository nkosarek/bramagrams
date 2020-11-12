import { Button, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import { Player } from 'bramagrams-shared';
import React, { FormEvent, useEffect, useState } from 'react';
import api from '../../api/api';
import StyledDialog from '../shared/StyledDialog';
import NameInput from '../shared/NameInput';

interface EnterNameDialogProps {
  open: boolean;
  gameId: string;
  playerName: string;
  players: Player[];
  onNameClaimed: (name: string) => void;
}

const EnterNameDialog = ({ open, gameId, playerName, players, onNameClaimed }: EnterNameDialogProps) => {
  const [requestedName, setRequestedName] = useState(playerName);

  const nameAlreadyClaimed = requestedName !== playerName && players.map(p => p.name).includes(requestedName);

  const handleNameSubmitted = (event: MouseEvent | FormEvent) => {
    event.preventDefault();
    if (!requestedName || nameAlreadyClaimed) {
      return;
    }
    api.joinGame(gameId, requestedName);
  };

  useEffect(() => {
    const handleNameClaimed = (name: string) => {
      onNameClaimed(name);
    };
    api.initNameClaimedSubscription(handleNameClaimed);
  }, [onNameClaimed]);

  return (
    <StyledDialog
      open={open}
    >
      <form onSubmit={handleNameSubmitted}>
        <DialogTitle>Choose a name to join as a spectator</DialogTitle>
        <DialogContent>
          <NameInput
            name={requestedName}
            nameAlreadyClaimed={nameAlreadyClaimed}
            fullWidth
            onChange={newName => setRequestedName(newName)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            disabled={!requestedName || nameAlreadyClaimed}
            onClick={handleNameSubmitted}
            color="secondary"
            type="submit"
          >
            Confirm
          </Button>
        </DialogActions>
      </form>
    </StyledDialog>
  )
};

export default EnterNameDialog;
