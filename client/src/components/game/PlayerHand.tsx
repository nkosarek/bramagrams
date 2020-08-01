import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { ArrowDropDown, Check, MoreHoriz } from '@material-ui/icons';
import Word from './Word';

interface PlayerHandProps {
  name: string;
  words: string[];
  isYou: boolean;
  isCurrPlayer: boolean;
  isWaiting?: boolean;
  isReady?: boolean;
  dark?: boolean;
}

const PlayerHand = ({
  name,
  words,
  isYou,
  isCurrPlayer,
  isWaiting,
  isReady,
  dark,
}: PlayerHandProps) => (
  <Box display="flex" flexDirection="column" alignItems="center">
    {isCurrPlayer ? (
      <ArrowDropDown fontSize="large" color="action" />
    ) : isWaiting ? (
      <MoreHoriz fontSize="large" />
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
        <Box m={2} key={i}>
          <Word word={word} dark={dark} />
        </Box>
      ))}
    </Box>
  </Box>
);

export default PlayerHand;
