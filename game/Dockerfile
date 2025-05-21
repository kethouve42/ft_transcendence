FROM node:18-slim as build
WORKDIR /app

RUN apt-get update && apt-get install -y wget tar \
 && wget https://registry.npmjs.org/typescript/-/typescript-5.3.3.tgz -O typescript.tgz \
 && mkdir typescript \
 && tar -xzf typescript.tgz \
 && mv package/* typescript/ \
 && rm -rf package typescript.tgz

COPY src ./src
COPY tsconfig.json .
COPY public ./public

RUN node typescript/lib/tsc.js --project tsconfig.json

FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY public/index.html .
COPY --from=build /app/dist/*.js ./
