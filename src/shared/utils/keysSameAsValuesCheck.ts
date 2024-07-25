export const keysSameAsValuesCheck = <O>(obj: {
  [k in keyof O]: k;
}): typeof obj => obj;
