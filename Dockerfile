FROM node:22-alpine AS base

WORKDIR /app


FROM base AS dependencies

COPY package*.json ./

RUN npm ci --omit=dev --ignore-scripts


FROM base AS production

ENV NODE_ENV=production

COPY --from=dependencies /app/node_modules ./node_modules

COPY --chown=node:node package.json ./
COPY --chown=node:node server.js ./
COPY --chown=node:node src ./src
COPY --chown=node:node scripts ./scripts

EXPOSE 8000

USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8000/health || exit 1

CMD ["npm", "start"]