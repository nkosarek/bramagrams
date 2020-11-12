import React from 'react';
import { Dialog, makeStyles } from '@material-ui/core';
import { DialogProps } from '@material-ui/core/Dialog/Dialog';

const useStyles = makeStyles((theme) => ({
  dialog: {
    backgroundColor: theme.palette.primary.main,
  },
  darkDialog: {
    backgroundColor: theme.palette.primary.dark,
  },
}));

interface StyledDialogProps extends DialogProps {
  dark?: boolean;
}

const StyledDialog = ({ dark, ...other }: StyledDialogProps) => {
  const classes = useStyles();
  const className = dark ? classes.darkDialog : classes.dialog;

  return (
    <Dialog PaperProps={{ className }} {...other} />
  );
};

export default StyledDialog;
