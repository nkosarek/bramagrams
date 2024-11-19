import { Player } from "@/server/schema";
import { useGameClient } from "@/ui/game/useGameClient";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { FC, FormEvent, useEffect, useState } from "react";

export const EnterNameDialog: FC<{
  open: boolean;
  gameId: string;
  playerName: string;
  players: Player[];
  onNameClaimed: (name: string) => void;
}> = ({ open, gameId, playerName, players, onNameClaimed }) => {
  const gameClient = useGameClient();
  const [requestedName, setRequestedName] = useState(playerName);

  const nameAlreadyClaimed =
    requestedName !== playerName &&
    players.map((p) => p.name).includes(requestedName);

  const handleNameSubmitted = (event: MouseEvent | FormEvent) => {
    event.preventDefault();
    if (!requestedName || nameAlreadyClaimed) {
      return;
    }
    gameClient.joinGame(gameId, requestedName);
  };

  useEffect(() => {
    const handleNameClaimed = (name: string) => {
      onNameClaimed(name);
    };
    gameClient.initNameClaimedSubscription(handleNameClaimed);
  }, [onNameClaimed, gameClient]);

  return (
    // TODO: Remove bgcolor after refactoring theme palette
    <Dialog open={open} PaperProps={{ sx: { bgcolor: "primary.main" } }}>
      <form onSubmit={handleNameSubmitted}>
        <DialogTitle>Choose a name to join as a spectator</DialogTitle>
        <DialogContent>
          <TextField
            sx={{ mt: 1 }}
            color="secondary"
            label="Enter Your Name"
            variant="outlined"
            autoFocus
            fullWidth
            value={requestedName}
            onChange={(e) => setRequestedName(e.target.value)}
            error={nameAlreadyClaimed}
            helperText={nameAlreadyClaimed && "Name has already been claimed"}
          />
        </DialogContent>
        <DialogActions>
          <Button
            disabled={!requestedName || nameAlreadyClaimed}
            onClick={handleNameSubmitted}
            color="secondary"
            type="submit"
          >
            Confirm
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
