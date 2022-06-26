import React from 'react';
import { Paper, Typography, makeStyles } from '@material-ui/core';

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
  placeholderTile: {
    backgroundColor: theme.palette.primary.main,
  },
  lightTile: {
    backgroundColor: theme.palette.tile.main,
    color: theme.palette.getContrastText(theme.palette.tile.main),
  },
  darkTile: {
    backgroundColor: theme.palette.tile.disabled,
    color: theme.palette.getContrastText(theme.palette.tile.disabled),
  },
  tileText: {
    color: theme.palette.tile.text,
  },
}));

interface TileProps {
  letter?: string;
  dark?: boolean;
  small?: boolean;
}

const Tile = ({ letter, dark, small }: TileProps) => {
  const classes = useStyles();
  return (
    <Paper
      elevation={letter ? 3 : 0}
      className={`
        ${classes.paper}
        ${small ? classes.smallTile : classes.largeTile}
        ${!letter ? classes.placeholderTile : dark ? classes.darkTile : classes.lightTile}
      `}
    >
      <Typography
        variant={small ? "h5" : "h4"}
        className={classes.tileText}
      >
        {letter}
      </Typography>
    </Paper>
  );
};

export default Tile;
