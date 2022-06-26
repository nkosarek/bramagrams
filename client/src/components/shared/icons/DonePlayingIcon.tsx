import { Check } from '@material-ui/icons';
import React from 'react';
import { IconPropsWithTextSecondaryColor, useIconProps } from './useIconProps';

export const DonePlayingIcon = (props: IconPropsWithTextSecondaryColor) => {
  const iconProps = useIconProps(props);
  return <Check fontSize="large" {...iconProps} />
};
