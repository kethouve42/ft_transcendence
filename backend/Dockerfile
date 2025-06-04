# Étape 1 : build TypeScript
FROM node:20 AS builder

WORKDIR /app

# Copier et installer les dépendances
COPY package*.json ./
COPY .env ./
RUN npm install
#RUN npm install fastify-websocket ping
RUN npm install bcrypt
RUN npm install -D @types/bcrypt
RUN npm install jsonwebtoken
RUN npm install -D @types/jsonwebtoken
RUN npm install fastify-multipart


# Copier la config et le code
COPY tsconfig.json ./
COPY src ./src

# Compiler en JS
RUN npx tsc

# Étape 2 : image finale
FROM node:20

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY .env .
COPY data ./data

EXPOSE 3000
CMD ["node", "dist/index.js"]
