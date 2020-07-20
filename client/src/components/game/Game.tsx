import React from 'react';
import { useParams } from 'react-router-dom'
import { Typography } from '@material-ui/core';
import MessagePage from '../shared/MessagePage';

const Game = () => {
  const { gameId } = useParams();

  return (
    <MessagePage>
      <Typography variant="h4" color="secondary">
        Game ID '{gameId}' does not exist!
      </Typography>
    </MessagePage>
  );
};

export default Game;
