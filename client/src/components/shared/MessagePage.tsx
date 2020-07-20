import React from 'react';
import { Box } from '@material-ui/core';
import Page from './Page';

const MessagePage = ({ children }: { children: React.ReactNode}) => (
  <Page>
    <Box flexGrow={1} display="flex" flexDirection="column" justifyContent="center">
      <Box display="flex" justifyContent="center">
        {children}
      </Box>
    </Box>
  </Page>
);

export default MessagePage;
