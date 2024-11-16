import { maxBy } from "lodash";
import { useCallback } from "react";
import useLocalStorageState from "use-local-storage-state";

const PLAYER_INFO_LOCAL_STORAGE_KEY = "bramagrams::player-info";

type ConnectedGames = {
  [gameId: string]: {
    playerName: string;
    lastUpdated: string;
  };
};

const cleanupOldGames = (connectedGames: ConnectedGames) => {
  const entries = Object.entries(connectedGames);
  const latestGameId = maxBy(entries, (e) => e[1].lastUpdated)?.[0];
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const yesterday = d.toISOString();

  return entries.reduce<ConnectedGames>((games, [gameId, game]) => {
    const { lastUpdated } = game;
    if (lastUpdated > yesterday || gameId === latestGameId) {
      games[gameId] = game;
    }
    return games;
  }, {});
};

type StoredPlayerData = {
  connectedGames: ConnectedGames;
};
export const useStoredPlayerName = (gameId: string) => {
  const [storedPlayerData, setStoredPlayerData] = useLocalStorageState(
    PLAYER_INFO_LOCAL_STORAGE_KEY,
    {
      defaultValue: { connectedGames: {} } as StoredPlayerData,
    }
  );

  const setPlayerName = useCallback(
    (playerName: string) => {
      setStoredPlayerData(({ connectedGames }) => {
        const updatedGames = { ...connectedGames };
        updatedGames[gameId] = {
          playerName,
          lastUpdated: new Date().toISOString(),
        };
        return { connectedGames: cleanupOldGames(updatedGames) };
      });
    },
    [gameId, setStoredPlayerData]
  );

  const onGameStillActive = useCallback(() => {
    setStoredPlayerData(({ connectedGames }) => {
      const updatedGames = { ...connectedGames };
      const playerName = updatedGames[gameId]
        ? updatedGames[gameId].playerName
        : maxBy(Object.values(connectedGames), "lastUpdated")?.playerName || "";
      updatedGames[gameId] = {
        playerName,
        lastUpdated: new Date().toISOString(),
      };

      return { connectedGames: cleanupOldGames(updatedGames) };
    });
  }, [gameId, setStoredPlayerData]);

  const { connectedGames } = storedPlayerData;
  const latestGame = maxBy(Object.values(connectedGames), "lastUpdated");
  const playerName =
    connectedGames[gameId]?.playerName || latestGame?.playerName || "";

  return { playerName, setPlayerName, onGameStillActive } as const;
};
