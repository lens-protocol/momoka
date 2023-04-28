FROM node:18.14-alpine as base

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src
COPY .env ./

# Install pnpm locally in your project directory
RUN npm install pnpm

# Install project dependencies using pnpm
RUN npx pnpm install

RUN chown -R node:node /usr/src/app

USER node

# Build the project
RUN npm run build

EXPOSE 3008

CMD ["npm", "run", "start"]
