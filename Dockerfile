FROM node:24.11.1-alpine AS prep
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:24.11.1-alpine AS build
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable
COPY --from=prep /app/node_modules ./node_modules
COPY --from=prep /app/package.json ./package.json
COPY --from=prep /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY . .
RUN pnpm build

FROM node:24.11.1-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod
COPY --from=build /app/dist ./dist
ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321
USER node
CMD ["node", "./dist/server/entry.mjs"]
