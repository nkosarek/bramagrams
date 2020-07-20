import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@material-ui/core';
import MessagePage from '../shared/MessagePage';
import api from '../../api/api';

const NewGame = () => {
  const [gameId, setGameId] = useState("");

  useEffect(() => {
    api.createGame().then(setGameId);
  }, []);

  return gameId ? (
    <Redirect to={`/game/${gameId}`}/>
  ) : (
    <MessagePage>
      <Box paddingRight={4}>
        <Typography variant="h4" color="secondary">Creating game...</Typography>
      </Box>
      <CircularProgress color="secondary" />
    </MessagePage>
  );
};

export default NewGame;
