import { GameState, PlayerWord } from "../server-models";

export interface Claim {
  wordsToClaim: PlayerWord[];
}

export default class ClaimHandler {
  private static getWordDiff(word1: string, word2: string) {
    if (word1.length < word2.length) {
      return null;
    }
    let word1Remainder: string = word1;
    for (let i = 0; i < word2.length; ++i) {
      const char = word2.charAt(i);
      if (!word1Remainder.includes(char)) {
        return null;
      }
      word1Remainder = word1Remainder.replace(char, '');
    }
    return word1Remainder;
  }

  private static canBeConstructedFromPool(word: string, tilePool: string[]): boolean {
    const poolRemainder: string[] = [...tilePool];
    for (let i = 0; i < word.length; ++i) {
      const poolIdx = poolRemainder.indexOf(word.charAt(i));
      if (poolIdx < 0) {
        return false;
      }
      poolRemainder.splice(poolIdx, 1);
    }
    return true;
  }

  private static getClaims(
    newWord: string,
    claimableWords: PlayerWord[],
    wordsAlreadyClaimed: PlayerWord[],
    game: GameState,
  ): Claim[] {
    const claims: Claim[] = [];
    for (let i = 0; i < claimableWords.length; ++i) {
      const playerWord = claimableWords[i];
      const word = playerWord
        ? game.players[playerWord.playerIdx].words[playerWord.wordIdx]
        : '';

      const newWordRemainder = ClaimHandler.getWordDiff(newWord, word);
      // Word claimed must be subset of newWord
      if (newWordRemainder === null) {
        continue;
      }

      const wordsToClaim = [...wordsAlreadyClaimed, playerWord];

      // No more letters left in new word
      if (!newWordRemainder) {
        // Must add to word(s) claimed either via multi-word claim or from pool
        if (wordsAlreadyClaimed.length) {
          claims.push({ wordsToClaim: wordsToClaim });
        }
        continue;
      }

      if (ClaimHandler.canBeConstructedFromPool(newWordRemainder, game.tiles)) {
        claims.push({ wordsToClaim: wordsToClaim });
      }
      const wordsNotChecked = claimableWords.slice(i);
      claims.push(
        ...ClaimHandler.getClaims(newWordRemainder, wordsNotChecked, wordsToClaim, game)
      );
    }
    return claims;
  }

  private static getNumStealsInClaim(claim: Claim, playerIdx: number): number {
    return claim.wordsToClaim.reduce((numSteals, playerWord) =>
      playerWord.playerIdx !== playerIdx ? numSteals + 1 : numSteals, 0);
  }

  static getAllPossibleClaims = (game: GameState, newWord: string): Claim[] => {
    if (!newWord) return [];

    const allPlayerWords: PlayerWord[] = game.players.reduce((allWords, player, playerIdx) => {
      allWords.push(...player.words.map((word, wordIdx) => ({ playerIdx, wordIdx })));
      return allWords;
    }, [] as PlayerWord[]);

    const claims: Claim[] = [];
    if (ClaimHandler.canBeConstructedFromPool(newWord, game.tiles)) {
      claims.push({ wordsToClaim: [] });
    }
    claims.push(...ClaimHandler.getClaims(newWord, allPlayerWords, [], game));
    return claims;
  }

  static getClaimWithMostStealsAndWords (
    game: GameState,
    playerName: string,
    claims: Claim[]
  ): Claim | undefined {
    if (!claims.length) return;
    const playerIdx = game.players.findIndex(p => p.name === playerName);
    let claimsWithMaxSteals: Claim[] = [];
    let maxSteals = -1;
    claims.forEach(claim => {
      const numSteals = ClaimHandler.getNumStealsInClaim(claim, playerIdx);
      if (numSteals > maxSteals) {
        maxSteals = numSteals;
        claimsWithMaxSteals = [claim];
      } else if (numSteals === maxSteals) {
        claimsWithMaxSteals.push(claim);
      }
    });

    let finalClaim;
    let maxWords = -1;
    claimsWithMaxSteals.forEach(claim => {
      if (claim.wordsToClaim.length > maxWords) {
        maxWords = claim.wordsToClaim.length;
        finalClaim = claim;
      }
    })
    return finalClaim;
  }
}
