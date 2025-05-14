import { FastifyInstance } from "fastify";
import db from '../db';

export default async function userRoutes(app: FastifyInstance)
{
	// Récupérer tous les utilisateurs
	app.get('/', async () => 
	{
		const users = db.prepare(`
			SELECT id, login, email, alias, avatar, log_data
			FROM users
		`).all();
		return users;
	});

	// Récupérer un utilisateur par ID
	app.get('/:id', async (req, reply) =>
	{
		const { id } = req.params as any;
		const user = db.prepare(`
			SELECT id, login, email, alias, avatar, log_data
			FROM users WHERE id = ?
		`).get(id);

		if (!user)
			return reply.status(404).send({ error: 'Utilisateur non trouvé' });
		return user;
	});

	// Récupérer un utilisateur par login
	app.get('/by-login/:login', async (req, reply) =>
	{
		const { login } = req.params as any;
		const user = db.prepare(`
			SELECT id, login, email, alias, avatar, log_data
			FROM users WHERE login = ?
		`).get(login);
	
		if (!user)
			return reply.status(404).send({ error: 'Utilisateur non trouvé' });
		return user;
	});

	// Ajouter un utilisateur
	app.post('/', async (req, reply) =>
	{
		const { login, email, password, alias, avatar, log_data } = req.body as any;

		// Champs obligatoires
		if (!login || !email || !password)
			return reply.status(400).send({ error: 'login, email et password sont requis' });

		try
		{
			const stmt = db.prepare(`
				INSERT INTO users (login, email, password, alias, avatar, log_data)
				VALUES (?, ?, ?, ?, ?, ?)
			`);

			const result = stmt.run(login, email, password, alias || null, avatar || null, log_data || null);
			return { success: true, id: result.lastInsertRowid };
		}
		catch (err: any)
		{
			if (err.code === 'SQLITE_CONSTRAINT_UNIQUE')
				return reply.status(409).send({ error: 'login ou email déjà utilisé' });
			return reply.status(500).send({ error: 'Erreur interne', message: err.message });
		}
	});

	//Met a jour les infos utilisateur
	app.put('/:id', async (req, reply) =>
	{
		const { id } = req.params as any;
		const { login, email, password, alias, avatar, log_data} = req.body as any;

		if (!login || !email || !password)
			return reply.status(400).send({error: 'Champs requis manquants' });

		try
		{
			const stmt = db.prepare(`UPDATE users SET login = ?, email = ?, password = ?, alias = ?, avatar = ?, log_data = ? WHERE id = ?`);
			const result = stmt.run(login, email, password, alias || null, avatar || null, log_data || null, id);

			if (result.changes === 0)
				return reply.status(404).send({ error: 'Utilisateur non trouvé' });

			return { success: true };
		}
		catch (err: any)
		{
			console.error('Erreur lors de la mise a jour :', err);
			return reply.status(500).send({ error: 'Erreur interne', message: err.message });
		}
	});

	//changer le mot de passe utilisateur
	app.patch('/:id/password', async (req, reply) =>
	{
		const { id } = req.params as any;
		const { newPassword } = req.body as any;

		if (!newPassword)
			return reply.status(400).send({ error: 'Le mot de passe est requis' });

		try
		{
			const stmt = db.prepare(`UPDATE users SET password = ? WHERE = ?`);
			const result = stmt.run(newPassword, id);

			if (result.changes === 0)
				return reply.status(404).send({ error: 'Utilisateur non trouvé' });
		}
		catch (err: any)
		{
			console.error('Erreur lors de la mise a jour du mot de passe :', err);
			return reply.status(500).send({ error: 'Erreur interne', message: err.message });
		}
	});

	//Authentification de l'utilisateur
	app.post('/:login', async (req, reply) =>
	{
		const { email, password } = req.body as any;

		if (!email || !password)
			return reply.status(400).send({ error: 'Champs requis manquents' });

		try
		{
			const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as { id: number; password: string; };

			if (!user || user.password !== password)
				return reply.status(401).send({ error: 'Email ou mot de passe incorrect' });

			return { success: true, UserId: user.id };
		}
		catch (err: any)
		{
			console.error('Erreur lors de l\'authentification :', err);
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
		return { success: true };
	});

	//supprimer tous les utilisateurs (SuperAdmin)
	app.delete('/', async (req, reply) =>
	{
		try
		{
			db.prepare('DELETE FROM users').run();
			return { success: true, message: 'Tous les utilisateurs ont été supprimer' };
		}
		catch (err: any)
		{
			console.error('Erreur lors de la suppression des utilisateurs :', err);
			return reply.status(500).send({ error: 'Erreur interne', message: err.message });
		}
	});
}
