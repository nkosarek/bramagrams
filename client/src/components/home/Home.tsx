import React, { useState, FormEvent } from 'react';
import {
  Backdrop,
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  makeStyles,
} from '@material-ui/core';
import { Redirect } from 'react-router-dom';
import api from '../../api/api';
import Page from '../shared/Page';

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
}));

const Home = () => {
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [gameIdToJoin, setGameIdToJoin] = useState("");
  const [gameId, setGameId] = useState("");
  const [loading, setLoading] = useState(false);

  const classes = useStyles();

  const handleNewGame = () => {
    setLoading(true);
    api.createGame()
      .then(setGameId)
      .finally(() => setLoading(false));
  };
  const handleCancelJoin = () => setJoinDialogOpen(false);
  const handleJoinGame = (event: MouseEvent | FormEvent) => {
    event.preventDefault();
    setJoinDialogOpen(false);
    setGameId(gameIdToJoin);
  }

  return gameId ? (
    <Redirect push to={`/game/${gameId}`} />
  ) : (
    <Page>
      <Box
        flexGrow={1}
        display="flex"
        flexDirection="column"
        justifyContent="flex-end"
        paddingBottom="2rem"
      >
        <Typography variant="h2" align="center" color="secondary">
          Bramagrams
        </Typography>
      </Box>
      <Box
        flexGrow={1}
        display="flex"
        flexDirection="column"
        alignItems="center"
        bgcolor="secondary.main"
        paddingTop="2rem"
      >
        <ButtonGroup orientation="vertical">
          <Button onClick={() => handleNewGame()}>
            New Game
          </Button>
          <Button onClick={() => setJoinDialogOpen(true)}>
            Join Game
          </Button>
        </ButtonGroup>
        <Dialog
          open={joinDialogOpen}
          onClose={handleCancelJoin}
        >
          <form onSubmit={handleJoinGame}>
            <DialogTitle>Join Game</DialogTitle>
            <DialogContent>
              <Typography variant="body1" gutterBottom>
                Enter the ID of the game you want to join.
              </Typography>
              <TextField
                value={gameIdToJoin}
                onChange={(event) => setGameIdToJoin(event.target.value)}
                fullWidth
                autoFocus
                placeholder="ex: f005ba11"
                size="small"
                variant="outlined"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancelJoin}>
                Cancel
              </Button>
              <Button
                disabled={!gameIdToJoin}
                onClick={handleJoinGame}
                color="primary"
                type="submit"
              >
                Join
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
      <Backdrop className={classes.backdrop} open={loading}>
        <CircularProgress color="secondary" />
      </Backdrop>
    </Page>
  );
};

export default Home;
