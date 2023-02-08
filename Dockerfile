FROM node:lts-alpine as base

WORKDIR /src

COPY package.json /
COPY tsconfig.json ./
COPY src ./src

# FROM base as production
# ENV NODE_ENV=production
# RUN npm ci
# COPY . /

# FROM base as dev
# ENV NODE_ENV=development
# RUN npm install -g ts-node && npm install
# COPY . /

RUN npm install
# CMD ["tsc", ""]

EXPOSE 3008