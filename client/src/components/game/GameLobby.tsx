import React, { useState } from 'react';
import { Box, Button, TextField, Typography } from '@material-ui/core';
import { Check, MoreHoriz, Person } from '@material-ui/icons';
import Page from '../shared/Page';
import api from '../../api/api';
import { Player, PlayerStatuses } from '../../server-models';

interface GameLobbyProps {
  gameId: string;
  playerName: string;
  players: Player[];
  canStart: boolean;
  onNameClaimed: (name: string) => void;
  onGameDne: () => void;
};

const GameLobby = ({ gameId, playerName, players, canStart, onNameClaimed, onGameDne }: GameLobbyProps) => {
  const [requestedName, setRequestedName] = useState("");
  const [claimedNames, setClaimedNames] = useState<string[]>([]);

  const hasNameError = claimedNames.includes(requestedName);
  const playerState = players.find(player => player.name === playerName);

  const handleNameSubmitted = () => {
    api.claimName(gameId, requestedName)
      .then(() => {
        onNameClaimed(requestedName);
        api.joinGame(gameId, requestedName);
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
        {playerName ? (
          <Typography variant="h4" color="secondary">{playerName}</Typography>
        ) : (
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
        )}
        <Box display="flex" mt={3}>
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
        </Box>
      </Box>
    </Page>
  );
};

export default GameLobby;
