"use client";

import { GameState } from "@/shared/schema";
import { HowToPlay } from "@/ui/shared/components/HowToPlay";
import { SpectatorIcon } from "@/ui/shared/components/icons";
import { Clear, Help, Home } from "@mui/icons-material";
import {
  Badge,
  ClickAwayListener,
  Dialog,
  IconButton,
  List,
  ListItem,
  Paper,
  Popper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { FC, useRef, useState } from "react";

export const SidebarMenu: FC<{ gameState?: GameState }> = ({ gameState }) => {
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);

  const spectatorsButtonRef = useRef<HTMLButtonElement>(null);
  const [spectatorsOpen, setSpectatorsOpen] = useState(false);

  const spectatingPlayers = gameState?.players.filter(
    (p) => p.status === "SPECTATING"
  );
  return (
    <Stack spacing={0.5} sx={{ mt: 1, ml: 1 }}>
      <Tooltip title="Go to home page" placement="right">
        <IconButton size="large" href="/">
          <Home />
        </IconButton>
      </Tooltip>

      <Tooltip title="How to play" placement="right">
        <IconButton size="large" onClick={() => setHowToPlayOpen(true)}>
          <Help />
        </IconButton>
      </Tooltip>
      <Dialog
        open={howToPlayOpen}
        onClose={() => setHowToPlayOpen(false)}
        PaperProps={{ sx: { position: "relative" } }}
      >
        <IconButton
          size="large"
          onClick={() => setHowToPlayOpen(false)}
          sx={{
            m: 1,
            position: "absolute",
            top: 0,
            right: 0,
            color: "text.secondary",
          }}
        >
          <Clear />
        </IconButton>
        <HowToPlay />
      </Dialog>

      {gameState &&
        gameState.status !== "IN_LOBBY" &&
        !!spectatingPlayers?.length && (
          <>
            <Badge
              color="primary"
              overlap="circular"
              badgeContent={spectatingPlayers.length}
            >
              <Tooltip title="Spectators" placement="right">
                <IconButton
                  ref={spectatorsButtonRef}
                  size="large"
                  onClick={() => setSpectatorsOpen((t) => !t)}
                >
                  <SpectatorIcon />
                </IconButton>
              </Tooltip>
            </Badge>
            <Popper
              open={spectatorsOpen}
              anchorEl={spectatorsButtonRef.current}
              placement="bottom-start"
            >
              <ClickAwayListener onClickAway={() => setSpectatorsOpen(false)}>
                <Paper elevation={9} sx={{ pt: 1, overflow: "hidden" }}>
                  <Typography
                    variant="overline"
                    sx={{ mx: 1.5, lineHeight: "unset" }}
                  >
                    Spectators
                  </Typography>
                  {/* Last entry will be trancated making it obvious the list is scrollable */}
                  <List dense sx={{ maxHeight: "136px", overflow: "auto" }}>
                    {spectatingPlayers.map((s) => (
                      <ListItem key={s.name}>
                        <Typography variant="body2" color="textSecondary">
                          {s.name}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </ClickAwayListener>
            </Popper>
          </>
        )}
    </Stack>
  );
};
