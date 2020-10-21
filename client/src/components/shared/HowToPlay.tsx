import React from 'react';
import {
  Box,
  Button,
  Typography,
  makeStyles,
} from '@material-ui/core';
import { TypographyProps } from '@material-ui/core/Typography/Typography';
import { ButtonProps } from '@material-ui/core/Button/Button';
import { FileCopy, Visibility } from '@material-ui/icons';
import { MAX_PLAYERS } from 'bramagrams-shared';

const useStyles = makeStyles((theme) => ({
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

const HowToPlay = () => {
  const classes = useStyles();
  return (
    <Box p={3} overflow="auto" className={classes.scrollableSection}>
      <Box ml={2}>
        <Header>
          Game Lobby
        </Header>
        <Box ml={3}>
          <Body>
            After a game is created from the home page, the player that created it will be sent
            to the lobby.
          </Body>
          <Body>
            In the game lobby, players can set their name and wait for other players to join.
            Any player in the lobby can invite more players by clicking
            the <StyledButton startIcon={<FileCopy />}>COPY GAME LINK</StyledButton> button and
            sending the copied link to whomever they want to invite.
          </Body>
          <Body>
            Up to {MAX_PLAYERS} players can play at a time. Any players added to the game after
            that number will automatically be made spectators. Players can also choose to
            spectate the game by clicking the <StyledButton>SPECTATE</StyledButton> button.
            Spectators can click the <StyledButton>JOIN</StyledButton> button if they want to
            play in the game as long as there are less than {MAX_PLAYERS} players playing
            already.
          </Body>
          <Body>
            Once at least 2 players have joined the game and are not spectating,
            the <StyledButton>START GAME</StyledButton> button can be clicked to begin playing.
          </Body>
        </Box>
        <br/>
        <Header>
          Basics
        </Header>
        <Box ml={3}>
          <Body>
            Each player will take turns "flipping" tiles over by hitting the space bar to add
            them to the pool at the top of the page.
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
          <Body>
            NOTE: It is highly frowned upon (though not illegal) to execute a steal where
            the new word has the same root as the original stolen word. For example:
            "CAT" to "CATS" or "JAZZY" to "JAZZILY".
          </Body>
        </Box>
        <br/>
        <Header>
          Joining Mid-Game
        </Header>
        <Box ml={3}>
          <Body>
            If there are less than {MAX_PLAYERS} players playing in a game, any spectator can
            automatically join the game if they claim a word.
          </Body>
        </Box>
        <br/>
        <Header>
          Endgame
        </Header>
        <Box ml={3}>
          <Body>
            Once all of the tiles have been "flipped" and added to the pool, the game will not
            end until either all of the tiles have been claimed from the pool or all players
            have acknowledged that they are done searching for words by clicking
            the <StyledButton variant="contained">DONE</StyledButton> button.
          </Body>
          <Body>
            Players can then click
            the <StyledButton variant="contained">REMATCH</StyledButton> button to play a
            rematch with the same set of players, or they can click
            the <StyledButton variant="contained">CHANGE PLAYERS</StyledButton> button to
            go back to the game lobby to invite new players or change which players are playing
            and spectating.
          </Body>
        </Box>
      </Box>
    </Box>
  );
};

export default HowToPlay;
