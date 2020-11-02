import React from 'react';
import { Box, Button, ButtonGroup } from '@material-ui/core';
import HowToPlayButtonAndDialog from './HowToPlayButtonAndDialog';

interface PageProps {
  showHomeButton?: boolean;
  showHowToPlayButton?: boolean;
  children: React.ReactNode;
}

const Page = ({ showHomeButton, showHowToPlayButton, children }: PageProps) => (
  <Box
    height="100vh"
    overflow="auto"
    display="flex"
    flexDirection="column"
    justifyContent="space-between"
    bgcolor="primary.main"
  >
    {(showHomeButton || showHowToPlayButton) && (
      <Box display="flex" p={1}>
        <ButtonGroup variant="outlined" color="secondary">
          {showHomeButton && <Button href="/">Home</Button>}
          {showHowToPlayButton && <HowToPlayButtonAndDialog />}
        </ButtonGroup>
      </Box>
    )}
    {children}
  </Box>
);

export default Page;
