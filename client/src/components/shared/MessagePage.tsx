import React from 'react';
import { Box } from '@material-ui/core';
import Page from './Page';

interface MessagePageProps {
  showHomeButton?: boolean;
  children: React.ReactNode;
}

const MessagePage = ({ showHomeButton, children }: MessagePageProps) => (
  <Page showHomeButton={showHomeButton}>
    <Box flexGrow={1} display="flex" flexDirection="column" justifyContent="center">
      <Box display="flex" justifyContent="center">
        {children}
      </Box>
    </Box>
  </Page>
);

export default MessagePage;
