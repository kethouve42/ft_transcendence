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
	tfa_enable: boolean;
	tfa_expires: number;
  tfa_code: string;
}

type AuthenticatedRequest = FastifyRequest & { user: AuthUser };

export default async function clickerRoutes(app: FastifyInstance)
{
  // Middleware d'authentification
  app.addHook("onRequest", authMiddleware);

  // Route pour mettre à jour le score du Clicker
  app.post("/clicker/update", async (request, reply) => {
    const authenticatedRequest = request as AuthenticatedRequest;
      const userId = authenticatedRequest.user.id;

      // Récupérer le score actuel de l'utilisateur
      const query = db.prepare(`
        SELECT clicker_score
        FROM users
        WHERE id = ?
      `);
      const result = query.get(userId) as { clicker_score: bigint | null };

      if (!result) {
        return reply.status(404).send({ error: "Utilisateur introuvable." });
      }

      let currentScore = BigInt(result.clicker_score || 0);

      // Incrémenter le score
      currentScore += BigInt(1);

      // Mettre à jour le score dans la base de données
      const update = db.prepare(`
        UPDATE users
        SET clicker_score = ?
        WHERE id = ?
      `);
      update.run(currentScore, userId);

      // Répondre avec le nouveau score
      try {
        return reply.send({ newScore: currentScore.toString() });
      } catch (err: any) {
        console.error("❌ Erreur lors de la mise à jour du score :", err.message);
        return reply.status(500).send({ error: "Erreur interne du serveur." });
      }
    });
}
