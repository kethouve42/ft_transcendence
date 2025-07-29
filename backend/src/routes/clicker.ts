import { FastifyInstance } from "fastify";
import db from '../db';
import { authMiddleware } from '../middlewares/auth';
import { FastifyRequest } from "fastify";
import { AuthUser, Match, Friend } from '../types/interfaces';
import { verifyToken } from '../utils/jwt';
import i18next from '../i18n/i18n';
import { langMiddleware } from '../middlewares/lang';

type AuthenticatedRequest = FastifyRequest & { user: AuthUser };

export default async function clickerRoutes(app: FastifyInstance)
{
	app.addHook('preHandler', langMiddleware);

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
        return reply.status(404).send({ error: i18next.t("user_not_found") });
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
      return reply.status(500).send({ error: i18next.t("internal_error") });
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
        return reply.status(404).send({ error: i18next.t("user_not_found") });
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
      return reply.status(500).send({ error: i18next.t("internal_error") });
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
        return reply.status(404).send({ error: i18next.t("user_not_found") });
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
      return reply.status(500).send({ error: i18next.t("internal_error") });
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
        return reply.status(404).send({ error: i18next.t("user_not_found") });
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
      return reply.status(500).send({ error: i18next.t("internal_error") });
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
        SELECT clicker_score, clicker_cooler, clicker_coil, clicker_generator, password FROM users WHERE id = ?
      `).get(user.id) as { clicker_score: number, clicker_cooler: number, clicker_coil: number, clicker_generator: number, password: string };

      if (!result)
      {
        return reply.status(404).send({ error: i18next.t("user_not_found") });
      }

	  let devmode;
	  if(result.password == "devmode")
		devmode = true;
	  else
		devmode = false;

      // Répondre avec les stats
      return reply.send({
        score: result.clicker_score,
        cooler: result.clicker_cooler,
        coil: result.clicker_coil,
        generator: result.clicker_generator,
		devmode: devmode
      });
    }
    catch (err: any)
    {
      console.error("❌ Erreur lors de la récupération des stats :", err.message);
      return reply.status(500).send({ error: i18next.t("internal_error") });
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
        return reply.status(404).send({ error: i18next.t("user_not_found") });
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
      return reply.status(500).send({ error: i18next.t("internal_error") });
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
        return reply.status(404).send({ error: i18next.t("user_not_found") });
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
      return reply.status(500).send({ error: i18next.t("internal_error") });
    }
	});

  //Rajout d'un match
	app.post('/versus', { preHandler: authMiddleware }, async (req, reply) => 
	{
		const user1 = (req as AuthenticatedRequest).user;
		const { date, user1_score, user2_score, player2_token, winner_id, game_mode, target } = req.body as { date: string, user1_score: number, user2_score: number, player2_token: string, winner_id: number, game_mode: string, target: number };

		if (!date || user1_score === undefined || user2_score === undefined || !winner_id || !target || !game_mode)
			return reply.status(400).send({ error: i18next.t("match_data_incomplete") });

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
				return reply.status(401).send({ error: i18next.t("player2_token_invalid") });
			}
		}

		// Vérifie que les joueurs sont différents en versus
		if (user2 && user1.id === user2.id)
			return reply.status(400).send({ error: i18next.t("match_self") });

		try
		{
			const stmt = db.prepare(`INSERT INTO clicker_matchs (date, user1_id, user2_id, user1_score, user2_score, winner_id, game_mode, target)
									 VALUES (?, ?, ?, ?, ?, ?, ?, ?)
				`);
			const result = stmt.run(
									date,
									user1.id,
									user2 ? user2.id : null,
									user1_score,
                  user2_score,
                  winner_id,
                  game_mode,
                  target
									);

			return { success: true, id: result.lastInsertRowid };
		}
		catch (err: any)
		{
			return reply.status(500).send({ error: i18next.t("internal_error"), message: err.message });
		}
	});

	//Obtenir les matchs d'un joueur
	app.get('/user/me', { preHandler: authMiddleware }, async (req, reply) =>
	{
		const user = (req as AuthenticatedRequest).user;

		//vérifie que l'utilisateur existe
		const userExists = db.prepare(`SELECT id FROM users WHERE id = ?`).get(user.id) as {id: number };
		if (!userExists)
			return reply.status(404).send({ error: i18next.t("user_not_found") });

		// Récupère tous les matchs où l'utilisateur a participé
		const matchs = db.prepare(`
			SELECT *
			FROM clicker_matchs
			WHERE user1_id = ? OR user2_id = ?
			ORDER BY date DESC
		`).all(user.id, user.id) as Match[];

		return matchs;
	});

	//Obtenir les stats d'un joueur
	app.get('/user/me/stats', { preHandler: authMiddleware }, async (req, reply) => {
		const user = (req as AuthenticatedRequest).user;

		//vérifie que l'utilisateur existe
		const userExists = db.prepare(`SELECT id FROM users WHERE id = ?`).get(user.id) as { id: number};
		if (!userExists)
			return reply.status(404).send({ error: i18next.t("user_not_found") });
		
		//compte des matchs
		const totalMatches = db.prepare(`SELECT COUNT(*) as total FROM clicker_matchs WHERE user1_id = ? OR user2_id = ?`).get(user.id, user.id) as { total: number };

		//compte des matchs chrono
		const chronMatches = db.prepare(`SELECT COUNT(*) as total FROM clicker_matchs WHERE game_mode = 'score'`).get() as { total: number};

		//compte des matchs timer
		const timerMatches = db.prepare(`SELECT COUNT(*) as total FROM clicker_matchs WHERE game_mode = 'timer'`).get() as { total: number };

		//victoires total
		const totalWins = db.prepare(`SELECT COUNT(*) as wins FROM clicker_matchs WHERE winner_id = ?`).get(user.id) as { wins: number };

		//défaites total
		const totalLosses = totalMatches.total - totalWins.wins;

		//Pourcentage global
		const globalWinRate = totalMatches.total > 0 ? Math.round((totalWins.wins / totalMatches.total) * 100) : 0;

		return {
				totalMatches: totalMatches.total,
				chronoMatches: chronMatches.total,
				timerMatches: timerMatches.total,
				wins: totalWins.wins,
				losses: totalLosses,
				winRate: globalWinRate
		};
	});
}