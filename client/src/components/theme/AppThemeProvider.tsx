import React from 'react';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { green, yellow } from '@material-ui/core/colors';

const theme = createMuiTheme({
  palette: {
    primary: {
      light: green[300],
      main: green[500],
      dark: green[700],
    },
    secondary: {
      light: yellow[300],
      main: yellow[500],
      dark: yellow[700],
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
