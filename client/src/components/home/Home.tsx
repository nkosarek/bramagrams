import React, { useState } from 'react';
import {
  Backdrop,
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  makeStyles,
  withStyles,
} from '@material-ui/core';
import { Link } from 'react-router-dom';
import api from '../../api/api';
import Page from '../shared/Page';
import HowToPlayDialog from './HowToPlayDialog';
import { BoldTypography } from '../shared/BoldTypography';
import { RedirectToGame } from '../shared/RedirectToGame';

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
}));

const HomePageButton = withStyles((theme) => ({
  root: {
    color: theme.palette.getContrastText(theme.palette.secondary.main),
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    }
  },
}))(Button) as typeof Button;

const Home = () => {
  const [howToPlayDialogOpen, setHowToPlayDialogOpen] = useState(false);
  const [gameId, setGameId] = useState("");
  const [loading, setLoading] = useState(false);

  const classes = useStyles();

  const handleNewGame = (isPublic = false) => {
    setLoading(true);
    api.createGame(isPublic).then(setGameId);
  };

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
          <HomePageButton onClick={() => handleNewGame()}>
            New Private Game
          </HomePageButton>
          <HomePageButton onClick={() => handleNewGame(true)}>
            New Public Game
          </HomePageButton>
          <HomePageButton component={Link} to="/public-games">
            Join Game
          </HomePageButton>
          <HomePageButton onClick={() => setHowToPlayDialogOpen(true)}>
            How To Play
          </HomePageButton>
        </ButtonGroup>
      </Box>
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
