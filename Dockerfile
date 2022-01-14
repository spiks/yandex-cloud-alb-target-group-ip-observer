FROM node:16.13-alpine3.14 as npm

WORKDIR /app

COPY ./.npmrc /app/.npmrc
COPY ./package.json /app/package.json
COPY ./package-lock.json /app/package-lock.json

RUN npm ci --production

FROM node:16.13-alpine3.14 as build

WORKDIR /app

COPY . /app
COPY --from=npm /app/node_modules /app/node_modules

RUN npx tsc

FROM node:16.13-alpine3.14

WORKDIR /app

ARG APP_VERSION
ENV APP_VERSION="$APP_VERSION"

COPY --from=npm /app/node_modules /app/node_modules
COPY --from=build /app/src /app/src

ENTRYPOINT ["node", "src/worker.js"]
