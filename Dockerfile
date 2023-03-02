FROM node:18.12.1 as base

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src
COPY .env ./

RUN npm install
RUN npm run build

COPY lib ./lib

EXPOSE 3008

CMD ["npm", "run", "start:native"]