import { MAX_PLAYERS, Player } from "@/shared/schema";
import { useGameClient } from "@/ui/game/useGameClient";
import { PlayerIcon, SpectatorIcon } from "@/ui/shared/components/icons";
import { FileCopy } from "@mui/icons-material";
import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  Slide,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { FC, FormEvent, useEffect, useState } from "react";

const getNumPlayingPlayers = (players: Player[]) => {
  return players.filter((p) => p.status !== "SPECTATING").length;
};

export const GameLobbyView: FC<{
  gameId: string;
  playerName: string;
  players: Player[];
  onNameClaimed: (name: string) => void;
}> = ({ gameId, playerName, players, onNameClaimed }) => {
  const gameClient = useGameClient();
  const [requestedName, setRequestedName] = useState(playerName);
  const playerState = players.find((player) => player.name === playerName);
  const [editingName, setEditingName] = useState(!playerState);
  const [hasEdited, setHasEdited] = useState(false);
  const [copyToastOpen, setCopyToastOpen] = useState(false);

  const hasNameError =
    requestedName !== playerName &&
    players.map((p) => p.name).includes(requestedName);

  const statusChangeButtonLabel =
    !playerState || playerState.status === "READY_TO_START"
      ? "Spectate"
      : "Join";
  const statusChangeButtonDisabled =
    !playerState ||
    (playerState.status === "SPECTATING" &&
      getNumPlayingPlayers(players) >= MAX_PLAYERS);

  const startDisabled =
    !playerState ||
    playerState.status === "SPECTATING" ||
    getNumPlayingPlayers(players) < 2;

  const handleNameEdited = (name: string) => {
    setHasEdited(true);
    setRequestedName(name);
  };

  const handleNameSubmitted = (event: MouseEvent | FormEvent) => {
    event.preventDefault();
    if (!requestedName || hasNameError) {
      return;
    }
    if (playerState && requestedName !== playerName) {
      gameClient.changeName(gameId, requestedName, playerName);
    } else if (!playerState) {
      gameClient.joinGame(gameId, requestedName);
    }
  };

  const handleStatusChange = () => {
    if (playerState?.status === "SPECTATING") {
      gameClient.readyToStart(gameId, playerName);
    } else if (playerState?.status === "READY_TO_START") {
      gameClient.becomeSpectator(gameId, playerName);
    }
  };

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
    gameClient.initNameClaimedSubscription(handleNameClaimed);
  }, [gameClient, onNameClaimed]);

  return (
    <Box
      flexGrow={1}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <Box display="flex" mb={10}>
        {players.map((player, index) => (
          <Box key={player.name} display="flex">
            {index > 0 && <Divider orientation="vertical" variant="middle" />}
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              mx={1}
            >
              <Typography variant="h6">{player.name}</Typography>
              <Box display="flex">
                {player.status === "SPECTATING" ? (
                  <SpectatorIcon color="primary" />
                ) : (
                  <PlayerIcon color="primary" />
                )}
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
      {editingName ? (
        <form onSubmit={handleNameSubmitted}>
          <Box display="flex" flexDirection="column">
            <TextField
              label="Enter Your Name"
              variant="outlined"
              autoFocus
              value={requestedName}
              onChange={(e) => handleNameEdited(e.target.value)}
              error={hasNameError}
              helperText={hasNameError && "Name has already been claimed"}
            />
            <Box display="flex" justifyContent="space-evenly">
              <Button
                disabled={!playerState}
                fullWidth
                onClick={() => setEditingName(false)}
              >
                Cancel
              </Button>
              <Button
                disabled={!requestedName || hasNameError}
                type="submit"
                fullWidth
                onClick={handleNameSubmitted}
              >
                Submit
              </Button>
            </Box>
          </Box>
        </form>
      ) : (
        <Typography variant="h4">{playerName}</Typography>
      )}
      <Box mt={3} mb={5}>
        <ButtonGroup variant="text">
          <Button disabled={editingName} onClick={() => setEditingName(true)}>
            Edit Name
          </Button>
          <Button
            disabled={statusChangeButtonDisabled}
            onClick={() => handleStatusChange()}
          >
            {statusChangeButtonLabel}
          </Button>
          <Button
            disabled={startDisabled}
            onClick={() => gameClient.startGame(gameId)}
          >
            Start Game
          </Button>
        </ButtonGroup>
      </Box>
      <Button
        startIcon={<FileCopy />}
        onClick={() =>
          navigator.clipboard
            .writeText(window.location.href)
            .then(() => setCopyToastOpen(true))
        }
      >
        Copy Game Link
      </Button>
      <Snackbar
        open={copyToastOpen}
        onClose={() => setCopyToastOpen(false)}
        autoHideDuration={2000}
        TransitionComponent={Slide}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        message="Game link copied"
      />
    </Box>
  );
};
