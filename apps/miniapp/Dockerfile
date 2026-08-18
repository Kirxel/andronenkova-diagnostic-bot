FROM node:22-bullseye AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json tsconfig.app.json vite.config.ts index.html ./
COPY src ./src

ARG VITE_API_BASE_URL
ARG VITE_USE_MOCK_API=false

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_USE_MOCK_API=${VITE_USE_MOCK_API}

RUN corepack enable \
    && pnpm approve-builds --all \
    && pnpm install --frozen-lockfile \
    && pnpm build

FROM nginx:1.27-alpine

COPY docker/nginx-miniapp.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

