import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, ButtonGroup, makeStyles, Paper, Typography } from '@material-ui/core';
import { GameState, GameStatuses, PlayerStatuses } from 'bramagrams-shared';
import HowToPlayButtonAndDialog from '../../shared/HowToPlayButtonAndDialog';
import EndGameButtons from './EndGameButtons';
import TilePool from './TilePool';
import SpectatorsList from './SpectatorsList';
import GameStartToast, { initToastAcked } from './GameStartToast';
import TypedWord from './TypedWord';

const useStyles = makeStyles((theme) => ({
  topCornerBox: {
    width: "20%",
  },
  spectatorsListPaper: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.primary.dark,
  },
}));

interface GameBoardHeaderProps {
  gameState: GameState;
  gameId: string;
  playerName: string;
  disableHandlers: boolean;
}

const GameBoardHeader = ({ gameState, gameId, playerName, disableHandlers }: GameBoardHeaderProps) => {
  const [toastAcked, setToastAcked] = useState(initToastAcked(gameState, playerName));

  const classes = useStyles();

  const playerIdx = gameState.players.findIndex(p => p.name === playerName);
  const playerState = gameState.players[playerIdx];

  const spectatingPlayers = gameState.players.filter(p => p.status === PlayerStatuses.SPECTATING);

  const showEndGameButtons = !gameState.numTilesLeft && !!playerState &&
    (playerState.status !== PlayerStatuses.SPECTATING || gameState.status === GameStatuses.ENDED);

  return (
    <>
      <GameStartToast
        open={gameState.currPlayerIdx === playerIdx && !toastAcked}
        onClose={() => setToastAcked(true)}
      />
      <Box display="flex" alignItems="flex-start">
        <Box p={1} className={classes.topCornerBox}>
          <ButtonGroup variant="outlined" color="secondary">
            <Button component={Link} to="/">Home</Button>
            <HowToPlayButtonAndDialog hideGameLobby />
          </ButtonGroup>
        </Box>
        <Box flexGrow={1} width="90%" py={2} display="flex" flexDirection="column" alignItems="center">
          <Box mb={2}>
            {showEndGameButtons ? (
              <EndGameButtons
                gameId={gameId}
                playerName={playerName}
                playerState={playerState}
                gameTimeoutTime={gameState.timeoutTime}
              />
            ) : (
              <Typography variant="h5">Tiles Left: {gameState.numTilesLeft}</Typography>
            )}
          </Box>
          <Box flexGrow={1} display="flex" pb={3}>
            <TilePool
              letters={gameState.tiles || []}
              dark={gameState.status === GameStatuses.ENDED}
            />
          </Box>
          <TypedWord
            gameState={gameState}
            gameId={gameId}
            playerName={playerName}
            disableHandlers={disableHandlers}
            onTileFlip={() => setToastAcked(true)}
          />
        </Box>
        {spectatingPlayers.length ? (
          <Paper
            elevation={3}
            className={`${classes.spectatorsListPaper} ${classes.topCornerBox}`}
          >
            <SpectatorsList spectators={spectatingPlayers} playerName={playerName} />
          </Paper>
        ) : (
          <Box className={classes.topCornerBox}></Box>
        )}
      </Box>
    </>
  )
};

export default GameBoardHeader;
