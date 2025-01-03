import { PlayerInGameEnded, PlayerInGameInProgress } from "@/shared/schema";
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
  players: PlayerInGameInProgress[] | PlayerInGameEnded[];
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
    <Dialog open={open}>
      <form onSubmit={handleNameSubmitted}>
        <DialogTitle>Choose a name to join as a spectator</DialogTitle>
        <DialogContent>
          <TextField
            sx={{ mt: 1 }}
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
            type="submit"
          >
            Confirm
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
