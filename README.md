# Bramagrams

Kinda like Bananagrams except Emily changed it so she always wins.

This application is deployed to Heroku and can be accessed via the following URLs:

[http://www.bramagrams.com]()

[https://bramagrams-v2.herokuapp.com/]()

How to play instructions can be viewed on the home page of the deployed application and are rendered via the [HowToPlay component](client/src/components/shared/HowToPlay.tsx).

## Dependencies

* Node v14.x
* NPM v6.x
* Yarn v1.x

## Repo Structure

The server source code is located in the `./server/src` directory. Its entrypoint is `server.ts` (or `./dist/server.js` after compilation).

The client source code is located in the `./client/src` directory. It was initialized using the `create-react-app` utility.

Shared source code is located in the `./shared/src` directory. This package is automatically built when `yarn install` is run from the root directory. Both the server and client depend on this code.

## Execution

To build and run the production build, run the following command:
```sh
yarn clean && \
yarn install && \
yarn build && \
yarn start
```

Run the following commands to start up the server and client separately in a development environment with file watchers so they will be updated as files are updated. The server will run on port 5000 and the client will run on port 3000.

**NOTE:** Before running the following commands, the `shared` packaged must be built and installed. To do this, run `yarn install` from the root directory.

Server:
```sh
cd server && \
yarn dev
```

Client:
```sh
cd client && \
yarn start
```
