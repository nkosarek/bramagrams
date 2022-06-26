import { makeStyles, SvgIconProps } from "@material-ui/core";

export interface IconPropsWithTextSecondaryColor extends Omit<SvgIconProps, 'color'> {
  color?: SvgIconProps['color'] | 'textSecondary';
}

const useTextSecondaryColor = makeStyles((theme) => ({
  root: {
    color: theme.palette.text.secondary,
  },
}));

export const useIconProps = (props: IconPropsWithTextSecondaryColor) => {
  const { color, ...rest } = props;
  const textSecondaryClasses = useTextSecondaryColor();
  const finalProps: SvgIconProps = { ...rest };
  if (color === 'textSecondary') {
    finalProps.className = `${props.className || ''} ${textSecondaryClasses.root}`;
  } else {
    finalProps.color = color || "secondary";
  }
  return finalProps;
}
