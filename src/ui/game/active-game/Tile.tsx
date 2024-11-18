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
        justifyContent: "center",
        paddingBottom: "0.1rem",
        width: small ? SMALL_WIDTH : LARGE_WIDTH,
        height: small ? SMALL_WIDTH : LARGE_WIDTH,
        bgcolor,
        // TODO: Is this needed?
        // color: letter ? theme.palette.getContrastText(bgcolor) : undefined,
      }}
    >
      <Typography
        // TODO: Don't use headers, just vary size of font
        variant={small ? "h5" : "h4"}
        // TODO: Is this needed?
        sx={{ color: "rgb(0, 0, 0, 0.87)" }}
      >
        {letter}
      </Typography>
    </Paper>
  );
};
