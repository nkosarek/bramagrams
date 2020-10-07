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
import EndGameButtons from './EndGameButtons';

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

const rotateArray = (newStart: number, array: any[]) => {
  if (newStart < 0) return array;
  return array.slice(newStart).concat(array.slice(0, newStart));
}

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

  // Save each player's original index into the players list before filtering out spectators and reordering
  let playingPlayers = gameState.players.map((player, idx) => ({ player, idx }))
    .filter(p => p.player.status !== PlayerStatuses.SPECTATING);
  const thisPlayerIdx = playingPlayers.findIndex(p => p.player.name === playerName);
  playingPlayers = rotateArray(thisPlayerIdx, playingPlayers);

  const spectatingPlayers = gameState.players.filter(p => p.status === PlayerStatuses.SPECTATING);

  const showEndGameButtons = !gameState.numTilesLeft && !!playerState &&
    (playerState.status !== PlayerStatuses.SPECTATING || gameState.status === GameStatuses.ENDED);

  const isCurrPlayer = (playerIdx: number) =>
    gameState.status === GameStatuses.IN_PROGRESS &&
    !!gameState.numTilesLeft &&
    playerIdx === gameState.currPlayerIdx;

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
      <Box display="flex" alignItems="flex-start">
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
            {showEndGameButtons ? (
              <EndGameButtons gameId={gameId} playerName={playerName} playerState={playerState} />
            ) : (
              <Typography variant="h5">Tiles Left: {gameState.numTilesLeft}</Typography>
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
      <Box flexGrow={1} maxHeight="70%" display="flex" px={3} pb={3}>
        {playingPlayers.map(({ player, idx }) => (
          <Box key={idx} width={1 / playingPlayers.length}>
            <PlayerHand
              name={player.name}
              words={player.words}
              isYou={player.name === playerName}
              isCurrPlayer={isCurrPlayer(idx)}
              isReady={playerIsReady(player)}
              dark={gameState.status === GameStatuses.ENDED}
              small={playingPlayers.length > 2}
            />
          </Box>
        ))}
      </Box>
    </Page>
  );
};

export default GameBoard;
