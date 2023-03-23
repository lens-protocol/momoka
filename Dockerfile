FROM node:18.14-alpine as base

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src
COPY .env ./

RUN npm install -g pnpm

RUN chown -R node:node /usr/src/app

USER node

RUN pnpm i
RUN pnpm build

COPY lib ./lib

EXPOSE 3008

CMD ["npm", "run", "start:native"]
