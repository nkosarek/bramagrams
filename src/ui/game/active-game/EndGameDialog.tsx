import { PlayerInGameEnded } from "@/shared/schema";
import { useGameClient } from "@/ui/game/useGameClient";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { FC, ReactNode } from "react";

const DEFINITELY_EMILY_NAMES: string[] = ["emily", "ebram"];
const MAYBE_EMILY_NAMES: string[] = ["emmy", "pusheen"];

export const EndGameDialog: FC<{
  gameId: string;
  players: PlayerInGameEnded[];
  open: boolean;
  disableRematch: boolean;
  onClose: () => void;
}> = ({ gameId, players, open, disableRematch, onClose }) => {
  const gameClient = useGameClient();

  const dialogBody = `You can ${
    !disableRematch ? "rematch with the current set of players or " : ""
  }go back to the game lobby to change players.`;

  const { winners, losers, spectators } =
    getWinnerLoserAndSpectatorNames(players);

  const title =
    winners.length === 1
      ? `${winners[0]} wins!`
      : `${winners.slice(0, winners.length - 1).join(", ")}${
          winners.length > 2 ? "," : ""
        } and ${winners[winners.length - 1]} tied!`;
  const additionalWinnerText = getAdditionalWinnersText({
    winners,
    losers,
    spectators,
  });
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {additionalWinnerText && (
          <DialogContentText>
            {additionalWinnerText}
            <br />
            <br />
          </DialogContentText>
        )}
        <DialogContentText>{dialogBody}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          onClick={() => {
            onClose();
            gameClient.backToLobby(gameId);
          }}
        >
          Go Back to Lobby
        </Button>
        <Button
          variant="contained"
          disabled={disableRematch}
          onClick={() => {
            onClose();
            gameClient.rematch(gameId);
          }}
        >
          Rematch
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const getWinnerLoserAndSpectatorNames = (players: Array<PlayerInGameEnded>) => {
  let maxWords = -1;
  return players.reduce<{
    winners: Array<string>;
    losers: Array<string>;
    spectators: Array<string>;
  }>(
    (o, player) => {
      const numWords = player.words.length;
      if (player.status === "SPECTATING") {
        o.spectators.push(player.name);
      } else if (numWords > maxWords) {
        maxWords = numWords;
        o.losers = [...o.losers, ...o.winners];
        o.winners = [player.name];
      } else if (numWords === maxWords) {
        o.winners.push(player.name);
      } else {
        o.losers.push(player.name);
      }
      return o;
    },
    { winners: [], losers: [], spectators: [] }
  );
};

const isAnEmilyName = (name: string) => {
  return DEFINITELY_EMILY_NAMES.includes(name);
};

const isMaybeAnEmilyName = (name: string) => {
  return (
    MAYBE_EMILY_NAMES.includes(name) ||
    DEFINITELY_EMILY_NAMES.some((emilyName) => name.includes(emilyName)) ||
    MAYBE_EMILY_NAMES.some((emilyName) => name.includes(emilyName))
  );
};

const getAdditionalWinnersText = ({
  winners,
  losers,
  spectators,
}: {
  winners: Array<string>;
  losers: Array<string>;
  spectators: Array<string>;
}): ReactNode => {
  const emilyIsMaybeInLosers = losers.some((name) =>
    isMaybeAnEmilyName(name.toLowerCase())
  );
  const emilyIsMaybeInSpectators = spectators.some((name) =>
    isMaybeAnEmilyName(name.toLowerCase())
  );
  const emilyDefinitelyWon =
    winners.some((name) => isAnEmilyName(name.toLowerCase())) &&
    !emilyIsMaybeInLosers &&
    !emilyIsMaybeInSpectators;
  const emilyMaybeWon =
    winners.some((name) => isMaybeAnEmilyName(name.toLowerCase())) &&
    !emilyIsMaybeInLosers &&
    !emilyIsMaybeInSpectators;
  if (winners.length === 1) {
    if (emilyDefinitelyWon) {
      return "Of course she did. She always does...";
      // She probably won
    } else if (emilyMaybeWon) {
      if (/not\s*emily/.test(winners[0]?.toLowerCase() || "")) {
        return `Yay! Finally the winner is ${winners[0]}!`;
      }
      return "Is that Emily? Shocker.";
      // She probably lost
    } else if (emilyIsMaybeInLosers) {
      return `Whoa did you beat Emily? Amazing job ${winners[0]}!`;
    }
  } else {
    if (emilyDefinitelyWon) {
      return "Ooooo so close. You may just beat her next time...";
    } else if (emilyMaybeWon) {
      return (
        <>
          Do I spy Emily in a <em>tie</em>?
        </>
      );
    } else if (emilyIsMaybeInLosers) {
      return "Whoa did you beat Emily? Teamwork always wins!";
    }
  }
  return null;
};
