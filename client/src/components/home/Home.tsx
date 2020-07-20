import React from 'react';
import { Box, Button, ButtonGroup, Typography } from '@material-ui/core';

const Home = () => {
  return (
    <Box display="flex" flexDirection="column" height="100vh">
      <Box
        flexGrow={2}
        display="flex"
        flexDirection="column"
        justifyContent="flex-end"
        bgcolor="primary.main"
        paddingBottom="2em"
      >
        <Typography variant="h2" align="center">
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
        <ButtonGroup
          orientation="vertical"
        >
          <Button>
            Host Game
          </Button>
          <Button>
            Join Game
          </Button>
        </ButtonGroup>
      </Box>
    </Box>
  );
};

export default Home;
