import React from 'react';
import { Player, PlayerStatuses } from 'bramagrams-shared';
import api from '../../api/api';
import { Button } from '@material-ui/core';

interface EndGameButtonsProps {
  gameId: string;
  playerName: string;
  playerState?: Player;
}

const EndGameButtons = ({ gameId, playerName, playerState }: EndGameButtonsProps) => {
  // TODO: Add New Game button next to Rematch
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
      break;
  }

  return (
    <Button
      variant="contained"
      color="secondary"
      onClick={onEndGameButtonClicked}
    >
      {endGameButtonLabel}
    </Button>
  );
};

export default EndGameButtons;
