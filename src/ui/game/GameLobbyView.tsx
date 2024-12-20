import {
  GameStateInLobby,
  MAX_PLAYERS,
  PlayerInGameInLobby,
} from "@/shared/schema";
import { GameSettingsPanel } from "@/ui/game/active-game/GameSettingsPanel";
import { useGameClient } from "@/ui/game/useGameClient";
import { PlayerIcon, SpectatorIcon } from "@/ui/shared/components/icons";
import {
  Check,
  Clear,
  Close,
  Edit,
  FileCopy,
  Settings,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Divider,
  Drawer,
  drawerClasses,
  IconButton,
  InputAdornment,
  Slide,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { FC, FormEvent, useEffect, useState } from "react";

const DRAWER_WIDTH = 320;

const PLAY_OR_SPECTATE_SWITCH_LABEL_ID =
  "play-or-spectate-switch-label" as const;

const getNumPlayingPlayers = (players: PlayerInGameInLobby[]) => {
  return players.filter((p) => p.status !== "SPECTATING").length;
};

export const GameLobbyView: FC<{
  gameId: string;
  playerName: string;
  gameState: GameStateInLobby;
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
    if (playerState && requestedName === playerName) {
      setEditingName(false);
    } else if (playerState) {
      gameClient.changeName(gameId, requestedName, playerName);
    } else if (!playerState) {
      gameClient.joinGame(gameId, requestedName);
    }
  };

  const handleStatusChange = () => {
    if (playerState?.status === "SPECTATING") {
      gameClient.readyToStart(gameId, playerName);
    } else if (playerState?.status === "PLAYING") {
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
        <Box display="flex">
          {/* TODO: Filter out self (or sort at top) after player IDs are added */}
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
        <Box sx={{ pt: 9 }} />
        {/* This has height of text field (which is taller) to avoid jitter */}
        <Box sx={{ height: "56px" }}>
          {editingName || !playerState ? (
            <form onSubmit={handleNameSubmitted}>
              {/* TODO: Limit name length? */}
              <TextField
                label="Enter Your Name"
                variant="outlined"
                autoFocus
                value={requestedName}
                onChange={(e) => handleNameEdited(e.target.value)}
                error={hasNameError}
                helperText={hasNameError && "Name has already been claimed"}
                slotProps={{
                  input: {
                    endAdornment: (
                      <>
                        <InputAdornment position="end">
                          <IconButton
                            disabled={!playerState}
                            onClick={() => {
                              setEditingName(false);
                              setRequestedName(playerName);
                            }}
                            color="primary"
                          >
                            <Clear />
                          </IconButton>
                          <IconButton
                            disabled={!requestedName || hasNameError}
                            type="submit"
                            color="primary"
                          >
                            <Check />
                          </IconButton>
                        </InputAdornment>
                      </>
                    ),
                  },
                }}
              />
            </form>
          ) : (
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Typography variant="h4">{playerName}</Typography>
              <Tooltip title="Change name" placement="right">
                <IconButton
                  size="large"
                  color="primary"
                  onClick={() => setEditingName(true)}
                >
                  <Edit />
                </IconButton>
              </Tooltip>
            </Stack>
          )}
        </Box>
        <Box sx={{ pt: 2 }} />
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Typography
            variant="overline"
            color={
              playerState?.status === "SPECTATING" ? "primary" : "textDisabled"
            }
          >
            Spectator
          </Typography>
          <Switch
            aria-labelledby={PLAY_OR_SPECTATE_SWITCH_LABEL_ID}
            checked={
              playerState
                ? playerState.status === "PLAYING"
                : getNumPlayingPlayers(players) < MAX_PLAYERS
            }
            // TODO: Fix jitter: consolidate game update and name claim responses (via player IDs)
            disabled={
              !playerState ||
              (playerState?.status === "SPECTATING" &&
                getNumPlayingPlayers(players) >= MAX_PLAYERS)
            }
            onClick={() => handleStatusChange()}
          />
          <Typography
            id={PLAY_OR_SPECTATE_SWITCH_LABEL_ID}
            variant="overline"
            color={
              playerState?.status === "SPECTATING" ? "textDisabled" : "primary"
            }
          >
            Player
          </Typography>
        </Stack>
        <Box sx={{ pt: 9 }} />
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<FileCopy />}
            onClick={() =>
              navigator.clipboard
                .writeText(window.location.href)
                .then(() => setCopyToastOpen(true))
            }
          >
            Copy Game Link
          </Button>
          <Button
            variant="contained"
            disabled={startDisabled}
            onClick={() => gameClient.startGame(gameId)}
          >
            Start Game
          </Button>
        </Stack>
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
          <GameSettingsPanel gameId={gameId} gameConfig={gameConfig} />
        </Box>
      </Drawer>
    </Box>
  );
};
