import { FC, Suspense } from "react";
import { JoinGameInput } from "./JoinGameInput";
import { Box, Divider, Typography } from "@mui/material";
import { PublicGamesTable } from "@/ui/join-game/PublicGamesTable";

export const JoinGamePage: FC = () => {
  return (
    // TODO: Add layout for home button and how to play
    <Box flexGrow={1} p={3}>
      <Typography fontWeight="bold" variant="h3" color="secondary" gutterBottom>
        Join Game
      </Typography>
      <Typography variant="h5" color="secondary" gutterBottom>
        Private Game
      </Typography>
      <Box pt={1} pl={2}>
        <JoinGameInput />
      </Box>
      <Divider sx={{ my: 3 }} />
      <Typography variant="h5" color="secondary" gutterBottom>
        Public Games
      </Typography>
      <Box px={2}>
        <Suspense fallback={<PublicGamesTable isLoadingVariant />}>
          <PublicGamesTable />
        </Suspense>
      </Box>
    </Box>
  );
};
