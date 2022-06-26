import React from 'react';
import { Person } from '@material-ui/icons';
import { IconPropsWithTextSecondaryColor, useIconProps } from './useIconProps';

export const PlayerIcon = (props: IconPropsWithTextSecondaryColor) => {
  const iconProps = useIconProps(props)
  return <Person color="secondary" {...iconProps} />;
}
