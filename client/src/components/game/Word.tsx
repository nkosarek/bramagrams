import React from 'react';
import { Box } from '@material-ui/core';
import Tile from './Tile';

interface WordProps {
  word: string,
  dark?: boolean,
}

const Word = ({ word, dark = false }: WordProps) => (
  <Box display="flex">
    {word.split('').map((letter, index) => (
      <Box m={0.5} key={index}>
        <Tile letter={letter} dark={dark} />
      </Box>
    ))}
  </Box>
);

export default Word;
