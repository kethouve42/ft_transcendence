import { FastifyInstance } from "fastify";
import db from '../db';
import { authMiddleware } from '../middlewares/auth';
import { FastifyRequest } from "fastify";
import { AuthUser, Match, Friend } from '../types/interfaces';
import { verifyToken } from '../utils/jwt';

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
        SELECT clicker_score, clicker_coil FROM users WHERE id = ?
      `).get(user.id) as { clicker_score: number, clicker_coil: number };

      if (!result)
      {
        return reply.status(404).send({ error: "Utilisateur introuvable." });
      }

      // Incrémenter le score
      let currentScore = BigInt(result.clicker_score ?? 0) + BigInt(result.clicker_coil ?? 0) + BigInt(1);

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

  // Route pour acheter un cooler
  app.post('/buyCooler', { preHandler: authMiddleware }, async (req, reply) =>
  {
    const user = (req as AuthenticatedRequest).user;

    try
    {
      // Récupérer la valeur actuelle du cooler
      const result = db.prepare(`
        SELECT clicker_score, clicker_cooler FROM users WHERE id = ?
      `).get(user.id) as { clicker_cooler: number, clicker_score: number };

      if (!result)
      {
        return reply.status(404).send({ error: "Utilisateur introuvable." });
      }

      // Calculer le coût du cooler en fonction de son niveau
      let cooler_cost;
      if (result.clicker_cooler == 0)
        cooler_cost = 50;
      else
        cooler_cost = Math.round(50 * Math.pow(1.15, result.clicker_cooler));

      if( result.clicker_score >= cooler_cost)
      {
        // Incrémenter la valeur du cooler et score
        let newCooler = Number(result.clicker_cooler ?? 0) + 1;
        let newScore = Number(result.clicker_score ?? 0) - (cooler_cost);

        // Mettre à jour la valeur dans la base de données
        db.prepare(`
          UPDATE users SET clicker_score = ?, clicker_cooler = ? WHERE id = ?
        `).run(newScore, newCooler, user.id);

        // Répondre avec la nouvelle valeur
        return reply.send({ success: true, newScore, newCooler });
      }
      else
      {
        return reply.send({ success: false });
      }
    }
    catch (err: any)
    {
      console.error("❌ Erreur lors de l'achat du cooler :", err.message);
      return reply.status(500).send({ error: "Erreur interne du serveur." });
    }
  });

  // Route pour acheter un generateur
  app.post('/buyGenerator', { preHandler: authMiddleware }, async (req, reply) =>
  {
    const user = (req as AuthenticatedRequest).user;

    try
    {
      // Récupérer la valeur actuelle du generator
      const result = db.prepare(`
        SELECT clicker_score, clicker_generator FROM users WHERE id = ?
      `).get(user.id) as { clicker_score: number, clicker_generator: number };

      if (!result)
      {
        return reply.status(404).send({ error: "Utilisateur introuvable." });
      }


      // Calculer le coût du generator en fonction de son niveau
      let generator_cost;
      if (result.clicker_generator == 0)
        generator_cost = 150;
      else
        generator_cost = Math.round(150 * Math.pow(1.25, result.clicker_generator));

      if( result.clicker_score >= generator_cost)
      {
        // Incrémenter la valeur du generator et score
        let newGenerator = Number(result.clicker_generator ?? 0) + 1;
        let newScore = Number(result.clicker_score ?? 0) - (generator_cost);

        // Mettre à jour la valeur dans la base de données
        db.prepare(`
          UPDATE users SET clicker_score = ?, clicker_generator = ? WHERE id = ?
        `).run(newScore, newGenerator, user.id);

        // Répondre avec la nouvelle valeur
        return reply.send({ success: true, newScore, newGenerator });
      }
      else
      {
        return reply.send({ success: false });
      }
    }
    catch (err: any)
    {
      console.error("❌ Erreur lors de l'achat du generator :", err.message);
      return reply.status(500).send({ error: "Erreur interne du serveur." });
    }
  });

  // Route pour acheter une coil
  app.post('/buyCoil', { preHandler: authMiddleware }, async (req, reply) =>
  {
    const user = (req as AuthenticatedRequest).user;

    try
    {
      // Récupérer la valeur actuelle de la coil
      const result = db.prepare(`
        SELECT clicker_score, clicker_coil FROM users WHERE id = ?
      `).get(user.id) as { clicker_score: number, clicker_coil: number };

      if (!result)
      {
        return reply.status(404).send({ error: "Utilisateur introuvable." });
      }

      // Calculer le coût du generator en fonction de son niveau
      let coil_cost;
      if (result.clicker_coil == 0)
        coil_cost = 75;
      else
        coil_cost = Math.round(75 * Math.pow(1.15, result.clicker_coil));


      if( result.clicker_score >= coil_cost)
      {
        // Incrémenter la valeur du coil et score
        let newCoil = Number(result.clicker_coil ?? 0) + 1;
        let newScore = Number(result.clicker_score ?? 0) - (coil_cost);

        // Mettre à jour la valeur dans la base de données
        db.prepare(`
          UPDATE users SET clicker_score = ?, clicker_coil = ? WHERE id = ?
        `).run(newScore, newCoil, user.id);

        // Répondre avec la nouvelle valeur
        return reply.send({ success: true, newScore, newCoil });
      }
      else
      {
        return reply.send({ success: false });
      }
    }
    catch (err: any)
    {
      console.error("❌ Erreur lors de l'achat du coil :", err.message);
      return reply.status(500).send({ error: "Erreur interne du serveur." });
    }
  });

  // Route pour obtenir les stats du clicker
  app.get('/stats', { preHandler: authMiddleware }, async (req, reply) =>
  {
    const user = (req as AuthenticatedRequest).user;

    try
    {
      // Récupérer les stats du clicker
      const result = db.prepare(`
        SELECT clicker_score, clicker_cooler, clicker_coil, clicker_generator FROM users WHERE id = ?
      `).get(user.id) as { clicker_score: number, clicker_cooler: number, clicker_coil: number, clicker_generator: number };

      if (!result)
      {
        return reply.status(404).send({ error: "Utilisateur introuvable." });
      }

      // Répondre avec les stats
      return reply.send({
        score: result.clicker_score,
        cooler: result.clicker_cooler,
        coil: result.clicker_coil,
        generator: result.clicker_generator
      });
    }
    catch (err: any)
    {
      console.error("❌ Erreur lors de la récupération des stats :", err.message);
      return reply.status(500).send({ error: "Erreur interne du serveur." });
    }
  });

  // Route pour generer l'energie des generateurs secondaires
  app.post('/generator', { preHandler: authMiddleware }, async (req, reply) =>
  {
    const user = (req as AuthenticatedRequest).user;

    try
    {
      // Récupérer le score actuel
      const result = db.prepare(`
        SELECT clicker_score, clicker_generator FROM users WHERE id = ?
      `).get(user.id) as { clicker_score: number, clicker_generator: number };

      if (!result)
      {
        return reply.status(404).send({ error: "Utilisateur introuvable." });
      }

      // Incrémenter le score
      let currentScore = BigInt(result.clicker_score ?? 0) + BigInt(result.clicker_generator);

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

  // Route pour la surchauffe
  app.post('/overheat', { preHandler: authMiddleware }, async (req, reply) =>
  {
    const user = (req as AuthenticatedRequest).user;

    try
    {
      // Récupérer le score actuel
      const result = db.prepare(`
        SELECT clicker_score FROM users WHERE id = ?
      `).get(user.id) as { clicker_score: number};

      if (!result)
      {
        return reply.status(404).send({ error: "Utilisateur introuvable." });
      }

      // Incrémenter le score
      let currentScore = BigInt(result.clicker_score ?? 0) * BigInt(75) / BigInt(100);

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

  //Rajout d'un match
	app.post('/versus', { preHandler: authMiddleware }, async (req, reply) => 
	{
		const user1 = (req as AuthenticatedRequest).user;
		const { date, user1_score, user2_score, player2_token } = req.body as { date: string, user1_score: number, user2_score: number, player2_token: string };

		if (!date || !user1_score || !user2_score || !user1.id)
			return reply.status(400).send({ error: "Données du match incomplétes" });

		//Si PVP, token player 2 existe et on le verifie
		let user2: AuthUser | null = null;
		if (player2_token)
		{
			try
			{
				const payload = verifyToken(player2_token);
				user2 = payload as AuthUser;
			}
			catch (err)
			{
				return reply.status(401).send({ error: "Token du joueur 2 invalide" });
			}
		}

		// Vérifie que les joueurs sont différents en versus
		if (user2 && user1.id === user2.id)
			return reply.status(400).send({ error: "Un joueur ne peut pas jouer contre lui-même" });

		try
		{
			const stmt = db.prepare(`INSERT INTO clicker_matchs (date, user1_id, user2_id, user1_score, user2_score)
									 VALUES (?, ?, ?, ?, ?)
				`);
			const result = stmt.run(
									date,
									user1.id,
									user2 ? user2.id : null,
									user1_score,
                  user2_score
									);

			return { success: true, id: result.lastInsertRowid };
		}
		catch (err: any)
		{
			return reply.status(500).send({ error: 'Erreur interne', message: err.message });
		}
	});
}
