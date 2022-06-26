import React from 'react';
import { ArrowDropDown } from "@material-ui/icons";
import { IconPropsWithTextSecondaryColor, useIconProps } from './useIconProps';

export const CurrentPlayerIcon = (props: IconPropsWithTextSecondaryColor) => {
  const iconProps = useIconProps(props);
  return <ArrowDropDown fontSize="large" {...iconProps} />;
};
