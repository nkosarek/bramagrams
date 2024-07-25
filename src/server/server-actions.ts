"use server";

import { GamesController } from "./games-controller";
import { GameConfig } from "./schema";

// TODO: Move into Redis
const gamesController = new GamesController();

export async function createGame(gameConfig: GameConfig): Promise<string> {
  console.log("Received request to create game: gameConfig=", gameConfig);
  const id = gamesController.createGame(gameConfig);
  if (!id) {
    throw Error("ERROR: Failed to create a unique game ID\n");
  }
  console.log("Created game", id);
  return id;
}

export async function getPublicGames() {
  console.log("Received request to get public games");
  return gamesController.getPublicGames();
}
