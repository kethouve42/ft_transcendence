# Étape 1 : build TypeScript
FROM node:20 AS builder

WORKDIR /app

# Installer uniquement les dépendances (production + dev)
COPY backend/package*.json ./
RUN npm install

# Copier le reste du code source
COPY backend/tsconfig.json .
COPY backend/src ./src

# Compiler TypeScript
RUN npx tsc

# Étape 2 : image finale propre
FROM node:20

WORKDIR /app

# Copier uniquement ce qui est nécessaire
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY backend/.env .
COPY backend/data ./data

# Exposer le port (optionnel)
EXPOSE 3000

# Lancer le serveur
CMD ["node", "dist/index.js"]
