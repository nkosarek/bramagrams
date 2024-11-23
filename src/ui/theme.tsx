"use client";

import { createTheme } from "@mui/material";
import { green, yellow } from "@mui/material/colors";
import NextLink, { LinkProps } from "next/link";
import { forwardRef } from "react";

const LinkBehavior = forwardRef<HTMLAnchorElement, LinkProps<unknown>>(
  function LinkBehavior(props, ref) {
    return <NextLink ref={ref} {...props} prefetch />;
  }
);

const PALETTE_PRIMARY = yellow[500];
const TEXT_SECONDARY = yellow[200];

export const theme = createTheme({
  palette: {
    background: {
      default: green[500],
      paper: green[500],
    },
    primary: {
      main: PALETTE_PRIMARY,
    },
    text: {
      primary: PALETTE_PRIMARY,
      secondary: TEXT_SECONDARY,
    },
  },
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
