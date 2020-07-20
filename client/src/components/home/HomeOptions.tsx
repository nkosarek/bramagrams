import React, { useState } from 'react';
import {
  Button,
  ButtonGroup,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@material-ui/core';

const HomeOptions = () => {
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [gameId, setGameId] = useState("");

  const handleCancel = () => setJoinDialogOpen(false);

  // TODO: add form submit to dialog
  return (
    <>
      <ButtonGroup orientation="vertical">
        <Button href="/new">
          New Game
        </Button>
        <Button onClick={() => setJoinDialogOpen(true)}>
          Join Game
        </Button>
      </ButtonGroup>
      <Dialog
        open={joinDialogOpen}
        onClose={handleCancel}
      >
        <DialogTitle>Join Game</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Enter the ID of the game you want to join.
          </Typography>
          <TextField
            value={gameId}
            onChange={(event) => setGameId(event.target.value)}
            fullWidth
            autoFocus
            placeholder="ex: f005ba11"
            size="small"
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            disabled={!gameId}
            href={`/game/${gameId}`}
            color="primary"
            type="submit"
          >
            Join
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default HomeOptions;
