"use client";

import { GameClient } from "@/ui/game-client";
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useState,
} from "react";

// TODO: Add env var for this
const HOSTNAME = "localhost";

const GameClientContext = createContext<GameClient | undefined>(undefined);

export const GameClientProvider: FC<PropsWithChildren> = ({ children }) => {
  const [client] = useState(new GameClient(HOSTNAME));
  return (
    <GameClientContext.Provider value={client}>
      {children}
    </GameClientContext.Provider>
  );
};

export const useGameClient = () => {
  const client = useContext(GameClientContext);
  if (!client) {
    throw Error(
      `${useGameClient.name} can only be called from a child of ${GameClientProvider.name}`
    );
  }
  return client;
};