import { FastifyRequest, FastifyReply } from 'fastify';
import i18next from '../i18n/i18n';

export function langMiddleware(req: FastifyRequest, reply: FastifyReply, done: () => void) {
	const lang = (req.headers['accept-language'] as string) || 'fr';
	i18next.changeLanguage(lang);
}