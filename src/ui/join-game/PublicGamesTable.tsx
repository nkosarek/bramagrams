import { FC, Fragment, PropsWithChildren } from "react";
import { exhaustiveSwitchCheck } from "@/shared/utils/exhaustiveSwitchCheck";
import { GameState } from "@/server/schema";
import * as serverActions from "@/server/server-actions";
import { PlayerIcon, SpectatorIcon } from "@/ui/shared/components/icons";
import {
  Box,
  Link,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  TypographyProps,
} from "@mui/material";
import {
  DoneAll,
  MeetingRoom,
  Pending,
  SvgIconComponent,
} from "@mui/icons-material";

const BodyTypography: FC<TypographyProps> = (props) => (
  <Typography
    color="text.secondary"
    {...props}
    sx={{ ...props.sx, textDecoration: "none" }}
  />
);

export const PublicGamesTable: FC<{ isLoadingVariant?: boolean }> = async ({
  isLoadingVariant = false,
}) => {
  const publicGames = isLoadingVariant
    ? {}
    : await serverActions.getPublicGames();

  return (
    <Table sx={{ tableLayout: "fixed" }}>
      <TableHead>
        <TableRow>
          {["Game ID", "Status", "Participants"].map((header) => (
            <TableCell key={header}>
              <Typography fontWeight="bold" color="secondary">
                {header}
              </Typography>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {isLoadingVariant ? (
          <TableRow>
            <TableCell>
              <Skeleton variant="text">
                <BodyTypography>00000000</BodyTypography>
              </Skeleton>
            </TableCell>
            <TableCell>
              <Box display="flex">
                <Skeleton
                  variant="rounded"
                  height="24px"
                  width="24px"
                  sx={{ mr: 1 }}
                >
                  <MeetingRoom />
                </Skeleton>
                <Skeleton variant="text">
                  <BodyTypography>In Lobby</BodyTypography>
                </Skeleton>
              </Box>
            </TableCell>
            <TableCell>
              <Participants isLoadingVariant />
            </TableCell>
          </TableRow>
        ) : !Object.keys(publicGames).length ? (
          <TableRow>
            <TableCell colSpan={3}>
              <BodyTypography fontStyle="oblique">
                No public games to join
              </BodyTypography>
            </TableCell>
          </TableRow>
        ) : (
          Object.entries(publicGames).map(([gameId, gameState]) => {
            const numSpectating = gameState.players.filter(
              (p) => p.status === "SPECTATING"
            ).length;
            const numPlaying = gameState.players.length - numSpectating;
            const href = `/games/${gameId}`;
            const { label: statusLabel, Icon: StatusIcon } =
              getGameStatusDisplay(gameState);
            return (
              <TableRow key={gameId} hover>
                <LinkCell href={href}>
                  <BodyTypography>{gameId}</BodyTypography>
                </LinkCell>
                <LinkCell href={href}>
                  <Box display="flex">
                    <StatusIcon sx={{ color: "text.secondary", mr: 1 }} />
                    <BodyTypography>{statusLabel}</BodyTypography>
                  </Box>
                </LinkCell>
                <LinkCell href={href}>
                  <Participants
                    numPlaying={numPlaying}
                    numSpectating={numSpectating}
                  />
                </LinkCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
};

const getGameStatusDisplay = ({
  status,
}: GameState): { label: string; Icon: SvgIconComponent } => {
  switch (status) {
    case "WAITING_TO_START":
      return { label: "In Lobby", Icon: MeetingRoom };
    case "IN_PROGRESS":
      return { label: "In Game", Icon: Pending };
    case "ENDED":
      return { label: "Game Ended", Icon: DoneAll };
    default:
      return exhaustiveSwitchCheck(status);
  }
};

const LinkCell: FC<{ href: string } & PropsWithChildren> = ({
  href,
  children,
}) => (
  <TableCell sx={{ p: 0 }}>
    <Link underline="none" href={href}>
      <Box p={2}>{children}</Box>
    </Link>
  </TableCell>
);

const Participants: FC<
  | { isLoadingVariant: true; numPlaying?: number; numSpectating?: number }
  | { isLoadingVariant?: false; numPlaying: number; numSpectating: number }
> = ({ isLoadingVariant, numPlaying = 0, numSpectating = 0 }) => {
  const SkeletonWrapper = isLoadingVariant ? Skeleton : Fragment;
  return (
    <Box display="flex" justifyContent="flex-start">
      <Tooltip
        arrow
        title={
          isLoadingVariant
            ? ""
            : `${numPlaying} Player${
                numPlaying !== 1 ? "s" : ""
              }, ${numSpectating} Spectator${numSpectating !== 1 ? "s" : ""}`
        }
      >
        <Box display="flex" alignItems="center">
          <SkeletonWrapper>
            <BodyTypography>{numPlaying}</BodyTypography>
          </SkeletonWrapper>
          <Box pl={1} />
          <PlayerIcon sx={{ color: "text.secondary" }} />
          <Box pl={4} />
          <SkeletonWrapper>
            <BodyTypography>{numSpectating}</BodyTypography>
          </SkeletonWrapper>
          <Box pl={1} />
          <SpectatorIcon sx={{ color: "text.secondary" }} />
        </Box>
      </Tooltip>
    </Box>
  );
};
