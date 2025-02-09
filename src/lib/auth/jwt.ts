import jwt from 'jsonwebtoken';
import { SystemUser } from '@/types/user';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not set in environment variables');
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '24h';

export type JWTPayload = {
  sub: string;
  email: string;
  name: string;
};

export function generateToken(user: SystemUser): string {
  const payload: JWTPayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export function extractTokenFromHeader(authHeader?: string): string {
  if (!authHeader) {
    throw new Error('No authorization header');
  }

  const [type, token] = authHeader.split(' ');

  if (type !== 'Bearer') {
    throw new Error('Invalid authorization header format');
  }

  if (!token) {
    throw new Error('No token provided');
  }

  return token;
} 