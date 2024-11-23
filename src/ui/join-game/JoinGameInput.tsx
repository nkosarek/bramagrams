"use client";

import { Box, Button, TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import { FC, useState } from "react";

export const JoinGameInput: FC = () => {
  const router = useRouter();
  const [typedGameId, setTypedGameId] = useState("");
  return (
    <form onSubmit={() => router.push(`/games/${typedGameId}`)}>
      <Box display="flex">
        <TextField
          id="join-private-game-id-input"
          label="Game ID"
          value={typedGameId}
          onChange={(event) => setTypedGameId(event.target.value)}
          autoFocus
          placeholder="f005ba11"
          size="small"
          variant="outlined"
        />
        <Button
          disabled={!typedGameId}
          href={`/games/${typedGameId}`}
          type="submit"
        >
          Join
        </Button>
      </Box>
    </form>
  );
};
