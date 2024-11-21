import { PublicGamesTable } from "@/ui/join-game/PublicGamesTable";
import { SidebarMenu } from "@/ui/shared/components/SidebarMenu";
import { Box, Divider, Typography } from "@mui/material";
import { FC, Suspense } from "react";
import { JoinGameInput } from "./JoinGameInput";

export const JoinGamePage: FC = () => {
  return (
    <Box sx={{ flexGrow: 1, display: "flex" }}>
      <SidebarMenu />
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography
          fontWeight="bold"
          variant="h3"
          color="secondary"
          gutterBottom
        >
          Join Game
        </Typography>
        <Typography variant="h5" color="secondary" gutterBottom>
          Private Game
        </Typography>
        <Box pt={1}>
          <JoinGameInput />
        </Box>
        <Divider sx={{ my: 3 }} />
        <Typography variant="h5" color="secondary" gutterBottom>
          Public Games
        </Typography>
        <Suspense fallback={<PublicGamesTable.Loading />}>
          <PublicGamesTable />
        </Suspense>
      </Box>
    </Box>
  );
};
