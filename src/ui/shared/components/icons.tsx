import { Person, Visibility } from "@mui/icons-material";
import { SvgIconProps } from "@mui/material";

export const PlayerIcon = (iconProps: SvgIconProps) => {
  return <Person {...iconProps} />;
};

export const SpectatorIcon = (iconProps: SvgIconProps) => {
  return <Visibility {...iconProps} />;
};
