Pong codé en TypeScript, compilé en JavaScript et servi via NGINX dans un conteneur Docker.  
Aucune installation Node.js ou NPM n'est nécessaire sur la machine hôte.

---

## 🛠 Structure du projet

```bash
.
├── Dockerfile
├── src/
│ └── game.ts
├── dist/
│ └── game.js # (généré automatiquement)
├── public/
│ └── index.html
├── tsconfig.json
```

---

## 🚀 Utilisation rapide

### 1. **Build de l'image Docker**

```bash
docker build --no-cache -t pong .

2. Lancement du jeu

docker run -it --rm -p 8080:80 pong

Le jeu est accessible sur http://localhost:8080.