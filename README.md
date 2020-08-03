# Bramagrams

Kinda like Bananagrams except Emily changed it so she always wins.

This application is deployed to Heroku and can be accessed via the following URLs:

[http://www.bramagrams.com]()

[https://bramagrams-v2.herokuapp.com/]()

#### Table of Contents

* [How To Play](#how-to-play)
  - [Starting](#starting)
  - [Basics](#basics)
  - [Stealing](#stealing)
  - [Endgame](#endgame)
* [Development](#development)
  - [Dependencies](#dependencies)
  - [Repo Structure](#repo-structure)
  - [Running](#running)

## How To Play

#### Starting

After a game is created from the home page, the player that created it will be sent to the lobby.

In the game lobby, players can set their name and wait for other players to join.

Once all players have set their names and clicked the **READY** button to signal they are ready to start, the **START GAME** button can be clicked to begin playing.

#### Basics

Each player will take turns "flipping" tiles over to add them to the pool at the top.

Once a word with at least 3 letters can be constructed using the tiles in the pool, players can type that word and hit the Enter key to claim it.

When a word is claimed by a player, it will move to that player's hand below their name. But be careful! The word can still be stolen by other players.

#### Stealing

Any word that has been claimed can be stolen by any player - including the player who originally claimed it.

However, to steal a word, players must _add_ tiles to that word, either by taking additional tiles from the pool, or by stealing multiple words at once.

#### Endgame

Once all of the tiles have been "flipped" and added to the pool, the game will not officially end until all players have acknowledged that they are done searching for words by clicking the **DONE** button.

Players can then choose to play a rematch if they all click the **REMATCH** button.

## Development

#### Dependencies

* Node v14.x
* NPM v6.x
* Yarn v1.x

#### Repo Structure

The server source code is located in the `server` directory. Its entrypoint is `server.ts` (or `./dist/server.js` after compilation). The server's `package.json` is located in the root directory.

The client source code is located in the `./client/src` directory. It was initialized using the `create-react-app` utility. The client's `package.json` is located in `./client`.

#### Running

To build and run the production build, run the following command:
```sh
yarn install && \
yarn build && \
yarn start
```

Run the following commands to start up the server and client separately in a development environment with file watchers so they will be updated as files are updated. The server will run on port 5000 and the client will run on port 3000.

Server:
```
yarn dev
```

Client:
```
cd client && \
yarn start
```
