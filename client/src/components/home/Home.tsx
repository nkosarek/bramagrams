import React, { useState } from 'react';
import {
  Backdrop,
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  Typography,
  makeStyles,
} from '@material-ui/core';
import { Redirect } from 'react-router-dom';
import api from '../../api/api';
import Page from '../shared/Page';
import JoinGameDialog from './JoinGameDialog';
import HowToPlayDialog from './HowToPlayDialog';

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
}));

const Home = () => {
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [howToPlayDialogOpen, setHowToPlayDialogOpen] = useState(false);
  const [gameId, setGameId] = useState("");
  const [loading, setLoading] = useState(false);

  const classes = useStyles();

  const handleNewGame = () => {
    setLoading(true);
    api.createGame().then(setGameId);
  };
  const handleCancelJoin = () => setJoinDialogOpen(false);
  const handleJoinGame = (gameIdToJoin: string) => {
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
          <Box fontWeight="fontWeightBold">
            Bramagrams
          </Box>
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
        <ButtonGroup orientation="vertical" variant="text">
          <Button onClick={() => handleNewGame()}>
            New Game
          </Button>
          <Button onClick={() => setJoinDialogOpen(true)}>
            Join Game
          </Button>
          <Button onClick={() => setHowToPlayDialogOpen(true)}>
            How To Play
          </Button>
        </ButtonGroup>
      </Box>
      <JoinGameDialog
        open={joinDialogOpen}
        onCancel={handleCancelJoin}
        onJoin={handleJoinGame}
      />
      <HowToPlayDialog
        open={howToPlayDialogOpen}
        onClose={() => setHowToPlayDialogOpen(false)}
      />
      <Backdrop className={classes.backdrop} open={loading}>
        <CircularProgress color="secondary" />
      </Backdrop>
    </Page>
  );
};

export default Home;
