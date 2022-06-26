import React, { useState } from 'react';
import {
  Backdrop,
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  makeStyles,
} from '@material-ui/core';
import { Link } from 'react-router-dom';
import api from '../../api/api';
import Page from '../shared/Page';
import JoinGameDialog from './JoinGameDialog';
import HowToPlayDialog from './HowToPlayDialog';
import { BoldTypography } from '../shared/BoldTypography';
import { RedirectToGame } from '../shared/RedirectToGame';

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
  buttons: {
    color: theme.palette.getContrastText(theme.palette.secondary.main),
  }
}));

const Home = () => {
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [howToPlayDialogOpen, setHowToPlayDialogOpen] = useState(false);
  const [gameId, setGameId] = useState("");
  const [loading, setLoading] = useState(false);

  const classes = useStyles();

  const handleNewGame = (isPublic = false) => {
    setLoading(true);
    api.createGame(isPublic).then(setGameId);
  };
  const handleCancelJoin = () => setJoinDialogOpen(false);
  const handleJoinGame = (gameIdToJoin: string) => {
    setJoinDialogOpen(false);
    setGameId(gameIdToJoin);
  }

  return gameId ? (
    <RedirectToGame gameId={gameId} />
  ) : (
    <Page>
      <Box
        flexGrow={1}
        display="flex"
        flexDirection="column"
        justifyContent="flex-end"
        paddingBottom="2rem"
      >
        <BoldTypography variant="h2" align="center" color="secondary">
          Bramagrams
        </BoldTypography>
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
          <Button onClick={() => handleNewGame()} className={classes.buttons}>
            New Private Game
          </Button>
          <Button onClick={() => handleNewGame(true)} className={classes.buttons}>
            New Public Game
          </Button>
          <Button component={Link} to="/public-games" className={classes.buttons}>
            Join Game
          </Button>
          <Button onClick={() => setHowToPlayDialogOpen(true)} className={classes.buttons}>
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
