import validWords from "./valid-words.json";

const validWordsSet = validWords.reduce((set, word) => {
  if (word.length >= 3) {
    set.add(word);
  }
  return set;
}, new Set());

export const isValidWord = (word: string): boolean => {
  return !!word && validWordsSet.has(word.toLowerCase());
};
