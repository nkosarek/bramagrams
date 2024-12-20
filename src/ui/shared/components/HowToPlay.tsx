import { MAX_PLAYERS } from "@/shared/schema";
import { Tile } from "@/ui/game/active-game/Tile";
import { Word } from "@/ui/game/active-game/Word";
import { Add, ArrowForward, FileCopy } from "@mui/icons-material";
import {
  Box,
  Button,
  ButtonProps,
  Stack,
  Typography,
  TypographyProps,
} from "@mui/material";
import { FC } from "react";

const Header: FC<TypographyProps & { tile: string }> = ({
  tile,
  children,
  ...other
}) => {
  return (
    <Stack
      direction="row"
      spacing={0.25}
      sx={{ mb: 0.5, alignItems: "baseline" }}
    >
      <Tile letter={tile} small />
      <Typography fontWeight="bold" gutterBottom variant="h5" {...other}>
        {children}
      </Typography>
    </Stack>
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
        <Header tile="G">ame Lobby</Header>
        <Box ml={3}>
          <Body>
            After a new game is created from the home page, the player that
            created it will be sent to the lobby.
          </Body>
          <Body>
            In the game lobby, players can set their name, wait for other
            players to join, choose to spectate, and change the game{"'"}s
            settings.
          </Body>
          <Body>
            Click the{" "}
            <StyledButton variant="outlined" startIcon={<FileCopy />}>
              COPY GAME LINK
            </StyledButton>{" "}
            button and send the copied link to other players to invite them to
            the game.
          </Body>
          <Body>
            Up to {MAX_PLAYERS} players can play at a time. Any players added to
            the game after that number will automatically be made spectators.
          </Body>
          <Body>
            After at least 2 players have joined the game who are not
            spectating, click the{" "}
            <StyledButton variant="contained">START GAME</StyledButton> button
            to begin playing.
          </Body>
        </Box>
        <br />
        <Header tile="G">ameplay Basics</Header>
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
        <Header tile="S">tealing</Header>
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
            and {'"'}E{'"'} to make {'"'}PLACE{'"'}:
          </Body>
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: "center", color: "text.secondary" }}
          >
            <Word word="CAP" small />
            <Add />
            <Tile letter="L" small />
            <Add />
            <Tile letter="E" small />
            <ArrowForward />
            <Word word="PLACE" small />
          </Stack>
          <Box sx={{ pt: 2 }} />
          <Body>
            NOTE: It is highly frowned upon - though not illegal (yet) - to
            execute a steal where the new word has the same root as the original
            stolen word. For example: {'"'}CAT{'"'} to {'"'}CATS{'"'} or {'"'}
            JAZZY
            {'"'} to {'"'}JAZZILY{'"'}.
          </Body>
        </Box>
        <br />
        <Header tile="J">oining Mid-Game</Header>
        <Box ml={3}>
          <Body>
            If there are less than {MAX_PLAYERS} players playing in a game, any
            spectator can automatically join the game by claiming a word.
          </Body>
        </Box>
        <br />
        <Header tile="E">ndgame</Header>
        <Box ml={3} mb={3}>
          <Body>
            After all of the tiles have been {'"'}flipped{'"'} and added to the
            pool, the game ends once the remaining tiles have been claimed from
            the pool, all players have acknowledged that they are done searching
            for words by clicking the{" "}
            <StyledButton variant="contained">
              I can{"'"}t find any more words
            </StyledButton>{" "}
            button, or the endgame timer has run out. The endgame timer starts
            once at least one player acknowledges they are done searching for
            words.
          </Body>
          <Body>
            The player with the highest number of words claimed is the winner.
          </Body>
          <Body>
            Players can then click the{" "}
            <StyledButton variant="contained">Rematch</StyledButton> button to
            restart the game with the same settings and players, or they can
            click the{" "}
            <StyledButton variant="outlined">Go Back to Lobby</StyledButton>{" "}
            button to invite new players, change the game{"'"}s settings, or
            change which players are playing and spectating.
          </Body>
        </Box>
      </Box>
    </Box>
  );
};
