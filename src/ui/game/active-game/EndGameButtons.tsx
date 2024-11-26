import { Player } from "@/shared/schema";
import { GameClient } from "@/ui/game-client";
import { useGameClient } from "@/ui/game/useGameClient";
import { Box, Button, ButtonGroup, Typography } from "@mui/material";
import { FC, useEffect, useState } from "react";

const calculateMsLeft = (
  gameTimeoutTime: string | null
): number | undefined => {
  if (!gameTimeoutTime) return;
  const msLeft = new Date(gameTimeoutTime).getTime() - Date.now();
  return msLeft > 0 ? msLeft : 0;
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
        endGameButtonLabel: "I can't find any more words",
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
    calculateMsLeft(gameTimeoutTime)
  );

  const {
    showBackToLobbyButton,
    showTimer,
    endGameButtonLabel,
    onEndGameButtonClicked,
  } = getDisplayByStatus(playerState?.status, gameId, playerName, gameClient);

  useEffect(() => {
    if (!gameTimeoutTime) {
      setMsLeft(undefined);
      return;
    }

    setMsLeft(calculateMsLeft(gameTimeoutTime));
    const interval = setInterval(
      () => setMsLeft(calculateMsLeft(gameTimeoutTime)),
      500
    );
    return () => clearInterval(interval);
  }, [gameTimeoutTime]);

  return (
    <Box display="flex" alignItems="center">
      <ButtonGroup variant="contained">
        <Button
          // Rerender button when label changes to ensure it loses focus
          key={endGameButtonLabel}
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
      {showTimer && msLeft !== undefined && (
        <Box ml={3}>
          <Typography
            variant="overline"
            fontWeight="bold"
            sx={({ typography: { h6 } }) => ({
              fontSize: h6.fontSize,
              lineHeight: h6.lineHeight,
            })}
          >
            {Math.ceil(msLeft / 1000)}
          </Typography>
        </Box>
      )}
    </Box>
  );
};
