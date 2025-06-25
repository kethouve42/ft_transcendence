import { FastifyInstance } from "fastify";
import db from '../db';
import { authMiddleware } from '../middlewares/auth';
import { FastifyRequest } from "fastify";

interface AuthUser
{
	id: number;
	login: string;
	alias: string;
	avatar: string;
	last_seen: number;
	email: string;
  clicker_score: bigint;
	clicker_cooler: number;
  clicker_coil: number;
  clicker_generator: number;
	tfa_enable: boolean;
	tfa_expires: number;
  tfa_code: string;
}

type AuthenticatedRequest = FastifyRequest & { user: AuthUser };

export default async function clickerRoutes(app: FastifyInstance)
{
  // Route pour incrémenter le score
  app.post('/update', { preHandler: authMiddleware }, async (req, reply) =>
  {
    const user = (req as AuthenticatedRequest).user;

		app.log.info('click');

    try
    {
      // Récupérer le score actuel
      const result = db.prepare(`
        SELECT clicker_score FROM users WHERE id = ?
      `).get(user.id) as { clicker_score: string | number | null };

      if (!result)
      {
        return reply.status(404).send({ error: "Utilisateur introuvable." });
      }

      // Incrémenter le score
      let currentScore = BigInt(result.clicker_score ?? 0) + BigInt(1);

      // Mettre à jour le score dans la base de données
      db.prepare(`
        UPDATE users SET clicker_score = ? WHERE id = ?
      `).run(currentScore.toString(), user.id);

      // Répondre avec le nouveau score
      return reply.send({ newScore: currentScore.toString() });
    }
    catch (err: any)
    {
      console.error("❌ Erreur lors de la mise à jour du score :", err.message);
      return reply.status(500).send({ error: "Erreur interne du serveur." });
    }
  });

  // Nouvelle route pour acheter un cooler
  app.post('/buyCooler', { preHandler: authMiddleware }, async (req, reply) =>
  {
    const user = (req as AuthenticatedRequest).user;

    try
    {
      // Récupérer la valeur actuelle du cooler
      const result = db.prepare(`
        SELECT clicker_cooler FROM users WHERE id = ?
      `).get(user.id) as { clicker_cooler: number | string | null };

      if (!result)
      {
        return reply.status(404).send({ error: "Utilisateur introuvable." });
      }

      // Incrémenter la valeur du cooler
      let newCooler = Number(result.clicker_cooler ?? 0) + 1;

      // Mettre à jour la valeur dans la base de données
      db.prepare(`
        UPDATE users SET clicker_cooler = ? WHERE id = ?
      `).run(newCooler, user.id);

      // Répondre avec la nouvelle valeur
      return reply.send({ newCooler });
    }
    catch (err: any)
    {
      console.error("❌ Erreur lors de l'achat du cooler :", err.message);
      return reply.status(500).send({ error: "Erreur interne du serveur." });
    }
  });
}
