import React from 'react';
import { Player, PlayerStatuses } from 'bramagrams-shared';
import api from '../../../api/api';
import { Button, ButtonGroup } from '@material-ui/core';

interface EndGameButtonsProps {
  gameId: string;
  playerName: string;
  playerState?: Player;
}

const EndGameButtons = ({ gameId, playerName, playerState }: EndGameButtonsProps) => {
  let showBackToLobbyButton = false;
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
      break;
  }

  const onBackToLobbyButtonClicked = () => api.backToLobby(gameId);

  return (
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
  );
};

export default EndGameButtons;
