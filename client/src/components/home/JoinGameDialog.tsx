import React, { useState, FormEvent } from 'react';
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@material-ui/core';
import StyledDialog from '../shared/StyledDialog';

interface JoinGameDialogProps {
  open: boolean;
  onCancel: () => void;
  onJoin: (gameId: string) => void;
}

const JoinGameDialog = ({ open, onCancel, onJoin }: JoinGameDialogProps) => {
  const [gameId, setGameId] = useState('');

  const handleJoinGame = (event: MouseEvent | FormEvent) => {
    event.preventDefault();
    onJoin(gameId);
  };

  return (
    <StyledDialog
      open={open}
      onClose={onCancel}
    >
      <form onSubmit={handleJoinGame}>
        <DialogTitle>Join Game</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Paste the link of the game you want to join into the address bar
          </Typography>
          <Box ml={2}><Typography variant="body1" gutterBottom>or</Typography></Box>
          <Typography variant="body1" gutterBottom>
            Enter the game's ID and click JOIN.
          </Typography>
          <TextField
            value={gameId}
            onChange={(event) => setGameId(event.target.value)}
            fullWidth
            autoFocus
            color="secondary"
            placeholder="ex: f005ba11"
            size="small"
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel}>
            Cancel
          </Button>
          <Button
            disabled={!gameId}
            onClick={handleJoinGame}
            color="primary"
            type="submit"
          >
            Join
          </Button>
        </DialogActions>
      </form>
    </StyledDialog>
  );
};

export default JoinGameDialog;
