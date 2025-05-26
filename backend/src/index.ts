import Fastify from 'fastify';
import pino from 'pino';
import userRoutes from './routes/users';
import matchsRoutes from './routes/matchs';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Assure que le dossier logs existe
const logsDir = path.resolve(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Logger pino dédié pour fichier
const fileLogger = pino(pino.destination(path.join(logsDir, 'app.log')));

// Fastify avec logger console activé
const app = Fastify({ logger: true });

app.get('/ping', async () => {
  fileLogger.info('Ping reçu');
  return { pong: 'it works!' };
});

app.register(userRoutes, { prefix: '/api/users' });
app.register(matchsRoutes, { prefix: '/api/matchs' });

const start = async () => {
  try {
    await app.listen({
      port: parseInt(process.env.PORT || '3000'),
      host: '0.0.0.0',
    });
    console.log(`Server running on port ${process.env.PORT || 3000}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
