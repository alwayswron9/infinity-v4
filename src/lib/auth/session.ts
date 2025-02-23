import { cookies } from 'next/headers';
import { verifyToken } from './jwt';
import { executeQuery } from '../db/postgres';

export type User = {
  id: string;
  email: string;
  name: string;
  status: 'active' | 'inactive';
};

export async function getCurrentUser(): Promise<User | null> {
  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return null;
    }

    // Verify JWT and get payload
    const payload = verifyToken(token);
    if (!payload) {
      return null;
    }

    // Get user ID from JWT payload
    const userId = payload.sub;
    if (!userId) {
      return null;
    }

    // Get user from database
    const result = await executeQuery(
      'SELECT id, email, name, status FROM users WHERE id = $1 AND status = $2',
      [userId, 'active']
    );

    const user = result.rows[0];
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      status: user.status as 'active' | 'inactive'
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
} 
