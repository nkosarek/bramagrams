import { FC } from "react";

export const GamePage: FC<{
  gameId: string;
}> = ({ gameId }) => {
  return <p>Game: {gameId}</p>
};