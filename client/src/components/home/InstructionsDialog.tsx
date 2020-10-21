import React from 'react';
import {
  AppBar,
  IconButton,
  Slide,
  Toolbar,
  Typography,
  makeStyles,
} from '@material-ui/core';
import { TransitionProps } from '@material-ui/core/transitions/transition';
import { Close } from '@material-ui/icons';
import StyledDialog from '../shared/StyledDialog';
import HowToPlay from '../shared/HowToPlay';

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: 'relative',
    backgroundColor: theme.palette.secondary.light,
  },
}));

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface InstructionsDialogProps {
  open: boolean,
  onClose: () => void,
}

const InstructionsDialog = ({ open, onClose }: InstructionsDialogProps) => {
  const classes = useStyles();

  return (
    <StyledDialog
      dark
      fullScreen
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
    >
      <AppBar className={classes.appBar}>
        <Toolbar>
          <IconButton edge="start" onClick={onClose}>
            <Close />
          </IconButton>
          <Typography variant="h6">
            How To Play
          </Typography>
        </Toolbar>
      </AppBar>
      <HowToPlay />
    </StyledDialog>
  );
};

export default InstructionsDialog;
