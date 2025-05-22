FROM node:18-slim AS build
WORKDIR /app

RUN npm install -g esbuild

COPY package.json package-lock.json* ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src
COPY public ./public

RUN esbuild src/main.tsx \
  --bundle \
  --outfile=dist/main.js \
  --loader:.tsx=tsx \
  --format=esm \
  --target=es2020

FROM nginx:alpine
WORKDIR /usr/share/nginx/html

COPY public/index.html .
COPY --from=build /app/dist/*.js .