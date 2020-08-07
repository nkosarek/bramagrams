import words from './data/dictionary.json';

class Dictionary {
  private static dictionary = words.reduce((set, word) => {
    if (word.length >= 3) {
      set.add(word);
    }
    return set;
  }, new Set());

  static isValidWord(word: string): boolean {
    return !!word && this.dictionary.has(word.toLowerCase());
  }
};

export default Dictionary;
