import { FastifyInstance } from "fastify";
import db from '../db';

export default async function userRoutes(app: FastifyInstance)
{
	// Récupérer tous les utilisateurs
	app.get('/', async () => 
	{
		const users = db.prepare('SELECT id, username, email FROM users').all();
		return users;
	});

	// Récupérer un utilisateur par ID
	app.get('/:id', async (req, reply) =>
	{
		const { id } = req.params as any;
		const user = db.prepare('SELECT id, username, email FROM users WHERE id = ?').get(id);
		if (!user)
			return reply.status(404).send({error: 'Utilisateur non trouvé'});
		return user;
	});

	// Ajouter un utilisateur
	app.post('/', async (req, reply) =>
	{
		const { username, email/*, password*/ } = req.body as any;

		if (!username || !email/* || !password*/)
			return reply.status(400).send({ error: 'Champs requis manquants' });

		try
		{
			//const stmt = db.prepare(`INSERT INTO users (username, email, password) VALUES (?, ?, ?)`);
			const stmt = db.prepare(`INSERT INTO users (username, email) VALUES (?, ?)`);
			const result = stmt.run(username, email/*, password*/);
			return { success: true, id: result.lastInsertRowid };
		}
		catch (err: any)
		{
			if (err.code === 'SQLITE_CONSTRAINT_UNIQUE')
				return reply.status(409).send({ error: 'Nom d’utilisateur déja pris' });
			return reply.status(500).send({ error: 'Erreur interne', message: err.message });
		}
	});

	// Supprimer un utilisateur
	app.delete('/:id', async (req, reply) =>
	{
		const { id } = req.params as any;
		const stmt = db.prepare('DELETE FROM users WHERE id = ?');
		const result = stmt.run(id);

		if (result.changes === 0)
			return reply.status(404).send({ error: 'Utilisateur non trouvé' });
		return { success: true};
	});
}