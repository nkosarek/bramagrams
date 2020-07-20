import React from 'react';
import { Box, CircularProgress, Typography } from '@material-ui/core';
import MessagePage from '../shared/MessagePage';

const NewGame = () => {
  // const [gameId, setGameId] = useState("");

  // useEffect(() => {
  //   // TODO: send create game request and redirect to game page
  // }, []);

  return (
    <MessagePage>
      <Box paddingRight={4}>
        <Typography variant="h4" color="secondary">Creating game...</Typography>
      </Box>
      <CircularProgress color="secondary" />
    </MessagePage>
  );
};

export default NewGame;
