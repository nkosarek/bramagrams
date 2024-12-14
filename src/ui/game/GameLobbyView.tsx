import {
  GameState,
  MAX_PLAYERS,
  NUM_STARTING_TILE_OPTIONS,
  Player,
} from "@/shared/schema";
import { useGameClient } from "@/ui/game/useGameClient";
import { PlayerIcon, SpectatorIcon } from "@/ui/shared/components/icons";
import { Close, FileCopy, Refresh, Settings } from "@mui/icons-material";
import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  Drawer,
  drawerClasses,
  FormControlLabel,
  IconButton,
  Slide,
  Snackbar,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { FC, FormEvent, useEffect, useState } from "react";

const DRAWER_WIDTH = 320;

const STARTING_TILES_HEADER_ID = "num-starting-tiles-header" as const;
const STARTING_TILES_BUTTON_WIDTH = 49;

const getNumPlayingPlayers = (players: Player[]) => {
  return players.filter((p) => p.status !== "SPECTATING").length;
};

export const GameLobbyView: FC<{
  gameId: string;
  playerName: string;
  gameState: GameState;
  onNameClaimed: (name: string) => void;
}> = ({ gameId, playerName, gameState, onNameClaimed }) => {
  const gameClient = useGameClient();
  const [requestedName, setRequestedName] = useState(playerName);
  const { players, gameConfig } = gameState;
  const playerState = players.find((player) => player.name === playerName);
  const [editingName, setEditingName] = useState(!playerState);
  const [hasEdited, setHasEdited] = useState(false);
  const [copyToastOpen, setCopyToastOpen] = useState(false);
  const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(true);

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
    <Box sx={{ flexGrow: 1, display: "flex", position: "relative" }}>
      <Box
        sx={(theme) => ({
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          marginRight: settingsDrawerOpen ? 0 : `-${DRAWER_WIDTH}px`,
          transition: settingsDrawerOpen
            ? theme.transitions.create("margin", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              })
            : theme.transitions.create("margin", {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
              }),
        })}
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
      <Box
        sx={(theme) => ({
          position: "absolute",
          top: theme.spacing(2),
          right: theme.spacing(1),
          zIndex: theme.zIndex.drawer + 1,
        })}
      >
        <Tooltip
          title={`${settingsDrawerOpen ? "" : "Game settings"}`}
          placement="left"
        >
          <IconButton
            size="large"
            onClick={() => setSettingsDrawerOpen((o) => !o)}
          >
            {settingsDrawerOpen ? <Close /> : <Settings />}
          </IconButton>
        </Tooltip>
      </Box>
      <Drawer
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          [`& .${drawerClasses.paper}`]: {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
          },
        }}
        variant="persistent"
        anchor="right"
        open={settingsDrawerOpen}
      >
        <Box sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h5">Game Settings</Typography>
            <Tooltip
              arrow
              title="When this setting is on, this game will be publicly accessible on the Join Game page."
              placement="left"
            >
              <FormControlLabel
                label="Public game"
                control={
                  <Switch
                    checked={gameConfig.isPublic}
                    onChange={() =>
                      gameClient.updateGameConfig(gameId, {
                        ...gameConfig,
                        isPublic: !gameConfig.isPublic,
                      })
                    }
                  />
                }
              />
            </Tooltip>
            <Tooltip
              arrow
              title="When this setting is on, typed letters will be highlighted if they form one of the words in the Bramagrams dictionary."
              placement="left"
            >
              <FormControlLabel
                label="Valid words highlighted"
                control={
                  <Switch
                    checked={gameConfig.validTypedWordFeedback}
                    onChange={() =>
                      gameClient.updateGameConfig(gameId, {
                        ...gameConfig,
                        validTypedWordFeedback:
                          !gameConfig.validTypedWordFeedback,
                      })
                    }
                  />
                }
              />
            </Tooltip>
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
              <ToggleButtonGroup
                exclusive
                aria-labelledby={STARTING_TILES_HEADER_ID}
                value={gameConfig.numStartingTiles}
              >
                {NUM_STARTING_TILE_OPTIONS.map((value) => (
                  <ToggleButton
                    key={value}
                    value={value}
                    onClick={() => {
                      gameClient.updateGameConfig(gameId, {
                        ...gameConfig,
                        numStartingTiles: value,
                      });
                    }}
                    sx={{ width: STARTING_TILES_BUTTON_WIDTH }}
                  >
                    {value}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
              <Typography id={STARTING_TILES_HEADER_ID}>
                Starting tiles
              </Typography>
            </Stack>
            <Box sx={{ pt: 2 }} />
            <Button
              startIcon={<Refresh />}
              variant="outlined"
              size="large"
              onClick={() => gameClient.resetGameConfig(gameId)}
            >
              Reset to defaults
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </Box>
  );
};
