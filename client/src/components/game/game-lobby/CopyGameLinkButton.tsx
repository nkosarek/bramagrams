import React, { useState } from 'react';
import { Button, Slide, Snackbar } from '@material-ui/core';
import { FileCopy } from '@material-ui/icons';
import CopyToClipboard from 'react-copy-to-clipboard';

interface CopyGameLinkButtonProps {
  gameLink: string;
}

const CopyGameLinkButton = ({ gameLink }: CopyGameLinkButtonProps) => {
  const [toastOpen, setToastOpen] = useState(false);
  return (
    <>
      <CopyToClipboard
        onCopy={() => setToastOpen(true)}
        text={gameLink}
      >
        <Button
          color="secondary"
          startIcon={<FileCopy />}
        >
          Copy Game Link
        </Button>
      </CopyToClipboard>
      <Snackbar
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        autoHideDuration={2000}
        TransitionComponent={Slide}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        message="Game link copied"
      />
    </>
  )
};

export default CopyGameLinkButton;
