import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const secret = process.env.JWT_SECRET as string;

// Type exact compatible avec jsonwebtoken v9 pour expiresIn
type JwtExpire = `${number}${"s" | "m" | "h" | "d" | "y"}`;

export function signToken(payload: object, expiresIn: JwtExpire = '2h'): string {
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyToken(token: string) {
  return jwt.verify(token, secret);
}
