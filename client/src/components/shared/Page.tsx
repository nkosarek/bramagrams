import React from 'react';
import { Box, Button } from '@material-ui/core';

interface PageProps {
  showHomeButton?: boolean;
  children: React.ReactNode;
}

const Page = ({ showHomeButton, children }: PageProps) => (
  <Box
    height="100vh"
    overflow="auto"
    display="flex"
    flexDirection="column"
    justifyContent="space-between"
    bgcolor="primary.main"
  >
    {showHomeButton && (
      <Box display="flex" p={1}>
        <Button
          variant="outlined"
          color="secondary"
          href="/"
        >
          Home
        </Button>
      </Box>
    )}
    {children}
  </Box>
);

export default Page;
