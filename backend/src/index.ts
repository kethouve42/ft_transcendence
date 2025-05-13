import Fastify from 'fastify';
import userRoutes from './routes/users';
import dotenv from 'dotenv';

dotenv.config(); // charge les variable de .env dans process.env

const app = Fastify({ logger: true }); //(logger: true) active les logs dans la console

app.get('/ping', async () => {
  return { pong: 'it works!' };
});

app.register(userRoutes, { prefix: '/api/users' });

//Démarre le serveur
const start = async () => {
  try {
    await app.listen({
      port: parseInt(process.env.PORT || '3000'),
      host: '0.0.0.0', // permet à Docker ou toute machine d'acceder au serveur
    });
    console.log(`Server running on port ${process.env.PORT}`);
  } catch (err) {
    app.log.error(err); //erreur loggé
    process.exit(1); // arrêt du programme
  }
};

start();