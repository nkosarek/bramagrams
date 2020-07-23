import React from 'react';
import { Paper, Typography, makeStyles } from '@material-ui/core';
import { brown } from '@material-ui/core/colors';

const useStyles = makeStyles((theme) => ({
  paper: {
    display: "flex",
    justifyContent: "center",
    height: "2.2rem",
    width: "2.2rem",
  },
  lightTile: {
    backgroundColor: theme.palette.secondary.light,
  },
  darkTile: {
    backgroundColor: brown[50],
  },
}));

interface TileProps {
  letter: string;
  dark?: boolean;
}

const Tile = ({ letter, dark = false }: TileProps) => {
  const classes = useStyles();
  return (
    <Paper
      elevation={3}
      className={`${classes.paper} ${dark ? classes.darkTile : classes.lightTile}`}
    >
      <Typography variant="h4">{letter}</Typography>
    </Paper>
  );
};

export default Tile;
