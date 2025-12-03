import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

if (JWT_SECRET === 'change-me-in-production') {
  console.warn('⚠️  WARNING: Using default JWT_SECRET. Set JWT_SECRET in your environment variables for production!');
}

export interface TherapistPayload {
  id: string;
  email: string;
}

export function generateToken(payload: TherapistPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): TherapistPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TherapistPayload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getTherapistFromToken(token: string | null): Promise<{ id: string; email: string; name: string } | null> {
  if (!token) return null;
  
  const payload = verifyToken(token);
  if (!payload) return null;

  const { data, error } = await db
    .from('therapists')
    .select('id, email, name')
    .eq('id', payload.id)
    .single();

  if (error || !data) return null;
  return data;
}

