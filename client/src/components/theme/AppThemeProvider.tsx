import React from 'react';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { brown, green, yellow } from '@material-ui/core/colors';

interface TilePalette {
  main: string;
  disabled: string;
  text: string;
}
declare module "@material-ui/core/styles/createPalette" {
  interface Palette {
    tile: TilePalette;
  }
  interface PaletteOptions {
    tile: TilePalette;
  }
}

const PALETTE_PRIMARY = green[500];
const PALETTE_SECONDARY = yellow[500];

const TEXT_SECONDARY = yellow[200];

const TILE_MAIN = yellow[200];
const TILE_DISABLED = brown[50];
const TILE_TEXT = "rgb(0, 0, 0, 0.87)";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: PALETTE_PRIMARY,
    },
    secondary: {
      main: PALETTE_SECONDARY,
    },
    text: {
      primary: PALETTE_SECONDARY,
      secondary: TEXT_SECONDARY,
    },
    tile: {
      main: TILE_MAIN,
      disabled: TILE_DISABLED,
      text: TILE_TEXT,
    },
  },
  typography: (palette) => ({
    allVariants: {
      color: palette.text.primary,
    },
  }),
  overrides: {
    MuiTableCell: {
      root: {
        borderBottomColor: TEXT_SECONDARY,
      },
    },
  },
});

const AppThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
};

export default AppThemeProvider;
