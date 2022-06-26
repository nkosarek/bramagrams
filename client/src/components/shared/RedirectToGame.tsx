import React from 'react';
import { Redirect } from 'react-router-dom';

interface Props {
  gameId: string;
}

export const RedirectToGame: React.FC<Props> = ({ gameId }) => (
  <Redirect push to={`/game/${gameId}`} />
);
