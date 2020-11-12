import React from 'react';
import { Box } from '@material-ui/core';
import { GameState, Player, PlayerStatuses, GameStatuses } from 'bramagrams-shared';
import Page from '../../shared/Page';
import PlayerHand from './PlayerHand';
import GameBoardHeader from './GameBoardHeader';

const rotateArray = (newStart: number, array: any[]) => {
  if (newStart < 0) return array;
  return array.slice(newStart).concat(array.slice(0, newStart));
}

interface GameBoardProps {
  gameState: GameState;
  gameId: string;
  playerName: string;
  disableHandlers: boolean;
}

const GameBoard = ({ gameState, gameId, playerName, disableHandlers }: GameBoardProps) => {
  // Save each player's original index into the players list before filtering out spectators and reordering
  let playingPlayers = gameState.players.map((player, idx) => ({ player, idx }))
    .filter(p => p.player.status !== PlayerStatuses.SPECTATING);
  const thisPlayingPlayerIdx = playingPlayers.findIndex(p => p.player.name === playerName);
  playingPlayers = rotateArray(thisPlayingPlayerIdx, playingPlayers);

  const isCurrPlayer = (playerIdx: number) =>
    gameState.status === GameStatuses.IN_PROGRESS &&
    !!gameState.numTilesLeft &&
    playerIdx === gameState.currPlayerIdx;

  const playerIsReady = (player: Player) => player.status === PlayerStatuses.READY_TO_END;

  return (
    <Page>
      <GameBoardHeader
        gameState={gameState}
        gameId={gameId}
        playerName={playerName}
        disableHandlers={disableHandlers}
      />
      <Box flexGrow={1} display="flex" px={3} pb={3}>
        {playingPlayers.map(({ player, idx }) => (
          <Box key={idx} width={1 / playingPlayers.length}>
            <PlayerHand
              name={player.name}
              words={player.words}
              isYou={player.name === playerName}
              isCurrPlayer={isCurrPlayer(idx)}
              isReady={playerIsReady(player)}
              dark={gameState.status === GameStatuses.ENDED}
              small={playingPlayers.length > 2}
            />
          </Box>
        ))}
      </Box>
    </Page>
  );
};

export default GameBoard;
