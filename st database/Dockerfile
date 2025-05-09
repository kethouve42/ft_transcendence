FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Installe les dépendances
RUN npm install

# Copie le reste des fichiers (dont index.js)
COPY . .

CMD ["npm", "start"]
