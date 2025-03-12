# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.15.1
FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /usr/server

COPY package*.json ./

RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev && npm cache clean --force

COPY . .

ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

# Production stage
FROM node:${NODE_VERSION}-alpine AS production

WORKDIR /usr/server

COPY --from=builder /usr/server/node_modules ./node_modules
COPY --from=builder /usr/server/package*.json ./
COPY --from=builder /usr/server/src ./src
COPY --from=builder /usr/server/app.js ./app.js

RUN chown -R node:node /usr/server
USER node

EXPOSE 3000

CMD ["node", "app.js"]
RUN ls /usr/server/