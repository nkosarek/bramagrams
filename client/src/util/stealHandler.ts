import { GameState, PlayerWord } from "../server-models";

export default class StealHandler {
  private static getNewTilePool = (game: GameState, newWord: string, wordToSteal: string): string[] | undefined => {
    if (newWord.length <= wordToSteal.length) {
      return;
    }
    // Check that the word to steal is a subset of the new word
    let newWordRemainder: string = newWord;
    for (let i = 0; i < wordToSteal.length; ++i) {
      const char = wordToSteal.charAt(i);
      if (!newWordRemainder.includes(char)) {
        return;
      }
      newWordRemainder = newWordRemainder.replace(char, '');
    }

    // Check that the remainder of the new word can be constructed from the pool
    const poolRemainder: string[] = [...game.tiles];
    for (let i = 0; i < newWordRemainder.length; ++i) {
      const poolIdx = poolRemainder.indexOf(newWordRemainder.charAt(i));
      if (poolIdx < 0) {
        return;
      }
      poolRemainder.splice(poolIdx, 1);
    }
    return poolRemainder;
  }

  // TODO: check for multiple words to steal
  static getAllPossibleSteals = (game: GameState, newWord: string): PlayerWord[][] => {
    const allPlayerWords: PlayerWord[] = game.players.reduce((allWords, player, playerIdx) => {
      allWords.push(...player.words.map((word, wordIdx) => ({ playerIdx, wordIdx })));
      return allWords;
    }, [] as PlayerWord[]);

    return allPlayerWords
      .map((playerWord: PlayerWord) => {
        const word = game.players[playerWord.playerIdx].words[playerWord.wordIdx];
        const newTilePool = StealHandler.getNewTilePool(game, newWord, word);
        if (newTilePool) {
          return [playerWord];
        }
        return null;
      })
      .filter((x: PlayerWord[] | null): x is PlayerWord[] => !!x);
  }
}
