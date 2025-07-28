# Étape 1 : build TypeScript
FROM node:20 AS builder

WORKDIR /app

# Copier et installer les dépendances
COPY package*.json ./
RUN npm install


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
COPY data ./data
COPY src/i18n ./dist/i18n

EXPOSE 3000
CMD ["node", "dist/index.js"]
