FROM node:22-alpine AS build
WORKDIR /app
COPY pnpm-lock.yaml package.json ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

FROM node:22-alpine
RUN corepack enable && pnpm install -g serve
COPY --from=build /app/dist /app/dist
EXPOSE 3000
CMD ["serve", "/app/dist", "-l", "3000"]
