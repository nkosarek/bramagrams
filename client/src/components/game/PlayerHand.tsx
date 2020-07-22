import React from 'react';
import { Box, Typography } from '@material-ui/core';
import Word from './Word';

interface PlayerHandProps {
  name: string;
  words: string[];
}

const PlayerHand = ({ name, words }: PlayerHandProps) => {
  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Typography variant="h4" color="secondary">{name}</Typography>
      <Box
        display="flex"
        flexWrap="wrap"
        justifyContent="center"
        alignItems="center"
        alignContent="flex-start"
      >
        {words.map((word, i) => (
          <Box m={2} key={i}>
            <Word word={word} />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default PlayerHand;
