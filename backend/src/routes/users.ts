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
import i18next from '../i18n/i18n';
import { langMiddleware } from '../middlewares/lang';

type AuthenticatedRequest = FastifyRequest & { user: AuthUser };

//-----------BREVO POUR VRAI MAIL (PENSER A MODIF DB.TS (VOIR COMMENTAIRE))-------------//
// Crée un transporteur SMTP de test (Brevo)
/*const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    auth: {
        user: process.env.BREVO_USER,
        pass: process.env.BREVO_PASS
    }
});*/

// Crée un transporteur SMTP de test (Ethereal) A REMPLACER PAR BREVO POUR VERSION FINAL
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
	app.addHook('preHandler', langMiddleware);

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
			return reply.status(404).send({ error: i18next.t("user_not_found") });
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
			return reply.status(404).send({ error: i18next.t("user_not_found") });
		return user;
	});

	// Ajouter un utilisateur
	app.post('/', { config: { rateLimit: { max: 20/* 5 tentatives*/, timeWindow: '1 minute' } }}, async (req, reply) =>
	{
		const { login, email, password, alias, avatar } = req.body as { login: string, email: string, password: string, alias: string, avatar: string};

		// Champs obligatoires
		if (!login || !email || !password)
			return reply.status(400).send({ error: i18next.t("login_email_password_required") });

		try
		{
			const stmt = db.prepare(`
				INSERT INTO users (login, email, password, alias, avatar)
				VALUES (?, ?, ?, ?, ?)
			`);

			const hashedPassword = await bcrypt.hash(password, 10); // 10 = "salt rounds" (2^10 itération = 1024 retravaille du mdp)
			const result = stmt.run(login, email, hashedPassword, alias || null, avatar || null);
			
			// Envoi de l'email de vérification
			const verifyToken = crypto.randomBytes(32).toString('hex');
			const expires = Date.now() + 1000 * 60 * 30; // 30 min

			db.prepare('UPDATE users SET email_verify_token = ?, email_verify_expires = ? WHERE id = ?')
			  .run(verifyToken, expires, result.lastInsertRowid);

			const verifyUrl = `https://localhost:8443/verify-email?token=${verifyToken}`;
			await transporter.sendMail({
			  from: '"ft_transcendence" <no-reply@ft_transcendence.local>',
			  to: email,
			  subject: i18next.t("verify_email_subject"),
			  text: i18next.t("verify_email_text", { url: verifyUrl })
			});

			return { success: true, id: result.lastInsertRowid };
		}
		catch (err: any)
		{
			if (err.code === 'SQLITE_CONSTRAINT_UNIQUE')
				return reply.status(409).send({ error: i18next.t("login_or_email_taken") });
			return reply.status(500).send({ error: i18next.t("internal_error"), message: err.message });
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
				return reply.status(404).send({ error: i18next.t("user_not_found") });

			// Envoi de l'email de vérification
			if (email && email !== user.email) {
				const verifyToken = crypto.randomBytes(32).toString('hex');
				const expires = Date.now() + 1000 * 60 * 30;
				db.prepare('UPDATE users SET email_verified = 0, email_verify_token = ?, email_verify_expires = ? WHERE id = ?')
				  .run(verifyToken, expires, user.id);

				const verifyUrl = `https://localhost:8443/verify-email?token=${verifyToken}`;
				await transporter.sendMail({
				  from: '"ft_transcendence" <no-reply@ft_transcendence.local>',
				  to: email,
				  subject: i18next.t("verify_new_email_subject"),
				  text: i18next.t("verify_new_email_text", { url: verifyUrl })
				});
			}
			return { success: true };
		}
		catch (err: any)
		{
			console.error('Erreur lors de la mise à jour :', err);
			return reply.status(500).send({ error: i18next.t("internal_error"), message: err.message });
		}
	});

	//changer le mot de passe utilisateur
	app.patch('/me/password', { preHandler: authMiddleware, config: { rateLimit: { max: 5/* 5 tentatives*/, timeWindow: '1 minute' } }}, async (req, reply) =>
	{
		const user = (req as AuthenticatedRequest).user;

		const { oldPassword, newPassword } = req.body as { oldPassword: string, newPassword: string };
		const hashedPassword = await bcrypt.hash(newPassword, 10);

		if (!newPassword || !oldPassword)
			return reply.status(400).send({ error: i18next.t("password_required") });

		try
		{
			const userPass = db.prepare('SELECT password FROM users WHERE email = ? OR login = ?').get(user.email, user.login) as { password: string; };
			const validPassword = await bcrypt.compare(oldPassword, userPass.password);
			if (!validPassword)
				return reply.status(400).send({ error: i18next.t("old_password_incorrect") });
			const stmt = db.prepare(`UPDATE users SET password = ? WHERE id = ?`);
			const result = stmt.run(hashedPassword, user.id);

			if (result.changes === 0)
				return reply.status(404).send({ error: i18next.t("user_not_found") });
			return { success: true };
		}
		catch (err: any)
		{
			console.error('Erreur lors de la mise a jour du mot de passe :', err);
			return reply.status(500).send({ error: i18next.t("internal_error"), message: err.message });
		}
	});

	//Authentification de l'utilisateur
	app.post('/auth', { config: { rateLimit: { max: 5/* 5 tentatives*/, timeWindow: '1 minute' } }}, async (req, reply) =>
	{
		const { identifier, password, stayConnected, matchDuration } = req.body as {identifier: string; password: string; stayConnected: boolean, matchDuration?: number};

		app.log.info('User logged in'); // <=== Log de connection
		
		if (!identifier || !password)
			return reply.status(400).send({ error: i18next.t("fields_required") });

		try
		{
			const user = db.prepare('SELECT * FROM users WHERE email = ? OR login = ?').get(identifier, identifier) as { id: number; password: string; login: string; email: string; tfa_enabled: boolean; alias: string; avatar: string; email_verified: number };

			if (!user)
        		return reply.status(401).send({ error: i18next.t("email_or_password_incorrect") });

			/*if (user.email_verified == 0)
				return reply.status(401).send({ error: i18next.t("email_not_verified"), step: "email_not_verified" });*/

			const validPassword = await bcrypt.compare(password, user.password);
			if (!validPassword || (user.email !== identifier && user.login !== identifier))
				return reply.status(401).send({ error: i18next.t("email_or_password_incorrect") });

			if (user.tfa_enabled) {
				const code = generate2FACode();
				const hashedCode = await bcrypt.hash(code, 10);
				const expires = Date.now() + 5 * 60 * 1000; // expire dans 5 min

				// On stocke le code et son expiration
				db.prepare(`UPDATE users SET tfa_code = ?, tfa_expires = ? WHERE id = ?`)
					.run(hashedCode, expires, user.id);
				
				// Envoie le mail
				await transporter.sendMail({
					//-----------VRAI MAIL------------//
					//from: '"ft_transcendence" <SainteDataBase@outlook.fr>',
					//---------FAUX MAIL AVEC ETHEREAL (TEST)-----------------//
					from: '"ft_transcendence" <no-reply@ft_transcendence.local>',
					to: user.email,
					subject: i18next.t("2fa_subject"),
					text: i18next.t("2fa_text", { code })
				});

				return reply.send({
					success: true,
					step: '2fa_required',
					identifier,
					message: i18next.t("2fa_sent"),
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
			return reply.status(500).send({ error: i18next.t("internal_error"), message: err.message });
		}

	});

	//Vérif de l'email
	app.get('/verify-email', async (req, reply) =>
	{
		const { token } = req.query as { token: string };
		if (!token)
			return reply.status(400).send({ error: i18next.t("token_required") });

		const user = db.prepare('SELECT id, email_verify_expires FROM users WHERE email_verify_token = ?').get(token) as { id: number, email_verify_expires: number } | undefined;
		if (!user || !user.email_verify_expires || user.email_verify_expires < Date.now())
			return reply.status(400).send({ error: i18next.t("token_invalid_or_expired") });

		db.prepare('UPDATE users SET email_verified = 1, email_verify_token = NULL, email_verify_expires = NULL WHERE id = ?').run(user.id);

		return { success: true, message: i18next.t("email_verified") };
	});

	//renvoie de l'email de verification
	app.post('/resend-verification', async (req, reply) =>
	{
		const { email } = req.body as { email: string };
		const user = db.prepare('SELECT id, email_verified FROM users WHERE email = ?').get(email) as { id: number, email_verified: number } | undefined;
		if (!user)
			return reply.status(404).send({ error: i18next.t("user_not_found") });
		if (user.email_verified === 1)
			return reply.status(400).send({ error: i18next.t("email_already_verified") });

		const verifyToken = crypto.randomBytes(32).toString('hex');
		const expires = Date.now() + 1000 * 60 * 30;
		db.prepare('UPDATE users SET email_verify_token = ?, email_verify_expires = ? WHERE id = ?')
			.run(verifyToken, expires, user.id);

		const verifyUrl = `https://localhost:8443/verify-email?token=${verifyToken}`;
		await transporter.sendMail(
		{
			from: '"ft_transcendence" <no-reply@ft_transcendence.local>',
			to: email,
			subject: i18next.t("verify_email_subject"),
			text: i18next.t("verify_email_text", { url: verifyUrl })
		});

	return { success: true, message: i18next.t("verification_email_resent") };
	});

	//Verification code 2FA pour la suite de l'authentification avec 2FA
	app.post('/auth/2fa', { config: { rateLimit: { max: 5/* 5 tentatives*/, timeWindow: '1 minute' } }}, async (req, reply) => 
	{
		const { identifier, code, stayConnected} = req.body as { identifier: string; code: string; stayConnected: boolean};

		if (!identifier || !code)
			return reply.status(400).send({ error: i18next.t("fields_required") });

		const user = db.prepare(`SELECT * FROM users WHERE email = ? OR login = ?`).get(identifier, identifier)as { id: number; login: string; email: string; tfa_code: string; tfa_expires: number; alias: string; avatar: string };

		if (!user)
			return reply.status(401).send({ error: i18next.t("user_unknown") });

		if (!user.tfa_code || Date.now() > user.tfa_expires)
			return reply.status(401).send({ error: i18next.t("2fa_expired_or_invalid") });

		const isValid = await bcrypt.compare(code, user.tfa_code);
		if (!isValid)
			return reply.status(401).send({ error: i18next.t("2fa_incorrect") });

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
			return reply.status(404).send({ error: i18next.t("user_not_found") });
		return { success: true };
	});

	//Permet de savoir id et le login de la personne connecter
	app.get('/me', { preHandler: authMiddleware }, async (req, reply) =>
	{
		const user = (req as AuthenticatedRequest).user;
		const data = db.prepare(`SELECT id, login, tfa_enabled FROM users WHERE id = ?`).get(user.id) as { id: number, login: string, tfa_enable: boolean};
		return data;
	});

	//Permet de récupérer ses propres infos
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
				return reply.status(404).send({ error: i18next.t("user_not_found") });

			return { success: true, message: i18next.t("2fa_enabled") };
		}
		catch (err: any) {
			console.error('Erreur lors de l’activation du 2FA :', err);
			return reply.status(500).send({ error: i18next.t("internal_error"), message: err.message });
		}
	});

	// Désactiver le 2FA pour l'utilisateur connecté
    app.post('/disable-2fa', { preHandler: authMiddleware }, async (req, reply) =>
    {
        const user = (req as AuthenticatedRequest).user;

        try {
            const result = db.prepare(`UPDATE users SET tfa_enabled = 0, tfa_code = NULL, tfa_expires = NULL WHERE id = ?`).run(user.id);

            if (result.changes === 0)
                return reply.status(404).send({ error: i18next.t("user_not_found") });

            return { success: true, message: i18next.t("2fa_disabled") };
        }
        catch (err: any) {
            console.error('Erreur lors de la désactivation du 2FA :', err);
            return reply.status(500).send({ error: i18next.t("internal_error"), message: err.message });
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
				return reply.status(404).send({ error: i18next.t("user_not_found") });
			return { success: true };
		}
		catch (err: any)
		{
			console.error('Erreur lors du ping :', err);
			return reply.status(500).send({ error: i18next.t("internal_error"), message: err.message });
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
			return reply.status(400).send({ error: i18next.t("no_file_received") });
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
			return reply.status(500).send({ error: i18next.t("internal_error"), message: err.message });
		}
	});

	//Mot de passe oublié
	app.post('/forgot-password', async (req, reply) =>
	{
		const { email } = req.body as { email: string };
		if (!email)
        	return reply.status(400).send({ error: i18next.t("email_required") });

		try
		{
			// Vérifie si l'utilisateur existe
			const user = db.prepare('SELECT id, email FROM users WHERE email = ?').get(email) as { id: number, email: string } | undefined;
			if (!user)
				return reply.status(200).send({ error: i18next.t("user_unknown") });

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
				subject: i18next.t("reset_email_subject"),
				text: i18next.t("reset_email_text", { url: resetUrl })
			});

			return { success: true };
		}
		catch(err: any)
		{
			return reply.status(500).send({ error: i18next.t("internal_error"), message: err.message });
		}
	});

	//Maj du mot de passe oublié
	app.post('/reset-password', async (req, reply) => {
		const { token, newPassword } = req.body as { token: string, newPassword: string };
		if (!token || !newPassword)
			return reply.status(400).send({ error: i18next.t("Token_password_required") });

		try
		{
			// Vérifie le token
			const user = db.prepare('SELECT id, reset_expires FROM users WHERE reset_token = ?').get(token) as { id: number, reset_expires: number } | undefined;
			if (!user || !user.reset_expires || user.reset_expires < Date.now())
				return reply.status(400).send({ error: i18next.t("token_invalid_or_expired") });

			// Met à jour le mot de passe
			const hashedPassword = await bcrypt.hash(newPassword, 10);
			db.prepare('UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?').run(hashedPassword, user.id);

			return { success: true };
		}
		catch(err: any)
		{
			return reply.status(500).send({ error: i18next.t("internal_error"), message: err.message });
		}
	});
}
