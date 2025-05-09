# étape 1 : build avec Typescript
FROM node:20 AS builder

WORKDIR /app

COPY backend/package*.json ./
RUN npm install

COPY backend/tsconfig.json .
COPY backend/src ./src

RUN npm run build || npx tsc

#étape 2 : image finale, seulement les fichiers nécessaires
FROM node:20

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY backend/.env .

CMD ["node", "dist/index.js"]