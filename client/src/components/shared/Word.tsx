import React from 'react';
import { Box } from '@material-ui/core';
import Tile from './Tile';

interface WordProps {
  word?: string,
  dark?: boolean,
  small?: boolean;
}

const Word = ({ word, dark, small }: WordProps) => {
  const addMargin = (index: string | number | undefined, children: React.ReactChild) => (
    <Box key={index} m={small ? 0.3 : 0.5}>
      {children}
    </Box>
  );
  return (
    <Box display="flex">
      {!word ? addMargin(undefined,
        <Tile />
      ) : word.split('').map((letter, index) => addMargin(index,
        <Tile letter={letter} dark={dark} small={small} />
      ))}
    </Box>
  );
}

export default Word;
