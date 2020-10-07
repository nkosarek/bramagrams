import React from 'react';
import { Paper, Typography, makeStyles } from '@material-ui/core';
import { brown } from '@material-ui/core/colors';

const useStyles = makeStyles((theme) => ({
  paper: {
    display: "flex",
    justifyContent: "center",
    paddingBottom: '0.1rem',
  },
  largeTile: {
    height: "2.2rem",
    width: "2.2rem",
  },
  smallTile: {
    height: "1.65rem",
    width: "1.65rem",
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
  small?: boolean;
}

const Tile = ({ letter, dark = false, small = false }: TileProps) => {
  const classes = useStyles();
  return (
    <Paper
      elevation={3}
      className={`
        ${classes.paper}
        ${small ? classes.smallTile : classes.largeTile}
        ${dark ? classes.darkTile : classes.lightTile}
      `}
    >
      <Typography variant={small ? "h5" : "h4"}>{letter}</Typography>
    </Paper>
  );
};

export default Tile;
