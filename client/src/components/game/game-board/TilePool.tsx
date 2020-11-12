import React from 'react';
import { Box } from '@material-ui/core';
import Tile from '../../shared/Tile';

interface TilePoolProps {
  letters: string[];
  dark?: boolean;
}

const TilePool = ({ letters, dark }: TilePoolProps) => {
  const addMargin = (index: string | number | undefined, children: React.ReactChild) => (
    <Box key={index} m={0.5}>
      {children}
    </Box>
  );
  return (
    <Box display="flex" flexWrap="wrap" justifyContent="center" alignItems="center" alignContent="flex-start">
      {!letters.length ? addMargin(undefined,
        <Tile />
      ) : letters.map((letter, index) => addMargin(index,
        <Tile letter={letter} dark={dark} />
      ))}
    </Box>
  );
}

export default TilePool;
