import { FastifyInstance } from "fastify";
import db from '../db';

export default async function friendsRoutes(app: FastifyInstance)
{
	//Rajout d'un amis
	app.post('/', async (req, reply) => 
	{
		const { user_id, friend_id } = req.body as any;

		if (!user_id || !friend_id)
			return reply.status(400).send({ error: "Données incomplétes " });

		// Vérifie que les users sont différents
		if (user_id === friend_id) {
		return reply.status(400).send({ error: "Un user ne peut s'jouter comme amis" });
		}

		// Vérifie que les users existent
		const getUser = db.prepare(`SELECT id FROM users WHERE id = ?`);
		if (!getUser.get(user_id) || !getUser.get(friend_id)) {
		return reply.status(404).send({ error: "un des users n'existe pas" });
		}

		try
		{
			const stmt = db.prepare(`INSERT INTO friends (user_id, friend_id)
									 VALUES (?, ?)
				`);
			const result = stmt.run(user_id, friend_id);
			return { success: true, id: result.lastInsertRowid };
		}
		catch (err: any)
		{
			return reply.status(500).send({ error: 'Erreur interne', message: err.message });
		}
	});
}