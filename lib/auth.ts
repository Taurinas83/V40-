import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { config } from './config';

export interface UserPayload {
  id: string;
  email: string;
  name: string;
}

export interface TokenPayload extends UserPayload {
  iat: number;
  exp: number;
}

/**
 * Gera um novo ID de usuário
 */
export function generateUserId(): string {
  return uuidv4();
}

/**
 * Hash de senha com bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, config.auth.bcryptRounds);
}

/**
 * Verifica senha com hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Cria JWT token
 */
export function createToken(user: UserPayload): string {
  return jwt.sign(user, config.jwtSecret, {
    expiresIn: config.auth.tokenExpiry,
    algorithm: 'HS256',
  });
}

/**
 * Verifica e decodifica JWT token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, config.jwtSecret, {
      algorithms: ['HS256'],
    }) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Extrai token do header Authorization
 */
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }
  return parts[1];
}

/**
 * Gera login para novo usuário
 */
export function generateUserLogin(): { id: string; email: string } {
  return {
    id: generateUserId(),
    email: `user_${Date.now()}@vitalidade40.local`,
  };
}
