import Fastify from 'fastify';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import userRoutes from './routes/users';
import matchsRoutes from './routes/matchs';
import friendsRoutes from './routes/friends';

dotenv.config();

// Assure que le dossier logs existe
const logsDir = path.resolve(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Fastify avec configuration de logger compatible
const app = Fastify({
  logger: {
    transport: {
      target: 'pino/file',
      options: {
        destination: path.join(logsDir, 'app.log'),
        mkdir: true,
      },
    },
    level: 'info',
  },
});

app.get('/ping', async (req, reply) => {
  req.log.info('Ping reçu');
  return { pong: 'it works!' };
});

app.register(userRoutes, { prefix: '/api/users' });
app.register(matchsRoutes, { prefix: '/api/matchs' });
app.register(friendsRoutes, { prefix: '/api/friends' });

const start = async () => {
  try {
    await app.listen({
      port: parseInt(process.env.PORT || '3000'),
      host: '0.0.0.0',
    });
    app.log.info(`Server running on port ${process.env.PORT || 3000}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
