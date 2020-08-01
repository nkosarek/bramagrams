import React, { useEffect, useState } from 'react';
import { Box, Typography, Button } from '@material-ui/core';
import { GameState, PlayerStatuses, GameStatuses } from '../../server-models';
import Page from '../shared/Page';
import TilePool from './TilePool';
import PlayerHand from './PlayerHand';
import api from '../../api/api';
import Word from './Word';
import ClaimHandler from '../../util/claimHandler';

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

interface GameBoardProps {
  gameState: GameState;
  gameId: string;
  playerName: string;
}

const GameBoard = ({ gameState, gameId, playerName }: GameBoardProps) => {
  const [typedWord, setTypedWord] = useState("");

  const playerState = gameState.players.find(p => p.name === playerName);

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
    case PlayerStatuses.ENDED:
    case PlayerStatuses.NOT_READY_TO_START:
      endGameButtonLabel = 'Rematch';
      onEndGameButtonClicked = () => api.readyToStart(gameId, playerName);
      break;
    case PlayerStatuses.READY_TO_START:
      endGameButtonLabel = 'Don\'t Rematch';
      onEndGameButtonClicked = () => api.notReadyToStart(gameId, playerName);
      break;
  }

  useEffect(() => {
    api.initWordClaimedSubscription(() => setTypedWord(""));
  }, [gameId]);

  useEffect(() => {
    const handleSpacebar = () => {
      if (process.env.NODE_ENV === "development" ||
          gameState.players[gameState.currPlayerIdx].name === playerName) {
        api.addTile(gameId, playerName);
      }
    };

    const handleEnter = () => {
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
        setTypedWord(typedWord.slice(0, -1));
      }
    };

    const handleTypedLetter = (letter: string) => {
      if (gameState.status === GameStatuses.ENDED) {
        return;
      }
      const allTiles = getAllAvailableTiles(gameState);
      if (getPoolWithoutTypedWord(allTiles, typedWord).includes(letter)) {
        setTypedWord(typedWord + letter);
      }
    };

    const handleKeyDownEvent = (event: KeyboardEvent) => {
      if (event.key != null) {
        const upperCaseKey = event.key.toUpperCase();
        switch (event.key) {
          case ' ':
            return handleSpacebar();
          case 'Enter':
            return handleEnter();
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
            return handleSpacebar();
          case 13:
            return handleEnter();
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
      <Box flexGrow={1} px="10%" py={2} display="flex" flexDirection="column" alignItems="center">
        <Box mb={2}>
          {gameState.numTilesLeft ? (
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
        <Box flexGrow={1}>
          <TilePool
            letters={gameState.tiles || []}
            dark={gameState.status === GameStatuses.ENDED}
          />
        </Box>
        <Word word={typedWord} dark />
      </Box>
      <Box minHeight="70%" px={3} display="flex">
        {gameState.players.map((player, index) => (
          <Box key={index} width={1 / gameState.players.length}>
            <PlayerHand
              name={player.name}
              words={player.words}
              yourTurn={index === gameState.currPlayerIdx}
              dark={gameState.status === GameStatuses.ENDED}
            />
          </Box>
        ))}
      </Box>
    </Page>
  );
};

export default GameBoard;
