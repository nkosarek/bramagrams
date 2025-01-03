import { Paper, Typography } from "@mui/material";
import { brown, yellow } from "@mui/material/colors";
import { FC } from "react";

const SMALL_WIDTH = "1.65rem";
const LARGE_WIDTH = "2.2rem";

const DEFAULT_BG_COLOR = yellow[200];
const DISABLED_BG_COLOR = brown[50];

export const Tile: FC<{
  letter?: string;
  disabled?: boolean;
  small?: boolean;
}> = ({ letter, disabled, small }) => {
  const bgcolor = !letter
    ? "transparent"
    : disabled
    ? DISABLED_BG_COLOR
    : DEFAULT_BG_COLOR;
  return (
    <Paper
      elevation={letter ? 3 : 0}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pt: "2px",
        width: small ? SMALL_WIDTH : LARGE_WIDTH,
        height: small ? SMALL_WIDTH : LARGE_WIDTH,
        bgcolor,
      }}
    >
      <Typography
        // TODO: Don't use headers, just vary size of font
        variant={small ? "h5" : "h4"}
        sx={{ color: "rgb(0, 0, 0, 0.87)", lineHeight: 1 }}
      >
        {letter}
      </Typography>
    </Paper>
  );
};
