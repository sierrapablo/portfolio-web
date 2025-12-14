# Stage 1: Build
FROM node:24.11.1-alpine AS build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# Stage 2: Runtime
FROM nginx:alpine AS runtime

# Configure Nginx to listen on 4321 and handle static files/404
RUN echo 'server { \
    listen 4321; \
    root /usr/share/nginx/html; \
    index index.html; \
    error_page 404 /404.html; \
    location / { \
        try_files $uri $uri/ =404; \
    } \
}' > /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321

CMD ["nginx", "-g", "daemon off;"]
