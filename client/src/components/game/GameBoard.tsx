import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, makeStyles } from '@material-ui/core';
import { GameState, Player, PlayerStatuses, GameStatuses, Dictionary } from 'bramagrams-shared';
import Page from '../shared/Page';
import TilePool from './TilePool';
import PlayerHand from './PlayerHand';
import api from '../../api/api';
import Word from './Word';
import ClaimHandler from '../../util/claimHandler';
import SpectatorsList from './SpectatorsList';

const getAllAvailableTiles = (gameState: GameState) => {
  let poolAndWords = [...gameState.tiles];
  gameState.players.forEach(player =>
    player.words.forEach(word =>
      poolAndWords.push(...word.split(''))));
  return poolAndWords;
};

const getPoolWithoutTypedWord = (pool: string[], word: string): string[] => {
  let adjustedPool = [...pool];
  for (let i = 0; i < word.length; ++i) {
    adjustedPool.splice(adjustedPool.indexOf(word.charAt(i)), 1);
  }
  return adjustedPool;
};

const useStyles = makeStyles((theme) => ({
  topCornerBox: {
    width: "20%",
  },
  spectatorsListPaper: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.primary.dark,
  },
}));

interface GameBoardProps {
  gameState: GameState;
  gameId: string;
  playerName: string;
}

const GameBoard = ({ gameState, gameId, playerName }: GameBoardProps) => {
  const [typedWord, setTypedWord] = useState("");

  const classes = useStyles();

  const playerState = gameState.players.find(p => p.name === playerName);
  const playingPlayers = gameState.players.filter(p => p.status !== PlayerStatuses.SPECTATING);
  const spectatingPlayers = gameState.players.filter(p => p.status === PlayerStatuses.SPECTATING);

  const showTilesLeft = gameState.numTilesLeft || !playerState ||
    (playerState.status === PlayerStatuses.SPECTATING && gameState.status !== GameStatuses.ENDED);

  // TODO: Make an EndGameButtons component - add New Game button next to Rematch
  let endGameButtonLabel = 'Rematch';
  let onEndGameButtonClicked = () => {};
  switch(playerState?.status) {
    case PlayerStatuses.PLAYING:
      endGameButtonLabel = 'Done';
      onEndGameButtonClicked = () => api.readyToEnd(gameId, playerName);
      break;
    case PlayerStatuses.READY_TO_END:
      endGameButtonLabel = 'No wait';
      onEndGameButtonClicked = () => api.notReadyToEnd(gameId, playerName);
      break;
    case PlayerStatuses.SPECTATING:
    case PlayerStatuses.ENDED:
      endGameButtonLabel = 'Rematch';
      onEndGameButtonClicked = () => api.rematch(gameId);
      break;
  }

  const isCurrPlayer = (playerIdx: number) =>
    gameState.status === GameStatuses.IN_PROGRESS &&
    !!gameState.numTilesLeft &&
    playerIdx === gameState.currPlayerIdx;

  const playerIsWaiting = (player: Player) => player.status === PlayerStatuses.ENDED;
  const playerIsReady = (player: Player) => player.status === PlayerStatuses.READY_TO_END;

  useEffect(() => {
    api.initWordClaimedSubscription(() => setTypedWord(""));
  }, [gameId]);

  useEffect(() => {
    const handleSpacebar = (event: KeyboardEvent) => {
      event.preventDefault();
      if (process.env.NODE_ENV === "development" ||
          gameState.players[gameState.currPlayerIdx].name === playerName) {
        api.addTile(gameId, playerName);
      }
    };

    const handleEnter = (event: KeyboardEvent) => {
      event.preventDefault();
      if (typedWord && typedWord.length >= 3) {
        const claimOptions = ClaimHandler.getAllPossibleClaims(gameState, typedWord);
        // Default to steal if it's possible
        const claim = ClaimHandler.getClaimWithMostStealsAndWords(gameState, playerName, claimOptions);
        if (!claim) return;
        api.claimWord(gameId, playerName, typedWord, claim.wordsToClaim);
      }
    };

    const handleBackspace = (event: KeyboardEvent) => {
      event.preventDefault();
      if (typedWord) {
        if (event.metaKey || event.ctrlKey) {
          setTypedWord('');
        } else {
          setTypedWord(word => word.slice(0, -1));
        }
      }
    };

    const handleTypedLetter = (letter: string) => {
      if (gameState.status === GameStatuses.ENDED) {
        return;
      }
      const allTiles = getAllAvailableTiles(gameState);
      if (getPoolWithoutTypedWord(allTiles, typedWord).includes(letter)) {
        setTypedWord(word => word + letter);
      }
    };

    const handleKeyDownEvent = (event: KeyboardEvent) => {
      if (event.key != null) {
        const upperCaseKey = event.key.toUpperCase();
        switch (event.key) {
          case ' ':
            return handleSpacebar(event);
          case 'Enter':
            return handleEnter(event);
          case 'Backspace':
            return handleBackspace(event);
          default:
            if (upperCaseKey >= 'A' && upperCaseKey <= 'Z') {
              return handleTypedLetter(upperCaseKey);
            }
        }
      // If event.key is not supported by the browser
      } else {
        switch (event.keyCode) {
          case 32:
            return handleSpacebar(event);
          case 13:
            return handleEnter(event);
          case 8:
            return handleBackspace(event);
          default:
            if (event.keyCode >= 65 && event.keyCode <= 90) {
              return handleTypedLetter(String.fromCharCode(event.keyCode));
            }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDownEvent);
    return () => window.removeEventListener('keydown', handleKeyDownEvent);
  }, [gameId, gameState, playerName, typedWord]);

  return (
    <Page>
      <Box maxHeight="30%" display="flex" alignItems="flex-start">
        <Box p={1} className={classes.topCornerBox}>
          <Button
            variant="outlined"
            color="secondary"
            href="/"
          >
            Home
          </Button>
        </Box>
        <Box flexGrow={1} width="90%" py={2} display="flex" flexDirection="column" alignItems="center">
          <Box mb={2}>
            {showTilesLeft ? (
              <Typography variant="h5">Tiles Left: {gameState.numTilesLeft}</Typography>
            ) : (
              <Button
                variant="contained"
                color="secondary"
                onClick={onEndGameButtonClicked}
              >
                {endGameButtonLabel}
              </Button>
            )}
          </Box>
          <Box flexGrow={1} display="flex">
            <TilePool
              letters={gameState.tiles || []}
              dark={gameState.status === GameStatuses.ENDED}
            />
          </Box>
          <Word word={typedWord} dark={!Dictionary.isValidWord(typedWord)} />
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
      <Box minHeight="70%" px={3} display="flex">
        {playingPlayers.map((player, index) => (
          <Box key={index} width={1 / playingPlayers.length}>
            <PlayerHand
              name={player.name}
              words={player.words}
              isYou={player.name === playerName}
              isCurrPlayer={isCurrPlayer(index)}
              isWaiting={playerIsWaiting(player)}
              isReady={playerIsReady(player)}
              dark={gameState.status === GameStatuses.ENDED}
            />
          </Box>
        ))}
      </Box>
    </Page>
  );
};

export default GameBoard;
