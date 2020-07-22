import React, { useEffect, useState } from 'react';
import { Box } from '@material-ui/core';
import { GameState } from '../../server-models';
import Page from '../shared/Page';
import TilePool from './TilePool';
import PlayerHand from './PlayerHand';
import api from '../../api/api';
import Word from './Word';

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

const GameBoard = ({ gameState, gameId, playerName}: GameBoardProps) => {
  const [typedWord, setTypedWord] = useState("");

  const players = Object.values(gameState.players);

  useEffect(() => {
    const handleSpacebar = () => {
      if (gameState.currPlayer === playerName) {
        api.addTile(gameId, playerName);
      }
    };

    const handleEnter = () => {
      api.claimWord(gameId, playerName, typedWord);
      setTypedWord("");
    };

    const handleBackspace = () => {
      if (typedWord) {
        setTypedWord(typedWord.slice(0, -1));
      }
    };

    const handleTypedLetter = (letter: string) => {
      if (getPoolWithoutTypedWord(gameState.tiles, typedWord).includes(letter)) {
        setTypedWord(typedWord + letter);
      }
    };

    const handleKeyDownEvent = (event: KeyboardEvent) => {
      event.preventDefault();
      if (event.key != null) {
        const upperCaseKey = event.key.toUpperCase();
        switch (event.key) {
          case ' ':
            return handleSpacebar();
          case 'Enter':
            return handleEnter();
          case 'Backspace':
            return handleBackspace();
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
            return handleBackspace();
          default:
            if (event.keyCode >= 65 && event.keyCode <= 90) {
              return handleTypedLetter(String.fromCharCode(event.keyCode));
            }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDownEvent);
    return () => window.removeEventListener('keydown', handleKeyDownEvent);
  }, [gameState.currPlayer, gameState.tiles, gameId, playerName, typedWord]);

  return (
    <Page>
      <Box height="50%" px="10%" py={2} display="flex" flexDirection="column" alignItems="center">
        <Box flexGrow={1}>
          <TilePool letters={gameState.tiles || []} />
        </Box>
        <Word word={typedWord} dark />
      </Box>
      <Box height="50%" px={10} display="flex">
        {players.map((player, index) => (
          <Box key={index} flexGrow={1}>
            <PlayerHand name={player.name} words={player.words} />
          </Box>
        ))}
      </Box>
    </Page>
  );
};

export default GameBoard;
