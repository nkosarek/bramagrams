"use client";

import { createTheme } from "@mui/material";
import { green, yellow } from "@mui/material/colors";
import NextLink, { LinkProps } from "next/link";
import { forwardRef } from "react";

const LinkBehavior = forwardRef<HTMLAnchorElement, LinkProps>(
  function LinkBehavior(props, ref) {
    return <NextLink ref={ref} {...props} prefetch />;
  }
);

const PALETTE_PRIMARY = green[500];
const PALETTE_SECONDARY = yellow[500];

const TEXT_SECONDARY = yellow[200];

export const theme = createTheme({
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
  },
  // TODO: Remove this; it breaks things like AlertTitle's default styling
  typography: (palette) => ({
    allVariants: {
      color: palette.text.primary,
    },
  }),
  components: {
    MuiLink: {
      defaultProps: {
        component: LinkBehavior,
      },
    },
    MuiButtonBase: {
      defaultProps: {
        LinkComponent: LinkBehavior,
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottomColor: TEXT_SECONDARY,
        },
      },
    },
  },
});
