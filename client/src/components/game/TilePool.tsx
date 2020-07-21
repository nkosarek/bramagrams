import React from 'react';
import { Box } from '@material-ui/core';
import Tile from './Tile';

const TilePool = ({ letters }: { letters: string[] }) => (
  <Box display="flex" flexWrap="wrap" justifyContent="center" alignItems="center" alignContent="flex-start">
    {letters.map((letter, index) => (
      <Box key={index} m={0.5}>
        <Tile letter={letter}/>
      </Box>
    ))}
  </Box>
  );

export default TilePool;
