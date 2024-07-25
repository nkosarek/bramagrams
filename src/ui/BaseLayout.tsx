import { theme } from "@/ui/theme";
import { Box, ThemeProvider } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { FC, PropsWithChildren } from "react";

export const BaseLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <Box
          height="100vh"
          overflow="auto"
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          bgcolor="primary.main"
        >
          {children}
        </Box>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
};
