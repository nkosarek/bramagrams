import { Box } from "@mui/material";
import { FC } from "react";
import { Tile } from "./Tile";

export const Word: FC<{
  word?: string;
  disabled?: boolean;
  small?: boolean;
}> = ({ word, disabled, small }) => {
  const wordMargin = small ? 0.3 : 0.5;
  return (
    <Box display="flex">
      {!word ? (
        <Box sx={{ m: wordMargin }}>
          <Tile />
        </Box>
      ) : (
        word.split("").map((letter, index) => (
          <Box key={index} sx={{ m: wordMargin }}>
            <Tile letter={letter} disabled={disabled} small={small} />
          </Box>
        ))
      )}
    </Box>
  );
};
