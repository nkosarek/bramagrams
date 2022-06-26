import React from 'react';
import { Player } from 'bramagrams-shared';
import { Box, Divider, List, ListItem, ListItemText, Typography, makeStyles } from '@material-ui/core';
import { SpectatorIcon } from '../../shared/icons/SpectatorIcon';

const useStyles = makeStyles((theme) => ({
  listText: {
    color: theme.palette.secondary.light,
  },
  playerText: {
    color: theme.palette.secondary.main,
  },
  listBox: {
    scrollbarColor: `${theme.palette.secondary.light} ${theme.palette.primary.dark}`,
    '&::-webkit-scrollbar-track': {
      background: theme.palette.primary.dark,
    },
    '&::-webkit-scrollbar-thumb': {
      border: `3px solid ${theme.palette.primary.dark}`,
    },
  },
}));

interface SpectatorsListProps {
  spectators: Player[];
  playerName: string;
}

const SpectatorsList = ({ spectators, playerName }: SpectatorsListProps) => {
  const classes = useStyles();
  return (
    <Box maxHeight={1} display="flex" flexDirection="column">
      <Box m={2} display="flex" alignItems="flex-end">
        <Box pr={2}>
          <SpectatorIcon />
        </Box>
        <Typography variant="h6" color="secondary">
          Spectators
        </Typography>
      </Box>
      <Box flexGrow={1} overflow="auto" className={classes.listBox}>
        <List>
          {spectators.map((player, index) => (
            <div key={player.name}>
              {index > 0 && (
                <Divider variant="middle" component="li" />
              )}
              <ListItem>
                <ListItemText primary={(
                  <Typography
                    variant="subtitle1"
                    className={player.name === playerName ? classes.playerText : classes.listText}
                  >
                    {player.name}
                  </Typography>
                )} />
              </ListItem>
            </div>
          ))}
        </List>
      </Box>
    </Box>
  )
};

export default SpectatorsList;
