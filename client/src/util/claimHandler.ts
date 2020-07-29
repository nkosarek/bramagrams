import { GameState, PlayerWord } from "../server-models";

export interface Claim {
  wordsToSteal: PlayerWord[];
}

export default class ClaimHandler {
  private static getValidClaim = (
    game: GameState,
    newWord: string,
    playerWordToSteal?: PlayerWord
  ): Claim | null => {
    const wordToSteal = playerWordToSteal
      ? game.players[playerWordToSteal.playerIdx].words[playerWordToSteal.wordIdx]
      : '';
    if (newWord.length <= wordToSteal.length) {
      return null;
    }
    // Check that the word to steal is a subset of the new word
    let newWordRemainder: string = newWord;
    for (let i = 0; i < wordToSteal.length; ++i) {
      const char = wordToSteal.charAt(i);
      if (!newWordRemainder.includes(char)) {
        return null;
      }
      newWordRemainder = newWordRemainder.replace(char, '');
    }

    // Check that the remainder of the new word can be constructed from the pool
    const poolRemainder: string[] = [...game.tiles];
    for (let i = 0; i < newWordRemainder.length; ++i) {
      const poolIdx = poolRemainder.indexOf(newWordRemainder.charAt(i));
      if (poolIdx < 0) {
        return null;
      }
      poolRemainder.splice(poolIdx, 1);
    }
    return { wordsToSteal: playerWordToSteal ? [playerWordToSteal] : [] };
  }

  // TODO: check for multiple words to steal
  static getAllPossibleClaims = (game: GameState, newWord: string): Claim[] => {
    const allPlayerWords: PlayerWord[] = game.players.reduce((allWords, player, playerIdx) => {
      allWords.push(...player.words.map((word, wordIdx) => ({ playerIdx, wordIdx })));
      return allWords;
    }, [] as PlayerWord[]);

    // Include claim with no steals
    const claims = [ClaimHandler.getValidClaim(game, newWord)];

    claims.push(...allPlayerWords
      .map(playerWordToSteal => ClaimHandler.getValidClaim(game, newWord, playerWordToSteal)));
    return claims.filter((x: Claim | null): x is Claim => !!x);
  }
}
