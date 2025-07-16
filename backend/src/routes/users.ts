import { FastifyInstance } from "fastify";
import db from '../db';
import bcrypt from 'bcrypt';
import { signToken } from '../utils/jwt';
import { authMiddleware } from '../middlewares/auth';
import { generate2FACode } from '../utils/2fa';
import path from 'path';
import fs from 'fs';
import { FastifyRequest } from "fastify";
import nodemailer from 'nodemailer';
import { AuthUser, Match, Friend } from '../types/interfaces';
import crypto from "crypto";

type AuthenticatedRequest = FastifyRequest & { user: AuthUser };

// Crée un transporteur SMTP de test (Ethereal)
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: process.env.ETHEREAL_USER,
        pass: process.env.ETHEREAL_PASS
    }
});

export default async function userRoutes(app: FastifyInstance)
{
	// Récupérer tous les utilisateurs
	app.get('/', async () => 
	{
		const users = db.prepare(`
			SELECT id, login, alias, avatar, last_seen
			FROM users
		`).all() as { id: number, login: string, alias: string, avatar: string, last_seen: number }[];
		return users;
	});

	// Récupérer un utilisateur par ID
	app.get('/:id', async (req, reply) =>
	{
		const { id } = req.params as { id: number };
		const user = db.prepare(`
			SELECT id, login, alias, avatar, last_seen
			FROM users WHERE id = ?
		`).get(id) as { id: number, login: string, alias: string, avatar: string, last_seen: number };

		if (!user)
			return reply.status(404).send({ error: 'Utilisateur non trouvé' });
		return user;
	});

	// Récupérer un utilisateur par login
	app.get('/by-login/:login', async (req, reply) =>
	{
		const { login } = req.params as { login: string };
		const user = db.prepare(`
			SELECT id, login, alias, avatar, last_seen
			FROM users WHERE login = ?
		`).get(login) as { id:number, login: string, alias: string, avatar: string, last_seen: number};
	
		if (!user)
			return reply.status(404).send({ error: 'Utilisateur non trouvé' });
		return user;
	});

	// Ajouter un utilisateur
	app.post('/', { config: { rateLimit: { max: 20/* 5 tentatives*/, timeWindow: '1 minute' } }}, async (req, reply) =>
	{
		const { login, email, password, alias, avatar } = req.body as { login: string, email: string, password: string, alias: string, avatar: string};

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
	app.put('/me', { preHandler: authMiddleware }, async (req, reply) =>
	{
		const user = (req as AuthenticatedRequest).user;

		const { login, email, alias, avatar } = req.body as { login: string, email: string, alias: string, avatar: string};

		try
		{
			const stmt = db.prepare(`
				UPDATE users
				SET login = ?, email = ?, alias = ?, avatar = ?
				WHERE id = ?
			`);
			const result = stmt.run(login, email, alias || null, avatar || null, user.id);

			if (result.changes === 0)
				return reply.status(404).send({ error: 'Utilisateur non trouvé' });

			return { success: true };
		}
		catch (err: any)
		{
			console.error('Erreur lors de la mise à jour :', err);
			return reply.status(500).send({ error: 'Erreur interne', message: err.message });
		}
	});

	//changer le mot de passe utilisateur
	app.patch('/me/password', { preHandler: authMiddleware, config: { rateLimit: { max: 5/* 5 tentatives*/, timeWindow: '1 minute' } }}, async (req, reply) =>
	{
		const user = (req as AuthenticatedRequest).user;

		const { newPassword } = req.body as { newPassword: string };
		const hashedPassword = await bcrypt.hash(newPassword, 10);

		if (!newPassword)
			return reply.status(400).send({ error: 'Le mot de passe est requis' });

		try
		{
			const stmt = db.prepare(`UPDATE users SET password = ? WHERE id = ?`);
			const result = stmt.run(hashedPassword, user.id);

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
	app.post('/auth', { config: { rateLimit: { max: 5/* 5 tentatives*/, timeWindow: '1 minute' } }}, async (req, reply) =>
	{
		const { identifier, password, stayConnected, matchDuration } = req.body as {identifier: string; password: string; stayConnected: boolean, matchDuration?: number};

		app.log.info(`Test2`); ///// <===== TEST LOG
		
		//req.log.info(`Test1`); ///// <===== TEST LOG

		app.log.info('User logged in'); // <=== Log de connection
		
		if (!identifier || !password)
			return reply.status(400).send({ error: 'Champs requis manquants' });

		try
		{
			const user = db.prepare('SELECT * FROM users WHERE email = ? OR login = ?').get(identifier, identifier) as { id: number; password: string; login: string; email: string; tfa_enabled: boolean; alias: string; avatar: string };

			if (!user)
        		return reply.status(401).send({ error: 'Email ou mot de passe incorrect' });

			const validPassword = await bcrypt.compare(password, user.password);
			if (!validPassword || (user.email !== identifier && user.login !== identifier))
				return reply.status(401).send({ error: 'Email ou mot de passe incorrect' });

			if (user.tfa_enabled) {
				const code = generate2FACode();
				const hashedCode = await bcrypt.hash(code, 10);
				const expires = Date.now() + 5 * 60 * 1000; // expire dans 5 min

				// On stocke le code et son expiration
				db.prepare(`UPDATE users SET tfa_code = ?, tfa_expires = ? WHERE id = ?`)
					.run(hashedCode, expires, user.id);
				
				// Envoie le mail
				await transporter.sendMail({
					from: '"ft_transcendence" <no-reply@ft_transcendence.local>',
					to: user.email,
					subject: 'Votre code 2FA',
					text: `Votre code 2FA est : ${code}`
				});

				return reply.send({
					success: true,
					step: '2fa_required',
					identifier,
					message: 'Un code 2FA a été envoyé à votre adresse e-mail. ',
					stayConnected: stayConnected ?? false,
				});
    		}

			let token: string;
			if (matchDuration)
				token = signToken(user, `${matchDuration + 10}s`); // ex: si le match dure 2 minute rentrer 120s
			else
				token = stayConnected ? signToken(user, '30d') : signToken(user); // par défaut 2h

			return { success: true, token, UserId: user.id, email: user.email, login: user.login, alias: user.alias, avatar: user.avatar };
		}
		catch (err: any)
		{
			console.error('Erreur lors de l\'authentification :', err);
			return reply.status(500).send({ error: 'Erreur interne', message: err.message });
		}

	});




	//Verification code 2FA pour la suite de l'authentification avec 2FA
	app.post('/auth/2fa', { config: { rateLimit: { max: 5/* 5 tentatives*/, timeWindow: '1 minute' } }}, async (req, reply) => 
	{
		const { identifier, code, stayConnected} = req.body as { identifier: string; code: string; stayConnected: boolean};

		if (!identifier || !code)
			return reply.status(400).send({ error: 'Champs requis manquants' });

		const user = db.prepare(`SELECT * FROM users WHERE email = ? OR login = ?`).get(identifier, identifier)as { id: number; login: string; email: string; tfa_code: string; tfa_expires: number; alias: string; avatar: string };

		if (!user)
			return reply.status(401).send({ error: 'Utilisateur inconnu' });

		if (!user.tfa_code || Date.now() > user.tfa_expires)
			return reply.status(401).send({ error: 'Code 2FA expiré ou invalide' });

		const isValid = await bcrypt.compare(code, user.tfa_code);
		if (!isValid)
			return reply.status(401).send({ error: 'Code 2FA incorrect' });

		// On supprime le code 2FA et on retourne le success et le token
		db.prepare(`UPDATE users SET tfa_code = NULL, tfa_expires = NULL WHERE id = ?`).run(user.id);

		const token = stayConnected ? signToken(user, '30d') : signToken(user); // par défaut 2h

		return { success: true,	token, UserId: user.id,	email: user.email, login: user.login, alias: user.alias, avatar: user.avatar };
	});


	// Supprimer un utilisateur
	app.delete('/me', { preHandler: authMiddleware }, async (req, reply) =>
	{
		const user = (req as AuthenticatedRequest).user;

		const userData = db.prepare('SELECT avatar FROM users WHERE id = ?').get(user.id) as { avatar: string | null };
		if (userData?.avatar && userData.avatar.startsWith('http://localhost:3000/uploads/avatars/'))
		{
			const oldPath = path.resolve(process.cwd(), '.' + userData.avatar.replace('http://localhost:3000', ''));
			try
			{
				if (fs.existsSync(oldPath))
                    fs.unlinkSync(oldPath);
			}
			catch (e)
			{
				if (e instanceof Error)
					console.warn('Avatar non trouvé ou déjà supprimé:', e.message);
				else
					console.warn('Avatar non trouvé ou déjà supprimé:', e);
			}
		}
		
		const stmt2 = db.prepare('DELETE FROM matchs WHERE user1_id = ? OR user2_id = ?');
		stmt2.run(user.id, user.id);

		const stmt3 = db.prepare('DELETE FROM friends WHERE user_id = ? OR friend_id = ?');
		stmt3.run(user.id, user.id);

		const stmt = db.prepare('DELETE FROM users WHERE id = ?');
		const result = stmt.run(user.id);

		if (result.changes === 0)
			return reply.status(404).send({ error: 'Utilisateur non trouvé' });
		return { success: true };
	});

	//Permet de savoir id et le login de la personne connecter
	app.get('/me', { preHandler: authMiddleware }, async (req, reply) =>
	{
		const user = (req as AuthenticatedRequest).user;
		const data = db.prepare(`SELECT id, login, tfa_enabled FROM users WHERE id = ?`).get(user.id) as { id: number, login: string, tfa_enable: boolean};
		return data;
	});

	//Permet de récupérer ses infos
	app.get('/profil', { preHandler: authMiddleware }, async (req, reply) =>
	{
		const user = (req as AuthenticatedRequest).user;

		const data = db.prepare(`SELECT id, login, email, alias, avatar, tfa_enabled FROM users WHERE id = ?`).get(user.id) as { id:number, login: string, email: string, alias: string, avatar: string, tfa_enable: boolean };
		return data;
	});

	// Activer le 2FA pour l'utilisateur connecté
	app.post('/enable-2fa', { preHandler: authMiddleware }, async (req, reply) =>
	{
		const user = (req as AuthenticatedRequest).user;

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

	// Désactiver le 2FA pour l'utilisateur connecté
    app.post('/disable-2fa', { preHandler: authMiddleware }, async (req, reply) =>
    {
        const user = (req as AuthenticatedRequest).user;

        try {
            const result = db.prepare(`UPDATE users SET tfa_enabled = 0, tfa_code = NULL, tfa_expires = NULL WHERE id = ?`).run(user.id);

            if (result.changes === 0)
                return reply.status(404).send({ error: 'Utilisateur non trouvé' });

            return { success: true, message: '2FA désactivé avec succès' };
        }
        catch (err: any) {
            console.error('Erreur lors de la désactivation du 2FA :', err);
            return reply.status(500).send({ error: 'Erreur interne', message: err.message });
        }
    });

	// Ping de l'user (met à jour last_seen)
	app.put('/ping', { preHandler: authMiddleware }, async (req, reply) =>
	{
		const user = (req as AuthenticatedRequest).user;
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
		const user = (req as AuthenticatedRequest).user;
		const parts = req.parts();

		let uploaded = false;
		const userData = db.prepare('SELECT avatar FROM users WHERE id = ?').get(user.id) as { avatar: string | null };

		for await (const part of parts)
		{
			if (part.type === 'file')
			{
				const fileExt = path.extname(part.filename);
				const fileName = `avatar_${user.id}_${Date.now()}${fileExt}`;
				const uploadDir = path.resolve(process.cwd(), 'uploads/avatars');
				const uploadPath = path.join(uploadDir, fileName);
				const avatarPath = `/uploads/avatars/${fileName}`;

				//Suprime l'ancien avatar si existant
				if (userData?.avatar && userData.avatar.startsWith('/uploads/avatars/'))
				{
                	const oldPath = path.resolve(process.cwd(), '.' + userData.avatar);
                	try
					{
						if (fs.existsSync(oldPath))
							fs.unlinkSync(oldPath);
                	}
					catch (e)
					{
                    	console.warn('Impossible de supprimer l\'ancien avatar :', e);
                	}
            }

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
				db.prepare(`UPDATE users SET avatar = ? WHERE id = ?`).run(avatarPath, user.id);

				uploaded = true;
				return reply.send({ success: true, url: avatarPath });
			}
		}

		if (!uploaded)
			return reply.status(400).send({ error: 'Aucun fichier reçu' });
	});

	//Reset d'avatar
	app.post('/reset-avatar', { preHandler: authMiddleware }, async (req, reply) =>
	{
		const user = (req as AuthenticatedRequest).user;

		const userData = db.prepare('SELECT avatar FROM users WHERE id = ?').get(user.id) as { avatar: string | null };

		//Suprime l'ancien avatar si existant
		if (userData?.avatar && userData.avatar.startsWith('/uploads/avatars/'))
		{
        	const oldPath = path.resolve(process.cwd(), '.' + userData.avatar);
        	try
			{
				if (fs.existsSync(oldPath))
					fs.unlinkSync(oldPath);
        	}
			catch (e)
			{
            	console.warn('Impossible de supprimer l\'ancien avatar :', e);
        	}
        }

		// Sauvegarde le chemin relatif ou URL dans la DB
		db.prepare(`UPDATE users SET avatar = NULL WHERE id = ?`).run(user.id);

		return { success: true };
	});

	//Exporter ses propre données
	app.get('/me/export', { preHandler: authMiddleware }, async (req, reply) =>
	{
		const user = (req as AuthenticatedRequest).user;

		// Récupère les infos utilisateur
		const userData = db.prepare('SELECT id, login, email, alias, avatar, last_seen FROM users WHERE id = ?').get(user.id) as { id: number, login: string, email: string, alias: string, avatar: string, last_seen: number };

		// Récupère les matchs
		const matchs = db.prepare('SELECT * FROM matchs WHERE user1_id = ? OR user2_id = ?').all(user.id, user.id) as Match[];

		// Récupère les amis
		const friends = db.prepare('SELECT * FROM friends WHERE user_id = ? OR friend_id = ?').all(user.id, user.id) as Friend[];

		return {
			user: userData,
			matchs,
			friends
		};
	});

	//Anonymisation
	app.post('/me/anonymize', { preHandler: authMiddleware }, async (req, reply) =>
	{
		const user = (req as AuthenticatedRequest).user;

		try
		{
			const anonymLogin = `anonyme_${user.id}`;
			const anonymEmail = `anonyme_${user.id}@example.com`;
			const randomPassword = await bcrypt.hash(Math.random().toString(36), 10);

			const userData = db.prepare('SELECT avatar FROM users WHERE id = ?').get(user.id) as { avatar: string | null };
        	if (userData?.avatar && userData.avatar.startsWith('http://localhost:3000/uploads/avatars/'))
			{
            	const oldPath = path.resolve(process.cwd(), '.' + userData.avatar.replace('http://localhost:3000', ''));
            	try
				{
                	if (fs.existsSync(oldPath))
						fs.unlinkSync(oldPath);
            	} catch (e)
				{
                	console.warn('Avatar non trouvé ou déjà supprimé:', e);
            	}
        	}

			db.prepare(`UPDATE users SET login = ?, email = ?, alias = NULL, avatar = NULL, password = ? WHERE id = ?`).run(anonymLogin, anonymEmail, randomPassword, user.id);

			return {success: true };
		}
		catch (err: any)
		{
			console.error('Erreur lors de l\'anonymisation :', err);
			return reply.status(500).send({ error: 'Erreur interne', message: err.message });
		}
	});

	//Mot de passe oublié
	app.post('/forgot-password', async (req, reply) =>
	{
		const { email } = req.body as { email: string };
		if (!email)
        	return reply.status(400).send({ error: "Email requis" });

		// Vérifie si l'utilisateur existe
		const user = db.prepare('SELECT id, email FROM users WHERE email = ?').get(email) as { id: number, email: string } | undefined;
		if (!user)
			return reply.status(200).send({ success: true });

		// Génère un token sécurisé
		const resetToken = crypto.randomBytes(32).toString('hex');
		const expires = Date.now() + 1000 * 60 * 15; // 15 minutes

		// Stocke le token et l'expiration
		db.prepare('UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?').run(resetToken, expires, user.id);

		// Envoie l'email avec le lien de réinitialisation
		const resetUrl = `https://localhost:8443/reset-password?token=${resetToken}`;
		await transporter.sendMail({
			from: '"ft_transcendence" <no-reply@ft_transcendence.local>',
			to: user.email,
			subject: 'Réinitialisation de votre mot de passe',
			text: `Pour réinitialiser votre mot de passe, cliquez sur ce lien : ${resetUrl} (valable 15 minutes)`
		});

    	return { success: true };
	});

	//Maj du mot de passe oublié
	app.post('/reset-password', async (req, reply) => {
		const { token, newPassword } = req.body as { token: string, newPassword: string };
		if (!token || !newPassword)
			return reply.status(400).send({ error: "Token et nouveau mot de passe requis" });

		// Vérifie le token
		const user = db.prepare('SELECT id, reset_expires FROM users WHERE reset_token = ?').get(token) as { id: number, reset_expires: number } | undefined;
		if (!user || !user.reset_expires || user.reset_expires < Date.now())
			return reply.status(400).send({ error: "Token invalide ou expiré" });

		// Met à jour le mot de passe
		const hashedPassword = await bcrypt.hash(newPassword, 10);
		db.prepare('UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?').run(hashedPassword, user.id);

		return { success: true };
	});
}
