import { FastifyInstance } from "fastify";
import db from '../db';
import { authMiddleware } from '../middlewares/auth';
import { FastifyRequest } from "fastify";
import { AuthUser, Match, Friend } from '../types/interfaces';

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
      `).get(user.id) as { clicker_score: number};

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

      if( result.clicker_score > result.clicker_cooler)
      {
        // Incrémenter la valeur du cooler et score
        let newCooler = Number(result.clicker_cooler ?? 0) + 1;
        let newScore = Number(result.clicker_score ?? 0) - (result.clicker_cooler);

        // Mettre à jour la valeur dans la base de données
        db.prepare(`
          UPDATE users SET clicker_score = ?, clicker_cooler = ? WHERE id = ?
        `).run(newScore, newCooler, user.id);

        // Répondre avec la nouvelle valeur
        return reply.send({ newScore, newCooler });
      }
      else
      {
        return reply.status(400).send({ error: "Vous n'avez pas assez de points pour acheter un cooler." });
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

      if( result.clicker_score > result.clicker_generator)
      {
        // Incrémenter la valeur du generator et score
        let newGenerator = Number(result.clicker_generator ?? 0) + 1;
        let newScore = Number(result.clicker_score ?? 0) - (result.clicker_generator);

        // Mettre à jour la valeur dans la base de données
        db.prepare(`
          UPDATE users SET clicker_score = ?, clicker_generator = ? WHERE id = ?
        `).run(newScore, newGenerator, user.id);

        // Répondre avec la nouvelle valeur
        return reply.send({ newScore, newGenerator });
      }
      else
      {
        return reply.status(400).send({ error: "Vous n'avez pas assez de points pour acheter un generateur." });
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

      if( result.clicker_score > result.clicker_coil)
      {
        // Incrémenter la valeur du coil et score
        let newCoil = Number(result.clicker_coil ?? 0) + 1;
        let newScore = Number(result.clicker_score ?? 0) - (result.clicker_coil);

        // Mettre à jour la valeur dans la base de données
        db.prepare(`
          UPDATE users SET clicker_score = ?, clicker_coil = ? WHERE id = ?
        `).run(newScore, newCoil, user.id);

        // Répondre avec la nouvelle valeur
        return reply.send({ newScore, newCoil });
      }
      else
      {
        return reply.status(400).send({ error: "Vous n'avez pas assez de points pour acheter une bobine." });
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
      let currentScore = BigInt(result.clicker_score ?? 0) + BigInt(result.clicker_generator) * BigInt(10);

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
}
