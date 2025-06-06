import { FastifyInstance } from "fastify";
import db from '../db';
import bcrypt from 'bcrypt';
import { signToken } from '../utils/jwt';
import { authMiddleware } from '../middlewares/auth';
import { generate2FACode } from '../utils/2fa';
import path from 'path';
import fs from 'fs';

export default async function userRoutes(app: FastifyInstance)
{
	// Récupérer tous les utilisateurs
	app.get('/', async () => 
	{
		const users = db.prepare(`
			SELECT id, login, email, alias, avatar
			FROM users
		`).all();
		return users;
	});

	// Récupérer un utilisateur par ID
	app.get('/:id', async (req, reply) =>
	{
		const { id } = req.params as any;
		const user = db.prepare(`
			SELECT id, login, email, alias, avatar
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
			SELECT id, login, email, alias, avatar
			FROM users WHERE login = ?
		`).get(login);
	
		if (!user)
			return reply.status(404).send({ error: 'Utilisateur non trouvé' });
		return user;
	});

	// Ajouter un utilisateur
	app.post('/', async (req, reply) =>
	{
		const { login, email, password, alias, avatar } = req.body as any;

		// Champs obligatoires
		if (!login || !email || !password)
			return reply.status(400).send({ error: 'login, email et password sont requis' });

		try
		{
			const stmt = db.prepare(`
				INSERT INTO users (login, email, password, alias, avatar)
				VALUES (?, ?, ?, ?, ?)
			`);

			const hashedPassword = await bcrypt.hash(password, 10); // 10 = "salt rounds" (2^10 itération = 1024 retravaille du mdp)
			const result = stmt.run(login, email, hashedPassword, alias || null, avatar || null);
			
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
	app.put('/:id', { preHandler: authMiddleware }, async (req, reply) => {
	const { id } = req.params as any;
	const user = (req as any).user;

	if (parseInt(id) !== user.id)
		return reply.status(403).send({ error: "Accès interdit" });

	const { login, email, alias, avatar } = req.body as any;

	/*if (!login || !email)
		return reply.status(400).send({ error: 'login et email sont requis' });*/

	try {
		const stmt = db.prepare(`
			UPDATE users
			SET login = ?, email = ?, alias = ?, avatar = ?
			WHERE id = ?
		`);
		const result = stmt.run(login, email, alias || null, avatar || null, id);

		if (result.changes === 0)
			return reply.status(404).send({ error: 'Utilisateur non trouvé' });

		return { success: true };
	} catch (err: any) {
		console.error('Erreur lors de la mise à jour :', err);
		return reply.status(500).send({ error: 'Erreur interne', message: err.message });
	}
	});

	//changer le mot de passe utilisateur
	app.patch('/:id/password', { preHandler: authMiddleware }, async (req, reply) =>
	{
		const { id } = req.params as any;
		const user = (req as any).user;

		if (parseInt(id) !== user.id)
			return reply.status(403).send({ error: "Accès interdit" });

		const { newPassword } = req.body as any;
		const hashedPassword = await bcrypt.hash(newPassword, 10);

		if (!newPassword)
			return reply.status(400).send({ error: 'Le mot de passe est requis' });

		try
		{
			const stmt = db.prepare(`UPDATE users SET password = ? WHERE id = ?`);
			const result = stmt.run(hashedPassword, id);

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
	app.post('/auth', async (req, reply) =>
	{
		const { identifier, password, stayConnected } = req.body as {identifier: string; password: string; stayConnected: boolean};

		app.log.info(`Test2`); ///// <===== TEST LOG
		
		//req.log.info(`Test1`); ///// <===== TEST LOG

		app.log.info('User logged in'); // <=== Log de connection
		
		if (!identifier || !password)
			return reply.status(400).send({ error: 'Champs requis manquants' });

		try
		{
			const user = db.prepare('SELECT * FROM users WHERE email = ? OR login = ?').get(identifier, identifier) as { id: number; password: string; login: string; email: string; tfa_enabled: boolean };


			const validPassword = await bcrypt.compare(password, user.password);
			if (!user || !validPassword || (user.email !== identifier && user.login !== identifier))
				return reply.status(401).send({ error: 'Email ou mot de passe incorrect' });

			if (user.tfa_enabled) {
				const code = generate2FACode();
				const expires = Date.now() + 5 * 60 * 1000; // expire dans 5 min

				// On stocke le code et son expiration
				db.prepare(`UPDATE users SET tfa_code = ?, tfa_expires = ? WHERE id = ?`)
					.run(code, expires, user.id);

				// En dev : afficher dans les logs (dans le futur, envoi mail)
				console.log(`Code 2FA pour ${user.login} : ${code}`);

				return reply.send({
					success: true,
					step: '2fa_required',
					message: 'Un code 2FA a été envoyé à votre adresse e-mail. ',
					stayConnected: stayConnected ?? false,
				});
    		}

			const token = stayConnected ? signToken(user, '30d') : signToken(user); // par défaut 2h

			return { success: true, token, UserId: user.id, email: user.email, login: user.login };
		}
		catch (err: any)
		{
			console.error('Erreur lors de l\'authentification :', err);
			return reply.status(500).send({ error: 'Erreur interne', message: err.message });
		}

	});




	//Verification code 2FA pour la suite de l'authentification avec 2FA
	app.post('/auth/2fa', async (req, reply) => 
	{
		const { identifier, code, stayConnected} = req.body as { identifier: string; code: string; stayConnected: boolean};

		if (!identifier || !code)
			return reply.status(400).send({ error: 'Champs requis manquants' });

		const user = db.prepare(`SELECT id, login, email, tfa_code, tfa_expires FROM users WHERE email = ? OR login = ?`).get(identifier, identifier)as { id: number; login: string; email: string; tfa_code: string; tfa_expires: number };

		if (!user)
			return reply.status(401).send({ error: 'Utilisateur inconnu' });

		if (!user.tfa_code || Date.now() > user.tfa_expires)
			return reply.status(401).send({ error: 'Code 2FA expiré ou invalide' });

		if (user.tfa_code !== code)
			return reply.status(401).send({ error: 'Code 2FA incorrect' });

		// On supprime le code 2FA et on retourne le success et le token
		db.prepare(`UPDATE users SET tfa_code = NULL, tfa_expires = NULL WHERE id = ?`).run(user.id);

		const token = stayConnected ? signToken(user, '30d') : signToken(user); // par défaut 2h

		return { success: true,	token, UserId: user.id,	email: user.email, login: user.login };
	});


	// Supprimer un utilisateur
	app.delete('/:id', { preHandler: authMiddleware }, async (req, reply) =>
	{
		const { id } = req.params as any;
		const user = (req as any).user;

		if (parseInt(id) !== user.id)
			return reply.status(403).send({ error: "Accès interdit" });

		const stmt = db.prepare('DELETE FROM users WHERE id = ?');
		const result = stmt.run(id);

		if (result.changes === 0)
			return reply.status(404).send({ error: 'Utilisateur non trouvé' });
		return { success: true };
	});

	//supprimer tous les utilisateurs (SuperAdmin)
	//!!!!!!!!!!   Rajout de la vérification Admin nécessaire   !!!!!!!!!!!!
	app.delete('/', { preHandler: authMiddleware }, async (req, reply) =>
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

	//Permet de savoir id et le login de la personne connecter
	app.get('/me', { preHandler: authMiddleware }, async (req, reply) =>
	{
		const user = (req as any).user;
		return { id: user.id, login: user.login };
	});

	// Activer le 2FA pour l'utilisateur connecté
	app.post('/enable-2fa', { preHandler: authMiddleware }, async (req, reply) =>
	{
		const user = (req as any).user;

		try {
			const result = db.prepare(`UPDATE users SET tfa_enabled = 1 WHERE id = ?`).run(user.id);

			if (result.changes === 0)
				return reply.status(404).send({ error: 'Utilisateur non trouvé' });

			return { success: true, message: '2FA activé avec succès' };
		}
		catch (err: any) {
			console.error('Erreur lors de l’activation du 2FA :', err);
			return reply.status(500).send({ error: 'Erreur interne', message: err.message });
		}
	});

	// Ping de l'user (met à jour last_seen)
	app.get('/ping', { preHandler: [authMiddleware] }, async (req, reply) =>
	{
		const user = (req as any).user;
		try
		{
			const result = db.prepare(`UPDATE users SET last_seen = ? WHERE id = ?`).run(Date.now(), user.id);
			if (result.changes === 0)
				return reply.status(404).send({ error: 'Utilisateur non trouvé' });
			return { success: true };
		}
		catch (err: any)
		{
			console.error('Erreur lors du ping :', err);
			return reply.status(500).send({ error: 'Erreur interne', message: err.message });
		}
	});

	//Upload d'avatar
	app.post('/upload-avatar', { preHandler: authMiddleware }, async (req, reply) =>
	{
		const user = (req as any).user;
		const parts = req.parts();

		let uploaded = false;

		for await (const part of parts)
		{
			if (part.type === 'file')
			{
				const fileExt = path.extname(part.filename);
				const fileName = `avatar_${user.id}_${Date.now()}${fileExt}`;
				const uploadDir = path.resolve(process.cwd(), 'uploads/avatars');
				const uploadPath = path.join(uploadDir, fileName);

				// Crée le dossier si besoin
				fs.mkdirSync(uploadDir, { recursive: true });

				await new Promise((resolve, reject) =>
				{
					const stream = fs.createWriteStream(uploadPath);
					part.file.pipe(stream);
					part.file.on('end', resolve);
					part.file.on('error', reject);
				});

				// Sauvegarde le chemin relatif ou URL dans la DB
				db.prepare(`UPDATE users SET avatar = ? WHERE id = ?`).run(`/uploads/avatars/${fileName}`, user.id);

				uploaded = true;
				return reply.send({ success: true, url: `/uploads/avatars/${fileName}` });
			}
		}

		if (!uploaded)
			return reply.status(400).send({ error: 'Aucun fichier reçu' });
	});

}
