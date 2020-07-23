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

  useEffect(() => {
    api.initWordClaimedSubscription(() => setTypedWord(""));
  }, [gameId]);

  useEffect(() => {
    const handleSpacebar = () => {
      if (gameState.players[gameState.currPlayerIdx].name === playerName) {
        api.addTile(gameId, playerName);
      }
    };

    const handleEnter = () => {
      if (typedWord && typedWord.length >= 3) {
        api.claimWord(gameId, playerName, typedWord);
      }
    };

    const handleBackspace = (event: KeyboardEvent) => {
      event.preventDefault();
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
  }, [gameState.players, gameState.currPlayerIdx, gameState.tiles, gameId, playerName, typedWord]);

  return (
    <Page>
      <Box flexGrow={1} px="10%" py={2} display="flex" flexDirection="column" alignItems="center">
        <Box flexGrow={1}>
          <TilePool letters={gameState.tiles || []} />
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
            />
          </Box>
        ))}
      </Box>
    </Page>
  );
};

export default GameBoard;
