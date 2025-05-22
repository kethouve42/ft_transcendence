import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken } from '../utils/jwt';

export function authMiddleware(req: FastifyRequest, reply: FastifyReply, done: () => void) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Token manquant ou invalide' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    (req as any).user = decoded; // injecte les infos du token dans la requête
    done(); // passe à la route suivante
  } catch (err) {
    return reply.status(401).send({ error: 'Token invalide ou expiré' });
  }
}