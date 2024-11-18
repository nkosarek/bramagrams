import { Player } from "@/server/schema";
import { SpectatorIcon } from "@/ui/shared/components/icons";
import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { FC } from "react";

export const SpectatorsList: FC<{
  spectators: Player[];
  playerName: string;
}> = ({ spectators, playerName }) => {
  return (
    <Box maxHeight={1} display="flex" flexDirection="column">
      <Box m={2} display="flex" alignItems="flex-end">
        <Box pr={2}>
          <SpectatorIcon />
        </Box>
        <Typography variant="h6" color="secondary">
          Spectators
        </Typography>
      </Box>
      <Box
        flexGrow={1}
        overflow="auto"
        sx={(theme) => ({
          scrollbarColor: `${theme.palette.secondary.light} ${theme.palette.primary.dark}`,
          "&::-webkit-scrollbar-track": {
            background: theme.palette.primary.dark,
          },
          "&::-webkit-scrollbar-thumb": {
            border: `3px solid ${theme.palette.primary.dark}`,
          },
        })}
      >
        {/* TODO: Make this look not terrible */}
        <List>
          {spectators.map((spectator, index) => (
            <div key={spectator.name}>
              {index > 0 && <Divider variant="middle" component="li" />}
              <ListItem>
                <ListItemText
                  primary={
                    <Typography
                      variant="subtitle1"
                      sx={{
                        color:
                          spectator.name === playerName
                            ? "secondary.main"
                            : "secondary.light",
                      }}
                    >
                      {spectator.name}
                    </Typography>
                  }
                />
              </ListItem>
            </div>
          ))}
        </List>
      </Box>
    </Box>
  );
};
