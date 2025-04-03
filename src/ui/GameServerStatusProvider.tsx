"use client";

import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

const MAX_RETRY_TIMEOUT = 10000;
const MAX_RETRY_COUNT = 12;

const GameServerStatusContext = createContext(false);

export const GameServerStatusProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const [isGameServerUp, setIsGameServerUp] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (retryCount < MAX_RETRY_COUNT) {
      fetch(`${process.env.NEXT_PUBLIC_GAME_SERVER_URL}/api/health`)
        .then((res) => {
          if (res.status === 200) {
            setIsGameServerUp(true);
          }
        })
        .catch(() => {
          const timeout = Math.min(MAX_RETRY_TIMEOUT, 2000 * (retryCount + 1));
          setTimeout(() => setRetryCount((r) => r + 1), timeout);
        });
    }
  }, [retryCount]);
  return (
    <GameServerStatusContext.Provider value={isGameServerUp}>
      {children}
    </GameServerStatusContext.Provider>
  );
};

export const useIsGameServerUp = () => {
  return useContext(GameServerStatusContext);
};
