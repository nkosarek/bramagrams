import React from 'react';
import { TextField } from '@material-ui/core';

interface NameInputProps {
  name: string;
  nameAlreadyClaimed: boolean;
  fullWidth?: boolean;
  onChange: (newName: string) => void;
}

const NameInput = ({ name, nameAlreadyClaimed, fullWidth, onChange }: NameInputProps) => {
  return (
    <TextField
      color="secondary"
      label="Enter Your Name"
      variant="outlined"
      fullWidth={fullWidth}
      autoFocus
      value={name}
      onChange={(event) => onChange(event.target.value)}
      error={nameAlreadyClaimed}
      helperText={nameAlreadyClaimed && "Name has already been claimed"}
    />
  );
};

export default NameInput;
