FROM node:18-slim AS build
WORKDIR /app

RUN npm install -g vite

COPY package.json package-lock.json* ./
RUN npm install

COPY vite.config.ts* ./
COPY public/. ./
COPY tsconfig.json  ./
COPY src  ./src

RUN npx vite build

FROM nginx:alpine
WORKDIR /usr/share/nginx/html

COPY public/index.html ./
COPY --from=build /app/dist ./

EXPOSE 80