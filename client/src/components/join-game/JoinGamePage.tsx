import {
  Box,
  Button,
  CircularProgress,
  Divider,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { GameState, GameStatuses, PlayerStatuses } from 'bramagrams-shared';
import React, { useEffect, useState } from 'react';
import api from '../../api/api';
import { BoldTypography } from '../shared/BoldTypography';
import { PlayerIcon } from '../shared/icons/PlayerIcon';
import { SpectatorIcon } from '../shared/icons/SpectatorIcon';
import Page from '../shared/Page';
import { RedirectToGame } from '../shared/RedirectToGame';

const TableHeadTypography: React.FC = ({ children }) => (
  <BoldTypography color="secondary">
    {children}
  </BoldTypography>
);

const TableBodyTypography: React.FC = ({ children }) => (
  <Typography color="secondary">
    {children}
  </Typography>
);

const useClickableRowStyles = makeStyles(() => ({
  hover: {
    cursor: 'pointer',
  },
}));

export const JoinGamePage: React.FC = () => {
  const clickableRowClasses = useClickableRowStyles();

  const [typedGameId, setTypedGameId] = useState('');
  const [joinedGameId, setJoinedGameId] = useState('');
  const [publicGames, setPublicGames] =
    useState<{ [gameId: string]: GameState } | undefined>();

  const getNumSpectators = (gameState: GameState) =>
    gameState.players.filter((p) => p.status === PlayerStatuses.SPECTATING).length;
  const getNumPlayingPlayers = (gameState: GameState) =>
    gameState.players.length - getNumSpectators(gameState);

  const getGameStatusMessage = (gameState: GameState) => {
    switch (gameState.status) {
      case GameStatuses.WAITING_TO_START:
        return "In Lobby";
      case GameStatuses.IN_PROGRESS:
        return "In Game";
      case GameStatuses.ENDED:
        return "Game Ended";
      default:
        console.error("UNKNOWN GAME STATUS", gameState.status);
        return null;
    }
  };

  useEffect(() => {
    api.getPublicGames().then(setPublicGames);
  }, []);

  return joinedGameId ? (
    <RedirectToGame gameId={joinedGameId} />
  ) : (
    <Page>
      <Box flexGrow={1} p={2}>
        <BoldTypography variant="h3" color="secondary" gutterBottom>
          Join Game
        </BoldTypography>
        <Typography variant="h5" color="secondary" gutterBottom>
          Private Game
        </Typography>
        <Typography gutterBottom>
          Paste the link of the game you want to join into the address bar
        </Typography>
        <Box ml={2}>
          <Typography gutterBottom>or</Typography>
        </Box>
        <Typography gutterBottom>
          Enter the game's ID and click JOIN.
        </Typography>
        <form onSubmit={() => setJoinedGameId(typedGameId)}>
          <Box display="flex">
            <TextField
              value={typedGameId}
              onChange={(event) => setTypedGameId(event.target.value)}
              autoFocus
              color="secondary"
              placeholder="ex: f005ba11"
              size="small"
              variant="outlined"
            />
            <Button
              disabled={!typedGameId}
              color="secondary"
              type="submit"
            >
              Join
            </Button>
          </Box>
        </form>
        <Box py={2}>
          <Divider />
        </Box>
        <Typography variant="h5" color="secondary" gutterBottom>
          Public Game
        </Typography>
        <Typography gutterBottom>
          Click a game below to join it
        </Typography>
        <Box p={3}>
          {!publicGames ? (
            <CircularProgress color="secondary" />
          ) : !Object.keys(publicGames).length ? (
            <Typography gutterBottom>
              There are no public games to join
            </Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableHeadTypography>
                      Game ID
                    </TableHeadTypography>
                  </TableCell>
                  <TableCell>
                    <TableHeadTypography>
                      Status
                    </TableHeadTypography>
                  </TableCell>
                  <TableCell>
                    <TableHeadTypography>
                      Participants
                    </TableHeadTypography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(publicGames).map(([gameId, gameState]) => {
                  const numPlaying = getNumPlayingPlayers(gameState);
                  const numSpectating = getNumSpectators(gameState);
                  return (
                    <TableRow
                      hover
                      role="button"
                      key={gameId}
                      onClick={() => setJoinedGameId(gameId)}
                      classes={clickableRowClasses}
                    >
                      <TableCell>
                        <TableBodyTypography>
                          {gameId}
                        </TableBodyTypography>
                      </TableCell>
                      <TableCell>
                        <TableBodyTypography>
                          {getGameStatusMessage(gameState)}
                        </TableBodyTypography>
                      </TableCell>
                      <TableCell>
                        <Tooltip
                          arrow
                          title={
                            `${numPlaying} Player${numPlaying !== 1 ? 's' : ''}, ${
                              numSpectating
                            } Spectator${numSpectating !== 1 ? 's' : ''}`
                          }
                        >
                          <Box display="flex" alignItems="center">
                            <TableBodyTypography>
                              {numPlaying}
                            </TableBodyTypography>
                            <Box pl={1} />
                            <PlayerIcon />
                            <Box pl={4} />
                            <TableBodyTypography>
                              {numSpectating}
                            </TableBodyTypography>
                            <Box pl={1} />
                            <SpectatorIcon />
                          </Box>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Box>
      </Box>
    </Page>
  );
};
