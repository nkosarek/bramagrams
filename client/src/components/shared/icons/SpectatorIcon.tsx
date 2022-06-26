import React from 'react';
import { Visibility } from "@material-ui/icons";
import { IconPropsWithTextSecondaryColor, useIconProps } from './useIconProps';

export const SpectatorIcon = (props: IconPropsWithTextSecondaryColor) => {
  const iconProps = useIconProps(props);
  return <Visibility color="secondary" {...iconProps} />;
}
