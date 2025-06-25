import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken } from '../utils/jwt';
import db from '../db';


export function authMiddleware(req: FastifyRequest, reply: FastifyReply, done: () => void) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Token manquant ou invalide' });
  }

  const token = authHeader.split(' ')[1];

  try
  {
	const decoded = verifyToken(token);
	//verifie que l'user existe toujours
	let user;
	if (typeof decoded === 'object' && decoded !== null && 'id' in decoded) {
		user = db.prepare('SELECT id FROM users WHERE id = ?').get((decoded as any).id);
	}
	if (!user) {
		return reply.status(401).send({ error: 'Utilisateur supprimé ou inexistant' });
	}

		(req as any).user = decoded; // injecte les infos du token dans la requête
		done(); // passe à la route suivante
  }
  catch (err)
  {
    return reply.status(401).send({ error: 'Token invalide ou expiré' });
  }
}