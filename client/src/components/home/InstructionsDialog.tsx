import React from 'react';
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Slide,
  Toolbar,
  Typography,
  makeStyles,
} from '@material-ui/core';
import { TypographyProps } from '@material-ui/core/Typography/Typography';
import { ButtonProps } from '@material-ui/core/Button/Button';
import { TransitionProps } from '@material-ui/core/transitions/transition';
import { Close } from '@material-ui/icons';
import StyledDialog from '../shared/StyledDialog';

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: 'relative',
    backgroundColor: theme.palette.secondary.light,
  },
  scrollableSection: {
    scrollbarColor: `${theme.palette.secondary.light} ${theme.palette.primary.dark}`,
    '&::-webkit-scrollbar-track': {
      background: theme.palette.primary.dark,
    },
    '&::-webkit-scrollbar-thumb': {
      border: `3px solid ${theme.palette.primary.dark}`,
    },
  },
  header: {
    color: theme.palette.secondary.light,
  },
  body: {
    color: theme.palette.common.white,
  },
}));

const Header = ({ children, ...other }: TypographyProps) => {
  const classes = useStyles();
  return (
    <Typography gutterBottom className={classes.header} variant="h5" {...other}>
      <Box fontWeight="fontWeightBold">
        {children}
      </Box>
    </Typography>
  );
};

const Body = ({ children, ...other }: TypographyProps) => {
  const classes = useStyles();
  return (
    <Typography gutterBottom className={classes.body} variant="body1" {...other}>
      {children}
    </Typography>
  );
};

const StyledButton = (props: ButtonProps) => (
  <Button color="secondary" size="small" {...props} />
);

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface InstructionsDialogProps {
  open: boolean,
  onClose: () => void,
}

const InstructionsDialog = ({ open, onClose }: InstructionsDialogProps) => {
  const classes = useStyles();

  return (
    <StyledDialog
      dark
      fullScreen
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
    >
      <AppBar className={classes.appBar}>
        <Toolbar>
          <IconButton edge="start" onClick={onClose}>
            <Close />
          </IconButton>
          <Typography variant="h6">
            How To Play
          </Typography>
        </Toolbar>
      </AppBar>
      <Box ml={3} pt={3} overflow="auto" className={classes.scrollableSection}>
        <Box ml={2}>
          <Header>
            Starting
          </Header>
          <Box ml={3}>
            <Body>
              After a game is created from the home page, the player that created it will be sent
              to the lobby.
            </Body>
            <Body>
              In the game lobby, players can set their name and wait for other players to join.
            </Body>
            <Body>
              Once all players have set their names and clicked
              the <StyledButton>READY</StyledButton> button to signal they are ready to start,
              the <StyledButton>START GAME</StyledButton> button can be clicked to begin playing.
            </Body>
          </Box>
          <br/>
          <Header>
            Basics
          </Header>
          <Box ml={3}>
            <Body>
              Each player will take turns "flipping" tiles over to add them to the pool at the top
              by hitting the space bar.
            </Body>
            <Body>
              Once a word with at least 3 letters can be constructed using the tiles
              in the pool, players can type that word and hit the Enter key to claim it.
            </Body>
            <Body>
              When a word is claimed by a player, it will move to that player's hand below
              their name. But be careful! The word can still be stolen by other players.
            </Body>
          </Box>
          <br/>
          <Header>
            Stealing
          </Header>
          <Box ml={3}>
            <Body>
              Any word that has been claimed can be stolen by any player - including the player
              who originally claimed it.
            </Body>
            <Body>
              However, to steal a word, players must <em>add</em> tiles to that word, either by
              taking additional tiles from the pool, or by stealing multiple words at once.
            </Body>
          </Box>
          <br/>
          <Header>
            Endgame
          </Header>
          <Box ml={3}>
            <Body>
              Once all of the tiles have been "flipped" and added to the pool, the game will not
              officially end until all players have acknowledged that they are done searching
              for words by clicking the <StyledButton variant="contained">DONE</StyledButton> button.
            </Body>
            <Body>
              Players can then choose to play a rematch if they all click
              the <StyledButton variant="contained">REMATCH</StyledButton> button.
            </Body>
          </Box>
        </Box>
      </Box>
    </StyledDialog>
  );
};

export default InstructionsDialog;
