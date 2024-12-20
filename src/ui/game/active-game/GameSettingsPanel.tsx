import {
  GameConfig,
  MAX_ENDGAME_TIMEOUT_SECONDS,
  MIN_ENDGAME_TIMEOUT_SECONDS,
  NUM_STARTING_TILE_OPTIONS,
} from "@/shared/schema";
import { useGameClient } from "@/ui/game/useGameClient";
import { Refresh } from "@mui/icons-material";
import {
  Box,
  Button,
  FormControlLabel,
  Slider,
  Stack,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { debounce } from "lodash";
import { FC, useEffect, useMemo, useRef, useState } from "react";

const STARTING_TILES_LABEL_ID = "num-starting-tiles-label" as const;
const STARTING_TILES_BUTTON_WIDTH = 49;

const ENDGAME_TIMER_LABEL_ID = "endgame-timer-label" as const;

export const GameSettingsPanel: FC<{
  gameId: string;
  gameConfig: GameConfig;
}> = ({ gameId, gameConfig }) => {
  const gameClient = useGameClient();

  const [timeoutSliderValue, setTimeoutSliderValue] = useState(
    gameConfig.endgameTimeoutSeconds
  );
  const updateTimeoutRef = useRef(() => {});
  const updateTimeoutDebounced = useMemo(
    () => debounce(() => updateTimeoutRef.current(), 500),
    []
  );
  useEffect(() => {
    updateTimeoutRef.current = () => {
      if (gameConfig.endgameTimeoutSeconds !== timeoutSliderValue) {
        gameClient.updateGameConfig(gameId, {
          ...gameConfig,
          endgameTimeoutSeconds: timeoutSliderValue,
        });
      }
    };
  });

  useEffect(() => {
    setTimeoutSliderValue(gameConfig.endgameTimeoutSeconds);
  }, [gameConfig.endgameTimeoutSeconds]);

  return (
    <Stack spacing={2.5}>
      <Typography variant="h5">Game Settings</Typography>
      <Tooltip
        arrow
        title="When this setting is on, this game will be publicly accessible on the Join Game page."
        placement="left"
      >
        <FormControlLabel
          label="Public game"
          control={
            <Switch
              checked={gameConfig.isPublic}
              onChange={() =>
                gameClient.updateGameConfig(gameId, {
                  ...gameConfig,
                  isPublic: !gameConfig.isPublic,
                })
              }
            />
          }
        />
      </Tooltip>
      <Tooltip
        arrow
        title="When this setting is on, typed letters will be highlighted if they form one of the words in the Bramagrams dictionary."
        placement="left"
      >
        <FormControlLabel
          label="Valid words highlighted"
          control={
            <Switch
              checked={gameConfig.validTypedWordFeedback}
              onChange={() =>
                gameClient.updateGameConfig(gameId, {
                  ...gameConfig,
                  validTypedWordFeedback: !gameConfig.validTypedWordFeedback,
                })
              }
            />
          }
        />
      </Tooltip>
      <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
        <ToggleButtonGroup
          exclusive
          aria-labelledby={STARTING_TILES_LABEL_ID}
          value={gameConfig.numStartingTiles}
        >
          {NUM_STARTING_TILE_OPTIONS.map((value) => (
            <ToggleButton
              key={value}
              value={value}
              onClick={() => {
                gameClient.updateGameConfig(gameId, {
                  ...gameConfig,
                  numStartingTiles: value,
                });
              }}
              sx={{ width: STARTING_TILES_BUTTON_WIDTH }}
            >
              {value}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <Typography id={STARTING_TILES_LABEL_ID}>Starting tiles</Typography>
      </Stack>
      <Box>
        <Typography id={ENDGAME_TIMER_LABEL_ID}>Endgame timer</Typography>
        <Slider
          value={timeoutSliderValue}
          onChange={(e, value) => {
            // TODO: MUI should narrow this type; update when they do:
            // https://github.com/mui/material-ui/issues/37854
            if (!Array.isArray(value)) {
              setTimeoutSliderValue(value);
            }
          }}
          onChangeCommitted={() => updateTimeoutDebounced()}
          aria-labelledby={ENDGAME_TIMER_LABEL_ID}
          getAriaValueText={(v) => `${v} seconds`}
          valueLabelDisplay="auto"
          step={10}
          marks={[
            { value: 10, label: "10s" },
            { value: 30, label: "30s" },
            { value: 60, label: "60s" },
            { value: 90, label: "90s" },
            { value: 120, label: "120s" },
          ]}
          min={MIN_ENDGAME_TIMEOUT_SECONDS}
          max={MAX_ENDGAME_TIMEOUT_SECONDS}
        />
      </Box>
      <Box sx={{ pt: 2 }} />
      <Button
        startIcon={<Refresh />}
        variant="outlined"
        size="large"
        onClick={() => gameClient.resetGameConfig(gameId)}
      >
        Reset to defaults
      </Button>
    </Stack>
  );
};
