# Bramagrams

Kinda like Bananagrams except Emily changed it so she always wins.

This application is deployed to [Render](https://render.com) and can be accessed via the following URLs:

- https://bramagrams.com
- https://bramagrams.onrender.com

How to play instructions can be viewed on the home page of the deployed application and are rendered via the [HowToPlay component](src/ui/shared/components/HowToPlay.tsx).

## Local development

To run the app locally, make sure you have the Node.js version specified in the [.nvmrc](.nvmrc) file. Then run:

```sh
nvm use
npm install
npm run dev
```

The Next.js webserver will listen on port 3000, and the Socket.IO-based game server will listen on port 3737.
