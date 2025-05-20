import { FastifyInstance } from "fastify";
import db from '../db';

export default async function friendsRoutes(app: FastifyInstance)
{
	//Rajout d'un amis
	app.post('/', async (req, reply) => 
	{
		const { user1_id, user2_id } = req.body as any;

		if (!user1_id || !user2_id)
			return reply.status(400).send({ error: "Données incomplétes " });

		// Vérifie que les users sont différents
		if (user1_id === user2_id) {
		return reply.status(400).send({ error: "Un user ne peut s'jouter comme amis" });
		}

		// Vérifie que les users existent
		const getUser = db.prepare(`SELECT id FROM users WHERE id = ?`);
		if (!getUser.get(user1_id) || !getUser.get(user2_id)) {
		return reply.status(404).send({ error: "un des users n'existe pas" });
		}

		try
		{
			const stmt = db.prepare(`INSERT INTO matchs (user1_id, user2_id)
									 VALUES (?, ?)
				`);
			const result = stmt.run(user1_id, user2_id);
			return { success: true, id: result.lastInsertRowid };
		}
		catch (err: any)
		{
			return reply.status(500).send({ error: 'Erreur interne', message: err.message });
		}
	});
}