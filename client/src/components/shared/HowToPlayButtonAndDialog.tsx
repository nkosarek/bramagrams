import React, { useState } from 'react';
import { Button, ButtonProps } from '@material-ui/core';
import HowToPlay from './HowToPlay';
import StyledDialog from './StyledDialog';

interface HowToPlayButtonAndDialogProps {
  hideGameLobby?: boolean;
}

const HowToPlayButtonAndDialog = ({
  hideGameLobby, ...buttonProps
}: HowToPlayButtonAndDialogProps & ButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outlined"
        color="secondary"
        onClick={() => setOpen(true)}
        {...buttonProps}
      >
        How To Play
      </Button>
      <StyledDialog
        dark
        open={open}
        onClose={() => setOpen(false)}
      >
        <HowToPlay hideGameLobby={hideGameLobby} />
      </StyledDialog>
    </>
  );
};

export default HowToPlayButtonAndDialog;
