import { PublicGamesTable } from "@/ui/join-game/PublicGamesTable";
import { Box, Divider, Typography } from "@mui/material";
import { FC, Suspense } from "react";
import { JoinGameInput } from "./JoinGameInput";

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
        <Suspense fallback={<PublicGamesTable.Loading />}>
          <PublicGamesTable />
        </Suspense>
      </Box>
    </Box>
  );
};
