import { Box } from "@mui/material";
import { FC } from "react";
import { Tile } from "./Tile";

export const TilePool: FC<{
  letters: string[];
  disabled?: boolean;
}> = ({ letters, disabled }) => {
  const tileMargin = 0.5;
  return (
    <Box
      display="flex"
      flexWrap="wrap"
      justifyContent="center"
      alignItems="center"
      alignContent="flex-start"
    >
      {!letters.length ? (
        <Box sx={{ m: tileMargin }}>
          <Tile />
        </Box>
      ) : (
        letters.map((letter, index) => (
          <Box key={index} sx={{ m: tileMargin }}>
            <Tile letter={letter} disabled={disabled} />
          </Box>
        ))
      )}
    </Box>
  );
};
