import React, { useEffect, useRef, useState } from 'react';
import { Dictionary, GameState, GameStatuses } from 'bramagrams-shared';
import api from '../../../api/api';
import ClaimHandler from '../../../util/claimHandler';
import Word from '../../shared/Word';
import { animated, useSpring } from 'react-spring';

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

interface TypedWordProps {
  gameState: GameState;
  gameId: string;
  playerName: string;
  disableHandlers: boolean;
  onTileFlip: () => void;
}

const TypedWord = ({ gameState, gameId, playerName, disableHandlers, onTileFlip }: TypedWordProps) => {
  const [typedWord, setTypedWord] = useState("");

  const [{ wiggle }, setWiggle] = useSpring(() => ({
    reset: true,
    from: { wiggle: 0 },
    wiggle: 0,
    config: { duration: 500 },
    onRest: () => setTypedWord(""),
  }));

  const handleWordClaimedResponse = useRef<(claimed: boolean, word: string) => void>(() => {});
  const handleKeyDownEvent = useRef<(event: KeyboardEvent) => void>(() => {});

  useEffect(() => {
    handleWordClaimedResponse.current = (claimed, word) => {
      if (word === typedWord) {
        if (!claimed) setWiggle({ wiggle: 1 });
      }
    };
  }, [typedWord, setWiggle]);

  useEffect(() => {
    if (disableHandlers) {
      handleKeyDownEvent.current = () => {};
      return;
    }

    const handleSpacebar = (event: KeyboardEvent) => {
      event.preventDefault();
      if (process.env.NODE_ENV === "development" ||
          gameState.players[gameState.currPlayerIdx].name === playerName) {
        onTileFlip();
        api.addTile(gameId, playerName);
      }
    };

    const handleEnter = (event: KeyboardEvent) => {
      event.preventDefault();
      if (typedWord && typedWord.length >= 3) {
        if (!Dictionary.isValidWord(typedWord)) {
          handleWordClaimedResponse.current(false, typedWord);
          return;
        }
        const claimOptions = ClaimHandler.getAllPossibleClaims(gameState, typedWord);
        // Default to steal if it's possible
        const claim = ClaimHandler.getClaimWithMostStealsAndWords(gameState, playerName, claimOptions);
        if (!claim) {
          handleWordClaimedResponse.current(false, typedWord);
          return;
        }
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

    handleKeyDownEvent.current = (event: KeyboardEvent) => {
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
  }, [gameId, gameState, playerName, typedWord, disableHandlers, onTileFlip]);

  useEffect(() => {
    const onWordClaimed = (claimed: boolean, word: string) => handleWordClaimedResponse.current(claimed, word);
    const onKeyDown = (event: KeyboardEvent) => handleKeyDownEvent.current(event);
    api.initWordClaimedSubscription(onWordClaimed);
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <animated.div
      style={{
        transform: wiggle
          .interpolate({
            range: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 1],
            output: [0, 0.5, -0.5, 0.5, -0.5, 0, 0]
          })
          .interpolate(x => `translate(${x}rem)`)
      }}
    >
      <Word word={typedWord} dark={!Dictionary.isValidWord(typedWord)} />
    </animated.div>
  )
};

export default TypedWord;
