export const exhaustiveSwitchCheck = (x: never): never => {
  throw Error("This is impossible");
};
