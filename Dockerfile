FROM node:18.14-alpine as base

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src
COPY .env ./

RUN chown -R node:node /usr/src/app

USER node

RUN npm install
RUN npm run build

COPY lib ./lib

EXPOSE 3008

CMD ["npm", "run", "start:native"]
