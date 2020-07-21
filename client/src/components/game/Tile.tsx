import React from 'react';
import { Paper, Typography, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  paper: {
    display: "flex",
    justifyContent: "center",
    backgroundColor: theme.palette.secondary.light,
    height: "3rem",
    width: "3rem",
  }
}));

const Tile = ({ letter } : { letter: string }) => {
  const classes = useStyles();
  return (
    <Paper elevation={3} className={classes.paper}>
      <Typography variant="h3">{letter}</Typography>
    </Paper>
  );
};

export default Tile;
