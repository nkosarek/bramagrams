import { isValidWord } from "@/shared/dictionary/isValidWord";
import { GameState } from "@/shared/schema";
import { useGameClient } from "@/ui/game/useGameClient";
import { animated, useSpring } from "@react-spring/web";
import { FC, useEffect, useRef, useState } from "react";
import { Word } from "./Word";
import {
  getAllPossibleClaims,
  getClaimWithMostStealsAndWords,
} from "./wordClaimUtils";

export const TypedWord: FC<{
  gameState: GameState;
  gameId: string;
  playerName: string;
  disableHandlers: boolean;
  onTileFlip: () => void;
}> = ({ gameState, gameId, playerName, disableHandlers, onTileFlip }) => {
  const gameClient = useGameClient();
  const [typedWord, setTypedWord] = useState("");

  const { animateFailure } = useSpring({
    config: { duration: 300 },
    animateFailure: 1,
  });

  const transform = animateFailure
    .to({
      range: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 1],
      output: [0, 0.75, -0.75, 0.75, -0.75, 0, 0],
    })
    .to((x) => `translate(${x}rem)`);

  const handleWordClaimedResponse = useRef<
    (claimed: boolean, word: string) => void
  >(() => {});
  const handleKeyDownEvent = useRef<(event: KeyboardEvent) => void>(() => {});

  useEffect(() => {
    // Reset typed word when game restarts
    if (gameState.status === "IN_PROGRESS") {
      setTypedWord("");
    }
  }, [gameState.status]);

  useEffect(() => {
    handleWordClaimedResponse.current = (claimed, word) => {
      const clearTypedWord = () => setTypedWord("");
      if (word === typedWord) {
        if (claimed) {
          clearTypedWord();
        } else {
          // Disable typing during animation
          handleKeyDownEvent.current = () => {};
          animateFailure.start({ from: 0, to: 1, onRest: clearTypedWord });
        }
      }
    };
  }, [typedWord, animateFailure]);

  useEffect(() => {
    if (disableHandlers || gameState.status === "ENDED") {
      handleKeyDownEvent.current = () => {};
      return;
    }

    const handleSpacebar = (event: KeyboardEvent) => {
      event.preventDefault();
      if (
        process.env.NODE_ENV === "development" ||
        gameState.players[gameState.currPlayerIdx]?.name === playerName
      ) {
        onTileFlip();
        gameClient.addTile(gameId, playerName);
      }
    };

    const handleEnter = (event: KeyboardEvent) => {
      event.preventDefault();
      if (typedWord && typedWord.length >= 3) {
        if (!isValidWord(typedWord)) {
          handleWordClaimedResponse.current(false, typedWord);
          return;
        }
        const claimOptions = getAllPossibleClaims(gameState, typedWord);
        // Default to steal if it's possible
        const claim = getClaimWithMostStealsAndWords(
          gameState,
          playerName,
          claimOptions
        );
        if (!claim) {
          handleWordClaimedResponse.current(false, typedWord);
          return;
        }
        gameClient.claimWord(gameId, playerName, typedWord, claim.wordsToClaim);
      }
    };

    const handleBackspace = (event: KeyboardEvent) => {
      event.preventDefault();
      if (typedWord) {
        if (event.metaKey || event.ctrlKey) {
          setTypedWord("");
        } else {
          setTypedWord((word) => word.slice(0, -1));
        }
      }
    };

    const handleTypedLetter = (letter: string) => {
      const allTiles = [
        ...gameState.tiles,
        ...gameState.players.flatMap((p) =>
          p.words.flatMap((w) => w.split(""))
        ),
      ];
      const allTilesWithoutTypedWord = typedWord
        .split("")
        .reduce((tiles, letter) => {
          tiles.splice(tiles.indexOf(letter), 1);
          return tiles;
        }, allTiles);

      if (allTilesWithoutTypedWord.includes(letter)) {
        setTypedWord((word) => word + letter);
      }
    };

    handleKeyDownEvent.current = (event: KeyboardEvent) => {
      if (event.key != null) {
        const upperCaseKey = event.key.toUpperCase();
        switch (event.key) {
          case " ":
            return handleSpacebar(event);
          case "Enter":
            return handleEnter(event);
          case "Backspace":
            return handleBackspace(event);
          default:
            if (upperCaseKey >= "A" && upperCaseKey <= "Z") {
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
  }, [
    gameId,
    gameState,
    playerName,
    typedWord,
    disableHandlers,
    onTileFlip,
    gameClient,
  ]);

  useEffect(() => {
    const onWordClaimed = (claimed: boolean, word: string) =>
      handleWordClaimedResponse.current(claimed, word);
    const onKeyDown = (event: KeyboardEvent) =>
      handleKeyDownEvent.current(event);
    gameClient.initWordClaimedSubscription(onWordClaimed);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [gameClient]);

  return (
    // TODO: Fix this
    // @ts-expect-error - Seems like an incompatibility with React 19
    <animated.div style={{ transform }}>
      <Word word={typedWord} disabled={!isValidWord(typedWord)} />
    </animated.div>
  );
};
