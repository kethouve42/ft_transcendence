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
		if (user_id === friend_id)
			return reply.status(400).send({ error: "Un utilisateur ne peut s'ajouter comme amis" });

		// Vérifie que les users existent
		const getUser = db.prepare(`SELECT id FROM users WHERE id = ?`);
		if (!getUser.get(user_id) || !getUser.get(friend_id)) 
			return reply.status(404).send({ error: "un ou plusieurs des utilisateurs n'existe pas" });

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
			if (err.code === 'SQLITE_CONSTRAINT_PRIMARYKEY')
				return reply.status(409).send({ error: "Amitié déja existante" });
			return reply.status(500).send({ error: 'Erreur interne', message: err.message });
		}
	});

	//Suppression d'un amis
	app.delete('/', async (req, reply) =>
	{
		const { user_id, friend_id } = req.body as any;

		if (!user_id || !friend_id)
			return reply.status(400).send({ error: "Données incomplétes " });

		if (user_id === friend_id)
			return reply.status(400).send({ error: "Un utilisateur ne peut s'ajouter/supprimer lui-même comme amis" });
		
		const getUser = db.prepare(`SELECT id FROM users WHERE id = ?`);
		if (!getUser.get(user_id) || !getUser.get(friend_id)) 
			return reply.status(404).send({ error: "un ou plusieurs des utilisateurs n'existe pas" });

		try
		{
			const stmt = db.prepare(`DELETE FROM friends WHERE user_id = ? AND friend_id = ?`);
			const result = stmt.run(user_id, friend_id);

			if (result.changes === 0)
				return reply.status(404).send({ error: "Amitié non trouvée" });

			return { success: true };
		}
		catch (err: any)
		{
			return reply.status(500).send({ error: 'Erreur interne', message: err.message });
		}
	});

	// Affiche les amis d’un utilisateur
	app.get('/:id/friends', async (req, reply) =>
	{
		const { id } = req.params as any;

		const user = db.prepare(`SELECT id FROM users WHERE id = ?`).get(id);
		if (!user)
			return reply.status(404).send({ error: "Utilisateur non trouvé" });

		// On récupère les IDs des amis
		const friends = db.prepare(`
			SELECT users.id, users.login, users.email, users.alias, users.avatar
			FROM friends
			JOIN users ON users.id = friends.friend_id
			WHERE friends.user_id = ?
		`).all(id);

		return friends;
	});

}