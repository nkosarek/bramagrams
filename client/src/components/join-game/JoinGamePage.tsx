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
  <Typography color="textSecondary">
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
        <form onSubmit={() => setJoinedGameId(typedGameId)}>
          <Box display="flex" pt={1} pl={2}>
            <TextField
              id="join-private-game-id-input"
              label="Game ID"
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
        <Box py={3}>
          <Divider />
        </Box>
        <Typography variant="h5" color="secondary" gutterBottom>
          Public Games
        </Typography>
        <Box px={2}>
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
                        <Box display="flex" justifyContent="flex-start">
                          <Tooltip
                            arrow
                            title={
                              `${numPlaying} Player${numPlaying !== 1 ? 's' : ''}, ${
                                numSpectating
                              } Spectator${numSpectating !== 1 ? 's' : ''}`
                            }
                          >
                            <Box my={-3} display="flex" alignItems="center">
                              <TableBodyTypography>
                                {numPlaying}
                              </TableBodyTypography>
                              <Box pl={1} />
                              <PlayerIcon color="textSecondary" />
                              <Box pl={4} />
                              <TableBodyTypography>
                                {numSpectating}
                              </TableBodyTypography>
                              <Box pl={1} />
                              <SpectatorIcon color="textSecondary" />
                            </Box>
                          </Tooltip>
                        </Box>
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
