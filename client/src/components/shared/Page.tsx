import React from 'react';
import { Box } from '@material-ui/core';

const Page = ({ children }: { children: React.ReactNode}) => (
  <Box height="100vh" display="flex" flexDirection="column" bgcolor="primary.main">
    {children}
  </Box>
);

export default Page;
