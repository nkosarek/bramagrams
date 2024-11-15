export const exhaustiveSwitchCheck = (_: never): never => {
  throw Error(`This should never happen. ${_}`);
};
