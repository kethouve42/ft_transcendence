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

		if (!date || !duration || !user1_id || !user2_id || !winner_id || !score)
			return reply.status(400).send({ error: "Données du match incomplétes" });

		// Vérifie que les joueurs sont différents
		if (user1_id === user2_id) {
		return reply.status(400).send({ error: "Un joueur ne peut pas jouer contre lui-même" });
		}

		// Vérifie que les joueurs existent
		const getUser = db.prepare(`SELECT id FROM users WHERE id = ?`);
		if (!getUser.get(user1_id) || !getUser.get(user2_id)) {
		return reply.status(404).send({ error: "Un ou plusieurs joueurs n'existent pas" });
		}

		// Vérifie que le gagnant est l'un des deux
		if (winner_id !== user1_id && winner_id !== user2_id) {
		return reply.status(400).send({ error: "Le gagnant doit être l’un des deux joueurs" });
		}

		try
		{
			const stmt = db.prepare(`INSERT INTO matchs (date, duration, user1_id, user2_id, winner_id, score)
									 VALUES (?, ?, ?, ?, ?, ?)
				`);
			const result = stmt.run(date, duration, user1_id, user2_id, winner_id, score);
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

}