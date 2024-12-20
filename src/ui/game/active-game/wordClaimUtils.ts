import { GameStateInProgress, PlayerWord } from "@/shared/schema";
import { maxBy } from "lodash";

interface Claim {
  wordsToClaim: PlayerWord[];
}

export const getAllPossibleClaims = (
  game: GameStateInProgress,
  newWord: string
): Claim[] => {
  if (!newWord) return [];

  const allPlayerWords = game.players.flatMap((player, playerIdx) => {
    return player.words.map((w, wordIdx) => ({ playerIdx, wordIdx }));
  });

  const claims: Claim[] = [];
  if (canBeConstructedFromPool(newWord, game.tiles)) {
    claims.push({ wordsToClaim: [] });
  }
  claims.push(...getClaims(newWord, allPlayerWords, [], game));
  return claims;
};

export const getClaimWithMostStealsAndWords = (
  game: GameStateInProgress,
  playerName: string,
  claims: Claim[]
): Claim | undefined => {
  if (!claims.length) {
    return;
  }
  const playerIdx = game.players.findIndex((p) => p.name === playerName);
  let claimsWithMaxSteals: Claim[] = [];
  let maxSteals = -1;
  claims.forEach((claim) => {
    const numSteals = getNumStealsInClaim(claim, playerIdx);
    if (numSteals > maxSteals) {
      maxSteals = numSteals;
      claimsWithMaxSteals = [claim];
    } else if (numSteals === maxSteals) {
      claimsWithMaxSteals.push(claim);
    }
  });

  return maxBy(claimsWithMaxSteals, (c) => c.wordsToClaim.length);
};

const getWordDiff = (word1: string, word2: string) => {
  if (word1.length < word2.length) {
    return null;
  }
  let word1Remainder: string = word1;
  for (let i = 0; i < word2.length; ++i) {
    const char = word2.charAt(i);
    if (!word1Remainder.includes(char)) {
      return null;
    }
    word1Remainder = word1Remainder.replace(char, "");
  }
  return word1Remainder;
};

const canBeConstructedFromPool = (
  word: string,
  tilePool: string[]
): boolean => {
  const poolRemainder: string[] = [...tilePool];
  for (let i = 0; i < word.length; ++i) {
    const poolIdx = poolRemainder.indexOf(word.charAt(i));
    if (poolIdx < 0) {
      return false;
    }
    poolRemainder.splice(poolIdx, 1);
  }
  return true;
};

const getClaims = (
  newWord: string,
  claimableWords: PlayerWord[],
  wordsAlreadyClaimed: PlayerWord[],
  game: GameStateInProgress
): Claim[] => {
  const claims: Claim[] = [];
  claimableWords.forEach((playerWord, i) => {
    const word = playerWord
      ? game.players[playerWord.playerIdx]?.words[playerWord.wordIdx] || ""
      : "";

    const newWordRemainder = getWordDiff(newWord, word);
    // Word claimed must be subset of newWord
    if (newWordRemainder === null) {
      return;
    }

    const wordsToClaim = [...wordsAlreadyClaimed, playerWord];

    // No more letters left in new word
    if (!newWordRemainder) {
      // Must add to word(s) claimed either via multi-word claim or from pool
      if (wordsAlreadyClaimed.length) {
        claims.push({ wordsToClaim: wordsToClaim });
      }
      return;
    }

    if (canBeConstructedFromPool(newWordRemainder, game.tiles)) {
      claims.push({ wordsToClaim: wordsToClaim });
    }
    const wordsNotChecked = claimableWords.slice(i);
    claims.push(
      ...getClaims(newWordRemainder, wordsNotChecked, wordsToClaim, game)
    );
  });
  return claims;
};

const getNumStealsInClaim = (claim: Claim, playerIdx: number): number => {
  return claim.wordsToClaim.reduce(
    (numSteals, playerWord) =>
      playerWord.playerIdx !== playerIdx ? numSteals + 1 : numSteals,
    0
  );
};
