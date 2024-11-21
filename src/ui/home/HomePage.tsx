"use client";

import { SOCKET_SERVER_PORT } from "@/shared/constants/ports";
import { HowToPlay } from "@/ui/shared/components/HowToPlay";
import { Clear, Close } from "@mui/icons-material";
import {
  Alert,
  AlertTitle,
  AppBar,
  Backdrop,
  Box,
  Button,
  ButtonGroup,
  buttonGroupClasses,
  CircularProgress,
  Dialog,
  IconButton,
  Slide,
  Snackbar,
  Toolbar,
  Typography,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { useRouter } from "next/navigation";
import { FC, forwardRef, useState } from "react";

export const HomePage: FC = () => {
  const router = useRouter();

  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isNewGamePending, setIsNewGamePending] = useState(false);
  const [isNewGameErrorOpen, setIsNewGameErrorOpen] = useState(false);
  const [newGameError, setNewGameError] = useState("");

  const handleNewGame = async (isPublic = false) => {
    setIsNewGamePending(true);
    setIsNewGameErrorOpen(false);
    const res = await fetch(
      `${window.location.protocol}//${window.location.hostname}:${SOCKET_SERVER_PORT}/api/games`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameConfig: { isPublic },
        }),
      }
    );
    const body = await res.text();
    if (!res.ok) {
      setNewGameError(body);
      setIsNewGamePending(false);
      setIsNewGameErrorOpen(true);
    } else {
      router.push(`/games/${body}`);
    }
  };
  return (
    <Box
      component="main"
      height="100vh"
      overflow="auto"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      bgcolor="primary.main"
    >
      <Box
        flexGrow={1}
        display="flex"
        flexDirection="column"
        justifyContent="flex-end"
        paddingBottom="2rem"
      >
        <Typography
          variant="h2"
          letterSpacing={1.1}
          align="center"
          color="secondary"
        >
          Bramagrams
        </Typography>
      </Box>
      <Box
        flexGrow={1}
        display="flex"
        flexDirection="column"
        alignItems="center"
        bgcolor="secondary.main"
        paddingTop="2rem"
      >
        <ButtonGroup
          color="inherit"
          orientation="vertical"
          variant="text"
          sx={{
            [`& .${buttonGroupClasses.grouped}`]: {
              "&:hover": {
                backgroundColor: "action.hover",
              },
            },
          }}
        >
          <Button onClick={() => handleNewGame(false)}>New Private Game</Button>
          <Button onClick={() => handleNewGame(true)}>New Public Game</Button>
          <Button href="/games">Join Game</Button>
          <Button onClick={() => setIsHowToPlayOpen(true)}>How To Play</Button>
        </ButtonGroup>
      </Box>
      <Dialog
        open={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
        fullScreen
        TransitionComponent={Transition}
        PaperProps={{
          sx: {
            bgcolor: "primary.main",
          },
        }}
      >
        <AppBar sx={{ position: "relative", color: "text.secondary" }}>
          <Toolbar sx={{ display: "flex" }}>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setIsHowToPlayOpen(false)}
            >
              <Close />
            </IconButton>
            <Typography
              color="inherit"
              // TODO: Make this a bigger header variant after changing their sizes
              variant="h6"
              sx={{ ml: 0.5 }}
            >
              How To Play
            </Typography>
          </Toolbar>
        </AppBar>
        <Box sx={{ px: 2 }}>
          <HowToPlay />
        </Box>
      </Dialog>
      <Snackbar
        open={isNewGameErrorOpen && !!newGameError}
        TransitionComponent={Slide}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Alert
          severity="error"
          action={
            <IconButton onClick={() => setIsNewGameErrorOpen(false)}>
              <Clear />
            </IconButton>
          }
        >
          <AlertTitle color="inherit">Error</AlertTitle>
          {newGameError}
        </Alert>
      </Snackbar>
      <Backdrop
        open={isNewGamePending}
        sx={(theme) => ({
          zIndex: theme.zIndex.drawer + 1,
        })}
      >
        <CircularProgress color="secondary" />
      </Backdrop>
    </Box>
  );
};

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});
