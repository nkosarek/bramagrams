import React from 'react';
import { Box, Typography } from '@material-ui/core';
import HomeOptions from './HomeOptions';
import Page from '../shared/Page';

const Home = () => (
  <Page>
    <Box
      flexGrow={1}
      display="flex"
      flexDirection="column"
      justifyContent="flex-end"
      paddingBottom="2em"
    >
      <Typography variant="h2" align="center" color="secondary">
        Bramagrams
      </Typography>
    </Box>
    <Box
      flexGrow={1}
      display="flex"
      flexDirection="column"
      alignItems="center"
      bgcolor="secondary.main"
      paddingTop="2em"
    >
      <HomeOptions />
    </Box>
  </Page>
);

export default Home;
