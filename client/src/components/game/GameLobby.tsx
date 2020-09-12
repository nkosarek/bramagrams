import React, { useState, useEffect, FormEvent } from 'react';
import { Box, Button, ButtonGroup, TextField, Typography } from '@material-ui/core';
import { MoreHoriz, Person, Visibility } from '@material-ui/icons';
import Page from '../shared/Page';
import api from '../../api/api';
import { MAX_PLAYERS, Player, PlayerStatuses } from 'bramagrams-shared';

const getNumPlayingPlayers = (players: Player[]) => {
  return players.filter(p => p.status === PlayerStatuses.READY_TO_START).length;
};

interface GameLobbyProps {
  gameId: string;
  playerName: string;
  players: Player[];
  onNameClaimed: (name: string) => void;
};

const GameLobby = ({ gameId, playerName, players, onNameClaimed }: GameLobbyProps) => {
  const [requestedName, setRequestedName] = useState(playerName);
  const playerState = players.find(player => player.name === playerName);
  const [editingName, setEditingName] = useState(!playerState);
  const [hasEdited, setHasEdited] = useState(false);

  const hasNameError = requestedName !== playerName && players.map(p => p.name).includes(requestedName);

  const statusChangeButtonLabel = playerState?.status === PlayerStatuses.READY_TO_START
    ? "Spectate"
    : "Join";
  const statusChangeButtonDisabled = !playerState ||
    (playerState.status === PlayerStatuses.SPECTATING && getNumPlayingPlayers(players) >= MAX_PLAYERS);

  const startDisabled = !playerState ||
    playerState.status === PlayerStatuses.SPECTATING ||
    getNumPlayingPlayers(players) < 2;

  const handleNameEdited = (name: string) => {
    !hasEdited && setHasEdited(true);
    setRequestedName(name);
  };

  const handleNameSubmitted = (event: MouseEvent | FormEvent) => {
    event.preventDefault();
    if (!requestedName || hasNameError) {
      return;
    }
    if (playerState && requestedName !== playerName) {
      api.changeName(gameId, requestedName, playerName);
    } else if (!playerState) {
      api.joinGame(gameId, requestedName);
    }
  };

  const handleStatusChange = () => {
    if (playerState?.status === PlayerStatuses.SPECTATING) {
      api.readyToStart(gameId, playerName);
    } else if (playerState?.status === PlayerStatuses.READY_TO_START) {
      api.becomeSpectator(gameId, playerName);
    }
  };

  const handleStart = () => {
    api.startGame(gameId);
  }

  useEffect(() => {
    if (!requestedName && !hasEdited) {
      setRequestedName(playerName);
    }
  }, [playerName, requestedName, hasEdited]);

  useEffect(() => {
    const handleNameClaimed = (name: string) => {
      onNameClaimed(name);
      setEditingName(false);
    };
    api.initNameClaimedSubscription(handleNameClaimed);
  }, [onNameClaimed]);

  return (
    <Page>
      <Box flexGrow={1} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
        <Box display="flex" mb={10}>
          {players.map((player, index) => (
            <Box key={index} display="flex" flexDirection="column" alignItems="center" mx={1}>
              <Typography variant="h6" color="secondary">{player.name}</Typography>
              <Box display="flex">
                {player.status === PlayerStatuses.READY_TO_START ? (
                  <Person />
                ) : player.status === PlayerStatuses.SPECTATING ? (
                  <Visibility />
                ) : (
                  <MoreHoriz />
                )}
              </Box>
            </Box>
          ))}
        </Box>
        {editingName ? (
          <form onSubmit={handleNameSubmitted}>
            <Box display="flex" flexDirection="column">
              <TextField
                color="secondary"
                label="Enter Your Name"
                variant="outlined"
                autoFocus
                value={requestedName}
                onChange={(event) => handleNameEdited(event.target.value)}
                error={hasNameError}
                helperText={hasNameError && "Name has already been claimed"}
              />
              <Box display="flex" justifyContent="space-evenly">
                <Button
                  disabled={!playerState}
                  color="secondary"
                  fullWidth
                  onClick={() => setEditingName(false)}
                >
                  Cancel
                </Button>
                <Button
                  disabled={!requestedName || hasNameError}
                  type="submit"
                  color="secondary"
                  fullWidth
                  onClick={handleNameSubmitted}
                >
                  Submit
                </Button>
              </Box>
            </Box>
          </form>
        ) : (
          <Typography variant="h4" color="secondary">{playerName}</Typography>
        )}
        <Box mt={3}>
          <ButtonGroup variant="text">
            <Button
              disabled={editingName}
              onClick={() => setEditingName(true)}
              color="secondary"
            >
              Edit Name
            </Button>
            <Button
              disabled={statusChangeButtonDisabled}
              onClick={() => handleStatusChange()}
              color="secondary"
            >
              {statusChangeButtonLabel}
            </Button>
            <Button
              disabled={startDisabled}
              onClick={() => handleStart()}
              color="secondary"
            >
              Start Game
            </Button>
          </ButtonGroup>
        </Box>
      </Box>
    </Page>
  );
};

export default GameLobby;
