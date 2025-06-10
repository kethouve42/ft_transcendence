import { FastifyInstance } from "fastify";
import db from '../db';

export default async function matchsRoutes(app: FastifyInstance)
{
	// Recupére l'historique des matchs
	app.get ('/', async () =>
	{
		const matchs = db.prepare(`SELECT id, date, duration, user1_id, user2_id, winner_id, score FROM matchs ORDER BY date DESC`).all();
		return matchs;

	});

	//Rajout d'un match
	app.post('/', async (req, reply) => 
	{
		const { date, duration, user1_id, user2_id, winner_id, score } = req.body as any;

		if (!date || !duration || !user1_id || !score)
			return reply.status(400).send({ error: "Données du match incomplétes" });

		// Vérifie que les joueurs sont différents
		if (user2_id && user1_id === user2_id) {
		return reply.status(400).send({ error: "Un joueur ne peut pas jouer contre lui-même" });
		}

		// Vérifie que les joueurs existent
		const getUser = db.prepare(`SELECT id FROM users WHERE id = ?`);

		if (!getUser.get(user1_id)) {
		return reply.status(404).send({ error: "Joueur 1 non trouvé" });
		}

		if (user2_id && !getUser.get(user2_id)) {
		return reply.status(404).send({ error: "Joueur 2 non trouvé" });
		}

		// Vérifie que le gagnant est l'un des deux
		if (winner_id !== user1_id && winner_id !== user2_id && winner_id !== null) {
		return reply.status(400).send({ error: "Le gagnant doit être l’un des deux joueurs" });
		}

		try
		{
			const stmt = db.prepare(`INSERT INTO matchs (date, duration, user1_id, user2_id, winner_id, score)
									 VALUES (?, ?, ?, ?, ?, ?)
				`);
			const result = stmt.run(
									date,
									duration,
									user1_id,
									user2_id === undefined || user2_id === 0 ? null : user2_id,
									winner_id === undefined || winner_id === 0 ? null : winner_id,
									score
									);

			return { success: true, id: result.lastInsertRowid };
		}
		catch (err: any)
		{
			return reply.status(500).send({ error: 'Erreur interne', message: err.message });
		}
	});

	//Trouver un match par id
	app.get('/:id', async (req, reply) =>
	{
		const { id } = req.params as any;
		const match = db.prepare(`SELECT * FROM matchs WHERE id = ?`).get(id);

		if (!match)
			return reply.status(404).send({ error: 'Match non trouvé' });
		return match;
	});

	//Suppression d'un match par son id
	app.delete('/:id', async (req, reply) =>
	{
		const { id } = req.params as any;
		const result = db.prepare(`DELETE FROM matchs WHERE id = ?`).run(id);
		if (result.changes === 0)
			return reply.status(404).send({ error: "Match introuvable" });
		return { success: true };
	});

	//Match d'un joueur
	app.get('/user/:user_id', async (req, reply) =>
	{
		const { user_id } = req.params as any;

		// Vérifie que l'utilisateur existe
		const user = db.prepare(`SELECT id FROM users WHERE id = ?`).get(user_id);
		if (!user)
			return reply.status(404).send({ error: "Utilisateur non trouvé" });

		// Récupère tous les matchs où l'utilisateur a participé
		const matchs = db.prepare(`
			SELECT id, date, duration, user1_id, user2_id, winner_id, score
			FROM matchs
			WHERE user1_id = ? OR user2_id = ?
			ORDER BY date DESC
		`).all(user_id, user_id);

		return matchs;
	});

	//Obtenir les stats d'un joueur
	app.get('/user/:user_id/stats', async (requestAnimationFrame, reply) =>
	{
		const { user_id } = requestAnimationFrame.params as any;

		//vérifie que l'utilisateur existe
		const user = db.prepare(`SELECT id FROM users WHERE id = ?`).get(user_id);
		if (!user)
			return reply.status(404).send({ error: "Utilisateur non trouvé" });
		
		//compte des matchs
		const totalMatches = db.prepare(`SELECT COUNT(*) as total FROM matchs WHERE user1_id = ? OR user2_id = ?`).get(user_id, user_id) as { total: number };

		//Temps de jeu total
		const gameTime = db.prepare(`SELECT SUM(duration) as total_time FROM matchs WHERE user1_id = ? OR user2_id = ?`).get(user_id, user_id) as { total_time: number | null };

		//Temps de jeu vs IA
		const iaGameTime = db.prepare(`SELECT SUM(duration) as total_ia_time FROM matchs WHERE user1_id = ? AND user2_id IS null`).get(user_id) as { total_ia_time: number | null };

		//victoires total
		const totalWins = db.prepare(`SELECT COUNT(*) as wins FROM matchs WHERE winner_id = ?`).get(user_id) as { wins: number };

		//défaites total
		const totalLosses = totalMatches.total - totalWins.wins;

		//Pourcentage global
		const globalWinRate = totalMatches.total > 0 ? Math.round((totalWins.wins / totalMatches.total) * 100) : 0;

		//Durée moyenne des matchs
		const avgDuration = db.prepare(`SELECT AVG(duration) as average_duration FROM matchs WHERE user1_id = ? OR user2_id = ?`).get(user_id, user_id) as { average_duration: number | null };

		//stats contre l'IA (user2_id = null)
		const aiMatches = db.prepare(`SELECT COUNT(*) as total FROM matchs WHERE user1_id = ? AND user2_id IS NULL`).get(user_id) as { total: number };

		//Victoire contre l'IA
		const aiWins = db.prepare(`SELECT COUNT(*) as wins FROM matchs WHERE winner_id = ? AND (user1_id = ? AND user2_id IS NULL)`).get(user_id, user_id) as { wins: number };
		
		//Défaite contre l'IA
		const aiLosses = aiMatches.total - aiWins.wins;

		//Pourcentage contre l'IA
		const aiWinsRate = aiMatches.total > 0 ? Math.round((aiWins.wins / aiMatches.total) * 100) : 0;

		//Stats contre un autre joueur
		const pvpMatches = db.prepare(`SELECT COUNT(*) as total FROM matchs WHERE (user1_id = ? OR user2_id = ?) AND user1_id IS NOT NULL AND user2_id IS NOT NULL`).get(user_id, user_id) as { total: number };

		//Victoire contre d'autre joueur
		const pvpWins = db.prepare(`SELECT COUNT (*) as wins FROM matchs WHERE (winner_id = ? AND user1_id IS NOT NULL AND user2_id IS NOT NULL)`).get(user_id) as { wins: number };

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