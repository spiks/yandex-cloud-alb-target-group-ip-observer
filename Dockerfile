FROM node:16.13-alpine3.14 as npm

COPY . .

RUN npm ci --production
RUN npx tsc

FROM node:16.13-alpine3.14

ARG APP_VERSION
ENV APP_VERSION="$APP_VERSION"

COPY --from=npm ./build ./build
COPY --from=npm ./node_modules ./node_modules

ENTRYPOINT ["node", "build/worker.js"]
