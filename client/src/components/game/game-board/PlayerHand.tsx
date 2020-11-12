import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { ArrowDropDown, Check } from '@material-ui/icons';
import Word from '../../shared/Word';

interface PlayerHandProps {
  name: string;
  words: string[];
  isYou: boolean;
  isCurrPlayer: boolean;
  isWaiting?: boolean;
  isReady?: boolean;
  dark?: boolean;
  small?: boolean;
}

const PlayerHand = ({
  name,
  words,
  isYou,
  isCurrPlayer,
  isReady,
  dark,
  small,
}: PlayerHandProps) => (
  <Box display="flex" flexDirection="column" alignItems="center">
    {isCurrPlayer ? (
      <ArrowDropDown fontSize="large" />
    ) : isReady ? (
      <Check fontSize="large" />
    ) : (
      // Hidden because the background is primary color
      <ArrowDropDown fontSize="large" color="primary" />
    )}
    <Typography variant="h4" color={isYou ? "secondary" : undefined}>
      {name}
    </Typography>
    <Box
      display="flex"
      flexWrap="wrap"
      justifyContent="center"
      alignItems="center"
      alignContent="flex-start"
    >
      {words.map((word, i) => (
        <Box m={small ? 1.5 : 2} key={i}>
          <Word word={word} dark={dark} small={small} />
        </Box>
      ))}
    </Box>
  </Box>
);

export default PlayerHand;
