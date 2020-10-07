import React from 'react';
import { Box } from '@material-ui/core';
import Tile from './Tile';

interface WordProps {
  word: string,
  dark?: boolean,
  small?: boolean;
}

const Word = ({ word, dark = false, small = false }: WordProps) => (
  <Box display="flex">
    {word.split('').map((letter, index) => (
      <Box m={small ? 0.3 : 0.5} key={index}>
        <Tile letter={letter} dark={dark} small={small} />
      </Box>
    ))}
  </Box>
);

export default Word;
