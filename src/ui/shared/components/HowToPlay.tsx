import { MAX_PLAYERS } from "@/shared/schema";
import { FileCopy } from "@mui/icons-material";
import {
  Box,
  Button,
  ButtonProps,
  Typography,
  TypographyProps,
} from "@mui/material";
import { FC } from "react";

const Header = ({ children, ...other }: TypographyProps) => {
  return (
    <Typography fontWeight="bold" gutterBottom variant="h5" {...other}>
      {children}
    </Typography>
  );
};

const Body = ({ children, ...other }: TypographyProps) => {
  return (
    <Typography gutterBottom color="textSecondary" variant="body1" {...other}>
      {children}
    </Typography>
  );
};

const StyledButton = (props: ButtonProps) => <Button size="small" {...props} />;

export const HowToPlay: FC = () => {
  return (
    <Box overflow="auto">
      <Box mx={3} py={3}>
        <Header>Game Lobby</Header>
        <Box ml={3}>
          <Body>
            After a game is created from the home page, the player that created
            it will be sent to the lobby.
          </Body>
          <Body>
            In the game lobby, players can set their name and wait for other
            players to join. Any player in the lobby can invite more players by
            clicking the{" "}
            <StyledButton startIcon={<FileCopy />}>COPY GAME LINK</StyledButton>{" "}
            button and sending the copied link to other players.
          </Body>
          <Body>
            Up to {MAX_PLAYERS} players can play at a time. Any players added to
            the game after that number will automatically be made spectators.
            Players can also choose to spectate the game by clicking the{" "}
            <StyledButton>SPECTATE</StyledButton> button. Spectators can click
            the <StyledButton>JOIN</StyledButton> button if they want to play in
            the game as long as there are less than {MAX_PLAYERS} players
            playing already.
          </Body>
          <Body>
            Once at least 2 players have joined the game and are not spectating,
            the <StyledButton>START GAME</StyledButton> button can be clicked to
            begin playing.
          </Body>
        </Box>
        <br />
        <Header>Gameplay Basics</Header>
        <Box ml={3}>
          <Body>
            Each player will take turns {'"'}flipping{'"'} tiles over by hitting
            the space bar. This will add them to the pool at the top of the
            page.
          </Body>
          <Body>
            Once a word with at least 3 letters can be constructed using the
            tiles in the pool, players can type that word and hit the Enter key
            to claim it.
          </Body>
          <Body>
            When a word is claimed by a player, it will move to that player{"'"}
            s hand below their name. But be careful! The word can still be
            stolen by other players.
          </Body>
        </Box>
        <br />
        <Header>Stealing</Header>
        <Box ml={3}>
          <Body>
            Any word that has been claimed can be stolen by any player -
            including the player who originally claimed it.
          </Body>
          <Body>
            However, to steal a word, players must <em>add</em> tiles to that
            word, either by taking additional tiles from the pool, or by
            stealing multiple words at once.
          </Body>
          <Body>
            The letters of a word can also be rearranged in order to steal it.
            For example, {'"'}CAP{'"'} can be stolen by adding an {'"'}L{'"'}{" "}
            and {'"'}E{'"'} to make {'"'}PLACE{'"'}.
          </Body>
          <Body>
            NOTE: It is highly frowned upon (though not illegal) to execute a
            steal where the new word has the same root as the original stolen
            word. For example: {'"'}CAT{'"'} to {'"'}CATS{'"'} or {'"'}JAZZY
            {'"'} to {'"'}JAZZILY{'"'}.
          </Body>
        </Box>
        <br />
        <Header>Joining Mid-Game</Header>
        <Box ml={3}>
          <Body>
            If there are less than {MAX_PLAYERS} players playing in a game, any
            spectator can automatically join the game if they claim a word.
          </Body>
        </Box>
        <br />
        <Header>Endgame</Header>
        <Box ml={3}>
          <Body>
            After all of the tiles have been {'"'}flipped{'"'} and added to the
            pool, the game ends once the remaining tiles have been claimed from
            the pool, the timer has run out, or all players have acknowledged
            that they are done searching for words by clicking the{" "}
            <StyledButton variant="contained">DONE</StyledButton> button.
          </Body>
          <Body>
            Players can then click the{" "}
            <StyledButton variant="contained">REMATCH</StyledButton> button to
            play a rematch with the same set of players, or they can click the{" "}
            <StyledButton variant="contained">CHANGE PLAYERS</StyledButton>{" "}
            button to go back to the game lobby to invite new players or change
            which players are playing and spectating.
          </Body>
        </Box>
      </Box>
    </Box>
  );
};
