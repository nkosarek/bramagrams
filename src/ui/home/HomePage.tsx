"use client";

import { FC, forwardRef, useState } from "react";
import {
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
  Toolbar,
  Typography,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import HowToPlay from "../shared/components/HowToPlay";
import { TransitionProps } from "@mui/material/transitions";
import { useRouter } from "next/navigation";

export const HomePage: FC = () => {
  const router = useRouter();

  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleNewGame = (isPublic = false) => {
    setLoading(true);
    // api.createGame(isPublic).then((gameId) => router.push(`/games/${gameId}`));
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
            bgcolor: "primary.dark",
          },
        }}
      >
        <AppBar
          sx={{
            position: "relative",
            backgroundColor: "secondary.light",
          }}
        >
          <Toolbar>
            <IconButton edge="start" onClick={() => setIsHowToPlayOpen(false)}>
              <Close />
            </IconButton>
            <Typography color="inherit" variant="h6">
              How To Play
            </Typography>
          </Toolbar>
        </AppBar>
        <HowToPlay />
      </Dialog>
      <Backdrop
        open={loading}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
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
