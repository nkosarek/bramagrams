"use client";

import { useIsGameServerUp } from "@/ui/GameServerStatusProvider";
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
  Fade,
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

  const isGameServerUp = useIsGameServerUp();

  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isNewGamePending, setIsNewGamePending] = useState(false);
  const [isNewGameErrorOpen, setIsNewGameErrorOpen] = useState(false);
  const [newGameError, setNewGameError] = useState("");

  const handleNewGame = async () => {
    setIsNewGamePending(true);
    setIsNewGameErrorOpen(false);
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_GAME_SERVER_URL}/api/games`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
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
    <>
      <Box
        sx={{
          height: "50vh",
          pb: 4,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        <Typography variant="h2" letterSpacing={1.1} align="center">
          Bramagrams
        </Typography>
      </Box>
      <Box
        sx={{
          pt: 4,
          height: "50vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          bgcolor: "primary.main",
          color: (theme) => theme.palette.primary.contrastText,
        }}
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
          <Button onClick={() => handleNewGame()}>New Game</Button>
          <Button disabled={!isGameServerUp} href="/games">
            Join Game
          </Button>
          <Button onClick={() => setIsHowToPlayOpen(true)}>How To Play</Button>
        </ButtonGroup>
      </Box>
      <Dialog
        open={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
        fullScreen
        TransitionComponent={HowToPlayTransition}
      >
        <AppBar
          color="transparent"
          sx={{ position: "relative", color: "text.secondary" }}
        >
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
          <AlertTitle>Error</AlertTitle>
          {newGameError}
        </Alert>
      </Snackbar>
      <Backdrop
        open={isNewGamePending}
        sx={(theme) => ({ zIndex: theme.zIndex.drawer + 1 })}
      >
        <CircularProgress />
        <Fade
          in={isNewGamePending}
          timeout={{ enter: 2000 }}
          style={{
            transitionDelay: "5000ms",
            position: "absolute",
            bottom: "15vh",
          }}
        >
          <Typography color="textSecondary">
            Sorry this may take a while. The game server is probably still
            booting up. Give it like a minute before you give up.
          </Typography>
        </Fade>
      </Backdrop>
    </>
  );
};

const HowToPlayTransition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});
