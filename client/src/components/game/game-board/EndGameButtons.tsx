import React, { useEffect, useState } from 'react';
import { Player, PlayerStatuses } from 'bramagrams-shared';
import api from '../../../api/api';
import { Box, Button, ButtonGroup, Typography } from '@material-ui/core';

const getMsLeft = (gameTimeoutTime: string | null): number | undefined => {
  if (!gameTimeoutTime) return;
  return Math.floor(new Date(gameTimeoutTime).getTime() - Date.now());
}

interface EndGameButtonsProps {
  gameId: string;
  playerName: string;
  playerState?: Player;
  gameTimeoutTime: string | null;
}

const EndGameButtons = ({ gameId, playerName, playerState, gameTimeoutTime }: EndGameButtonsProps) => {
  const [msLeft, setMsLeft] = useState<number | undefined>(getMsLeft(gameTimeoutTime));

  let showBackToLobbyButton = false;
  let showTimer = true;
  let endGameButtonLabel = 'Rematch';
  let onEndGameButtonClicked = () => {};
  switch(playerState?.status) {
    case PlayerStatuses.PLAYING:
      endGameButtonLabel = 'Done';
      onEndGameButtonClicked = () => api.readyToEnd(gameId, playerName);
      break;
    case PlayerStatuses.READY_TO_END:
      endGameButtonLabel = 'No wait';
      onEndGameButtonClicked = () => api.notReadyToEnd(gameId, playerName);
      break;
    case PlayerStatuses.SPECTATING:
    case PlayerStatuses.ENDED:
      endGameButtonLabel = 'Rematch';
      onEndGameButtonClicked = () => api.rematch(gameId);
      showBackToLobbyButton = true;
      showTimer = false;
      break;
  }

  const onBackToLobbyButtonClicked = () => api.backToLobby(gameId);

  useEffect(() => {
    if (gameTimeoutTime) {
      const timer = setTimeout(() => setMsLeft(getMsLeft(gameTimeoutTime)), 500);
      return () => clearTimeout(timer);
    }
  });

  return (
    <Box display="flex" alignItems="center">
      <ButtonGroup>
        <Button
          variant="contained"
          color="secondary"
          disabled={!playerState || playerState.status === PlayerStatuses.SPECTATING}
          onClick={onEndGameButtonClicked}
        >
          {endGameButtonLabel}
        </Button>
        {showBackToLobbyButton && (
          <Button
            variant="contained"
            color="secondary"
            onClick={onBackToLobbyButtonClicked}
          >
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

export default EndGameButtons;
