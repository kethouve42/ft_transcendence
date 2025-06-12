import { FastifyInstance } from "fastify";
import db from '../db';
import { authMiddleware } from '../middlewares/auth';

export default async function friendsRoutes(app: FastifyInstance)
{
	// Rajout d'un ami
	app.post('/', { preHandler: authMiddleware }, async (req, reply) => 
	{
		const user = (req as any).user;
		const { friend_id } = req.body as any;
		const user_id = user.id; // On prend l'id du token

		if (!friend_id)
			return reply.status(400).send({ error: "Données incomplètes" });

		// Vérifie que les users sont différents
		if (user_id === friend_id)
			return reply.status(400).send({ error: "Un utilisateur ne peut s'ajouter comme ami" });

		// Vérifie que les users existent
		const getUser = db.prepare(`SELECT id FROM users WHERE id = ?`);
		if (!getUser.get(user_id) || !getUser.get(friend_id)) 
			return reply.status(404).send({ error: "Un ou plusieurs des utilisateurs n'existe pas" });

		try
		{
			const stmt = db.prepare(`INSERT INTO friends (user_id, friend_id) VALUES (?, ?)`);
			const result = stmt.run(user_id, friend_id);
			const result2 = stmt.run(friend_id, user_id);
			return { success: true, id: result.lastInsertRowid };
		}
		catch (err: any)
		{
			if (err.code === 'SQLITE_CONSTRAINT_PRIMARYKEY')
				return reply.status(409).send({ error: "Amitié déjà existante" });
			return reply.status(500).send({ error: 'Erreur interne', message: err.message });
		}
	});

	// Suppression d'un ami
	app.delete('/', { preHandler: authMiddleware }, async (req, reply) =>
	{
		const user = (req as any).user;
		const { friend_id } = req.body as any;
		const user_id = user.id;

		if (!friend_id)
			return reply.status(400).send({ error: "Données incomplètes" });

		if (user_id === friend_id)
			return reply.status(400).send({ error: "Un utilisateur ne peut s'ajouter/supprimer lui-même comme ami" });

		const getUser = db.prepare(`SELECT id FROM users WHERE id = ?`);
		if (!getUser.get(user_id) || !getUser.get(friend_id)) 
			return reply.status(404).send({ error: "Un ou plusieurs des utilisateurs n'existe pas" });

		try
		{
			const stmt = db.prepare(`DELETE FROM friends WHERE user_id = ? AND friend_id = ?`);
			const result1 = stmt.run(user_id, friend_id);
			const result2 = stmt.run(friend_id, user_id);

			if (result1.changes === 0)
				return reply.status(404).send({ error: "Amitié non trouvée" });

			return { success: true };
		}
		catch (err: any)
		{
			return reply.status(500).send({ error: 'Erreur interne', message: err.message });
		}
	});

	// Affiche les amis d’un utilisateur
	app.get('/me/friends', { preHandler: authMiddleware }, async (req, reply) =>
	{
		const user = (req as any).user;
		const id = user.id;

		const friends = db.prepare(`
			SELECT users.id, users.login, users.email, users.alias, users.avatar
			FROM friends
			JOIN users ON users.id = friends.friend_id
			WHERE friends.user_id = ?
		`).all(id);

		return friends;
	});

}