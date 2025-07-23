import { FastifyInstance } from "fastify";
import db from '../db';
import { authMiddleware } from '../middlewares/auth';
import { FastifyRequest } from "fastify";
import { AuthUser, Match, Friend } from '../types/interfaces';
import { verifyToken } from '../utils/jwt';
import i18next from '../i18n/i18n';

type AuthenticatedRequest = FastifyRequest & { user: AuthUser };

export default async function matchsRoutes(app: FastifyInstance)
{
	// Recupére l'historique des matchs
	app.get ('/', async () =>
	{
		const matchs = db.prepare(`SELECT id, date, duration, user1_id, user2_id, winner_id, score FROM matchs ORDER BY date DESC`).all() as Match[];
		return matchs;

	});

	//Rajout d'un match
	app.post('/', { preHandler: authMiddleware }, async (req, reply) => 
	{
		const user1 = (req as AuthenticatedRequest).user;
		const { date, duration, winner_id, score, player2_token } = req.body as { date: string, duration: number, winner_id: number, score: string, player2_token: string };

		if (!date || !user1 || !duration || !user1.id || !score)
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

		// Vérifie que les joueurs sont différents en PVP
		if (user2 && user1.id === user2.id)
			return reply.status(400).send({ error: i18next.t("match_self") });

		// Vérifie que le gagnant est l'un des deux
		if (winner_id !== user1.id && (!user2 || winner_id !== user2.id) && winner_id !== null)
			return reply.status(400).send({ error: i18next.t("match_winner_invalid") });

		try
		{
			const stmt = db.prepare(`INSERT INTO matchs (date, duration, user1_id, user2_id, winner_id, score)
									 VALUES (?, ?, ?, ?, ?, ?)
				`);
			const result = stmt.run(
									date,
									duration,
									user1.id,
									user2 ? user2.id : null,
									winner_id === undefined || winner_id === 0 ? null : winner_id,
									score
									);

			return { success: true, id: result.lastInsertRowid };
		}
		catch (err: any)
		{
			return reply.status(500).send({ error: i18next.t("internal_error"), message: err.message });
		}
	});

	//Trouver un match par id
	app.get('/:id', async (req, reply) =>
	{
		const { id } = req.params as { id: number };
		const match = db.prepare(`SELECT * FROM matchs WHERE id = ?`).get(id) as Match;

		if (!match)
			return reply.status(404).send({ error: i18next.t("match_not_found") });
		return match;
	});

	//Suppression d'un match par son id
	app.delete('/:id', async (req, reply) =>
	{
		const { id } = req.params as { id: number };
		const result = db.prepare(`DELETE FROM matchs WHERE id = ?`).run(id);
		if (result.changes === 0)
			return reply.status(404).send({ error: i18next.t("match_not_found") });
		return { success: true };
	});

	//Match d'un joueur
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
			FROM matchs
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
		const totalMatches = db.prepare(`SELECT COUNT(*) as total FROM matchs WHERE user1_id = ? OR user2_id = ?`).get(user.id, user.id) as { total: number };

		//Temps de jeu total
		const gameTime = db.prepare(`SELECT SUM(duration) as total_time FROM matchs WHERE user1_id = ? OR user2_id = ?`).get(user.id, user.id) as { total_time: number | null };

		//Temps de jeu vs IA
		const iaGameTime = db.prepare(`SELECT SUM(duration) as total_ia_time FROM matchs WHERE user1_id = ? AND user2_id IS null`).get(user.id) as { total_ia_time: number | null };

		//victoires total
		const totalWins = db.prepare(`SELECT COUNT(*) as wins FROM matchs WHERE winner_id = ?`).get(user.id) as { wins: number };

		//défaites total
		const totalLosses = totalMatches.total - totalWins.wins;

		//Pourcentage global
		const globalWinRate = totalMatches.total > 0 ? Math.round((totalWins.wins / totalMatches.total) * 100) : 0;

		//Durée moyenne des matchs
		const avgDuration = db.prepare(`SELECT AVG(duration) as average_duration FROM matchs WHERE user1_id = ? OR user2_id = ?`).get(user.id, user.id) as { average_duration: number | null };

		//stats contre l'IA (user2_id = null)
		const aiMatches = db.prepare(`SELECT COUNT(*) as total FROM matchs WHERE user1_id = ? AND user2_id IS NULL`).get(user.id) as { total: number };

		//Victoire contre l'IA
		const aiWins = db.prepare(`SELECT COUNT(*) as wins FROM matchs WHERE winner_id = ? AND (user1_id = ? AND user2_id IS NULL)`).get(user.id, user.id) as { wins: number };
		
		//Défaite contre l'IA
		const aiLosses = aiMatches.total - aiWins.wins;

		//Pourcentage contre l'IA
		const aiWinsRate = aiMatches.total > 0 ? Math.round((aiWins.wins / aiMatches.total) * 100) : 0;

		//Stats contre un autre joueur
		const pvpMatches = db.prepare(`SELECT COUNT(*) as total FROM matchs WHERE (user1_id = ? OR user2_id = ?) AND user1_id IS NOT NULL AND user2_id IS NOT NULL`).get(user.id, user.id) as { total: number };

		//Victoire contre d'autre joueur
		const pvpWins = db.prepare(`SELECT COUNT (*) as wins FROM matchs WHERE (winner_id = ? AND user1_id IS NOT NULL AND user2_id IS NOT NULL)`).get(user.id) as { wins: number };

		//Défaite en PvP
		const pvpLosses = pvpMatches.total - pvpWins.wins;

		//PvP Winrate
		const pvpWinRate = pvpMatches.total > 0 ? Math.round((pvpWins.wins / pvpMatches.total) * 100) : 0; 

		return {
			global:
			{
				totalMatches: totalMatches.total,
				wins: totalWins.wins,
				losses: totalLosses,
				winRate: globalWinRate,
				averageDuration: Math.round(avgDuration.average_duration ?? 0),
				totalGameTime: gameTime.total_time ?? 0
			},
			vsAI:
			{
				matches: aiMatches.total,
				wins: aiWins.wins,
				losses: aiLosses,
				winRate: aiWinsRate,
				totalIaTime: iaGameTime.total_ia_time ?? 0
			},
			vsPlayer:
			{
				matches: pvpMatches.total,
				wins: pvpWins.wins,
				losses: pvpLosses,
				winRate: pvpWinRate,
				totalMultiTime: (gameTime.total_time ?? 0) - (iaGameTime.total_ia_time ?? 0)
			}
		};
	});

}