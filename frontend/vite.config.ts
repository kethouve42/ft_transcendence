// filepath: c:\Users\thiba\Documents\project\ft_transcendence\frontend\vite.config.ts
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:3000', // adapte si besoin
    },
  },
});