import React from 'react';
import { Box, Typography } from '@material-ui/core';
import Word from '../../shared/Word';
import { CurrentPlayerIcon } from '../../shared/icons/CurrentPlayerIcon';
import { DonePlayingIcon } from '../../shared/icons/DonePlayingIcon';

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
}: PlayerHandProps) => {
  const nameColor = isYou ? "secondary" : "textSecondary";
  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      {isCurrPlayer ? (
        <CurrentPlayerIcon color={nameColor} />
      ) : isReady ? (
        <DonePlayingIcon color={nameColor} />
      ) : (
        // Hidden because the background is primary color
        <CurrentPlayerIcon color="primary" />
      )}
      <Typography variant="h4" color={nameColor}>
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
};

export default PlayerHand;
