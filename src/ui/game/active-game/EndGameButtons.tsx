import { Player } from "@/shared/schema";
import { GameClient } from "@/ui/game-client";
import { useGameClient } from "@/ui/game/useGameClient";
import { Box, Button, ButtonGroup, Typography } from "@mui/material";
import { FC, useEffect, useState } from "react";

const getMsLeft = (gameTimeoutTime: string | null): number | undefined => {
  if (!gameTimeoutTime) return;
  return Math.floor(new Date(gameTimeoutTime).getTime() - Date.now());
};

const getDisplayByStatus = (
  playerStatus: Player["status"] | undefined,
  gameId: string,
  playerName: string,
  gameClient: GameClient
) => {
  switch (playerStatus) {
    case "PLAYING":
      return {
        showBackToLobbyButton: false,
        showTimer: true,
        endGameButtonLabel: "Done",
        onEndGameButtonClicked: () => gameClient.readyToEnd(gameId, playerName),
      };
    case "READY_TO_END":
      return {
        showBackToLobbyButton: false,
        showTimer: true,
        endGameButtonLabel: "No wait",
        onEndGameButtonClicked: () =>
          gameClient.notReadyToEnd(gameId, playerName),
      };
    case "SPECTATING":
    case "ENDED":
    // Default case should never happen
    default:
      return {
        showBackToLobbyButton: true,
        showTimer: false,
        endGameButtonLabel: "Rematch",
        onEndGameButtonClicked: () => gameClient.rematch(gameId),
      };
  }
};

export const EndGameButtons: FC<{
  gameId: string;
  playerName: string;
  playerState?: Player;
  gameTimeoutTime: string | null;
}> = ({ gameId, playerName, playerState, gameTimeoutTime }) => {
  const gameClient = useGameClient();
  const [msLeft, setMsLeft] = useState<number | undefined>(
    getMsLeft(gameTimeoutTime)
  );

  const {
    showBackToLobbyButton,
    showTimer,
    endGameButtonLabel,
    onEndGameButtonClicked,
  } = getDisplayByStatus(playerState?.status, gameId, playerName, gameClient);

  useEffect(() => {
    if (gameTimeoutTime) {
      const timer = setTimeout(
        () => setMsLeft(getMsLeft(gameTimeoutTime)),
        500
      );
      return () => clearTimeout(timer);
    }
  });

  return (
    <Box display="flex" alignItems="center">
      <ButtonGroup variant="contained">
        <Button
          disabled={!playerState || playerState.status === "SPECTATING"}
          onClick={onEndGameButtonClicked}
        >
          {endGameButtonLabel}
        </Button>
        {showBackToLobbyButton && (
          <Button onClick={() => gameClient.backToLobby(gameId)}>
            Change Players
          </Button>
        )}
      </ButtonGroup>
      {showTimer && gameTimeoutTime && (
        <Box ml={3}>
          <Typography>{msLeft && Math.floor(msLeft / 1000)}</Typography>
        </Box>
      )}
    </Box>
  );
};
