import { GameState } from "@/shared/schema";
import { exhaustiveSwitchCheck } from "@/shared/utils/exhaustiveSwitchCheck";
import { PlayerIcon, SpectatorIcon } from "@/ui/shared/components/icons";
import {
  DoneAll,
  MeetingRoom,
  Pending,
  SvgIconComponent,
} from "@mui/icons-material";
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
import { FC, Fragment, PropsWithChildren } from "react";

export const PublicGamesTable: FC & {
  Loading: typeof PublicGamesTableLoading;
} = async () => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_GAME_SERVER_URL}/api/public-games`
  );
  if (!res.ok) {
    console.error(await res.text());
    return (
      <Typography color="textSecondary">Something went wrong :(</Typography>
    );
  }
  const publicGames: { [gameId: string]: GameState } = await res.json();

  return (
    <TableHeadAndBody>
      {!Object.keys(publicGames).length ? (
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
    </TableHeadAndBody>
  );
};

const PublicGamesTableLoading: FC = () => {
  return (
    <TableHeadAndBody>
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
    </TableHeadAndBody>
  );
};

PublicGamesTable.Loading = PublicGamesTableLoading;

const TableHeadAndBody: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Table sx={{ tableLayout: "fixed" }}>
      <TableHead>
        <TableRow>
          {["Game ID", "Status", "Participants"].map((header) => (
            <TableCell key={header}>
              <Typography fontWeight="bold">{header}</Typography>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>{children}</TableBody>
    </Table>
  );
};

const BodyTypography: FC<TypographyProps> = (props) => (
  <Typography
    color="textSecondary"
    {...props}
    sx={{ ...props.sx, textDecoration: "none" }}
  />
);

const getGameStatusDisplay = ({
  status,
}: GameState): { label: string; Icon: SvgIconComponent } => {
  switch (status) {
    case "IN_LOBBY":
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
