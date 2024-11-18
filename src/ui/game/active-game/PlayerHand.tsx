import {
  CurrentPlayerIcon,
  DonePlayingIcon,
} from "@/ui/shared/components/icons";
import { Box, Typography } from "@mui/material";
import { FC } from "react";
import { Word } from "./Word";

export const PlayerHand: FC<{
  name: string;
  words: string[];
  isSelf: boolean;
  isCurrPlayer: boolean;
  isWaiting?: boolean;
  isReady?: boolean;
  disabled?: boolean;
  small?: boolean;
}> = ({ name, words, isSelf, isCurrPlayer, isReady, disabled, small }) => {
  const nameColor = isSelf ? "secondary" : "textSecondary";
  const Icon = !isCurrPlayer && isReady ? DonePlayingIcon : CurrentPlayerIcon;
  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Icon
        sx={{
          color:
            !isCurrPlayer && !isReady
              ? "transparent"
              : isSelf
              ? "secondary.main"
              : "text.secondary",
        }}
      />
      <Typography variant="h4" color={nameColor}>
        {name}
      </Typography>
      <Box
        display="flex"
        flexWrap="wrap"
        justifyContent="center"
        alignItems="center"
        alignContent="flex-start"
      >
        {words.map((word, i) => (
          <Box m={small ? 1.5 : 2} key={i}>
            <Word word={word} disabled={disabled} small={small} />
          </Box>
        ))}
      </Box>
    </Box>
  );
};
