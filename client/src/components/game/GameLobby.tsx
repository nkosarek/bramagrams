import React, { useState } from 'react';
import { Box, Button, ButtonGroup, TextField, Typography } from '@material-ui/core';
import { Check, MoreHoriz, Person } from '@material-ui/icons';
import Page from '../shared/Page';
import api from '../../api/api';
import { Player, PlayerStatuses } from '../../server-models';

interface GameLobbyProps {
  gameId: string;
  playerName: string;
  players: Player[];
  canStart: boolean;
  onNameClaimed: (newName: string, oldName: string) => void;
  onGameDne: () => void;
};

const GameLobby = ({ gameId, playerName, players, canStart, onNameClaimed, onGameDne }: GameLobbyProps) => {
  const [requestedName, setRequestedName] = useState(playerName);
  const [claimedNames, setClaimedNames] = useState<string[]>(players.map(p => p.name));
  const [editingName, setEditingName] = useState(!playerName || !players.find(p => p.name === playerName));

  const hasNameError = requestedName !== playerName && claimedNames.includes(requestedName);
  const playerState = players.find(player => player.name === playerName);

  const handleNameSubmitted = () => {
    // TODO: clean this up
    api.claimName(gameId, requestedName, playerName)
      .then(() => {
        setEditingName(false);
        let newClaimedNames = [...claimedNames];
        newClaimedNames.splice(newClaimedNames.indexOf(playerName), 1);
        setClaimedNames(newClaimedNames);
        onNameClaimed(requestedName, playerName);
      })
      .catch((err) => {
        if (err?.response?.data?.includes("does not exist")) {
          onGameDne();
        } else {
          setClaimedNames([...claimedNames, requestedName]);
        }
      });
  };

  const handleReady = () => {
    api.readyToStart(gameId, playerName);
  };

  const handleStart = () => {
    api.startGame(gameId);
  }

  return (
    <Page>
      <Box flexGrow={1} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
        <Box display="flex" mb={10}>
          {players.map((player, index) => (
            <Box key={index} display="flex" flexDirection="column" alignItems="center" mx={1}>
              <Typography variant="h6" color="secondary">{player.name}</Typography>
              <Box display="flex">
                <Person />
                {player.status === PlayerStatuses.READY_TO_START ? (
                  <Check />
                ) : (
                  <MoreHoriz />
                )}
              </Box>
            </Box>
          ))}
        </Box>
        {editingName ? (
          <form onSubmit={(e) => {e.preventDefault(); handleNameSubmitted()}}>
            <Box display="flex" flexDirection="column">
              <TextField
                color="secondary"
                label="Enter Your Name"
                variant="outlined"
                value={requestedName}
                onChange={(event) => setRequestedName(event.target.value)}
                error={hasNameError}
                helperText={hasNameError && "Name has already been claimed"}
              />
              <Button
                disabled={!requestedName}
                type="submit"
                color="secondary"
                onClick={() => handleNameSubmitted()}
              >
                Submit Name
              </Button>
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
              disabled={!playerName || playerState?.status === PlayerStatuses.READY_TO_START}
              onClick={() => handleReady()}
              color="secondary"
            >
              Ready
            </Button>
            <Button
              disabled={!canStart}
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
