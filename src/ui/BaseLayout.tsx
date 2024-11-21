import { theme } from "@/ui/theme";
import { Box, CssBaseline, ThemeProvider } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { FC, PropsWithChildren } from "react";

export const BaseLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          height="100vh"
          overflow="auto"
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
        >
          {children}
        </Box>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
};
