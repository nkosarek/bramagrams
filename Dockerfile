FROM node:14-alpine3.12

COPY ./ /app/

WORKDIR /app

RUN yarn install && yarn build

CMD [ "yarn", "start" ]
