import { ArrowDropDown, Check, Person, Visibility } from "@mui/icons-material";
import { SvgIconProps } from "@mui/material";

export const CurrentPlayerIcon = (iconProps: SvgIconProps) => {
  return <ArrowDropDown fontSize="large" {...iconProps} />;
};

export const DonePlayingIcon = (iconProps: SvgIconProps) => {
  return <Check fontSize="large" {...iconProps} />;
};

export const PlayerIcon = (iconProps: SvgIconProps) => {
  return <Person color="secondary" {...iconProps} />;
};

export const SpectatorIcon = (iconProps: SvgIconProps) => {
  return <Visibility color="secondary" {...iconProps} />;
};
