import { cookies } from 'next/headers';
import { verifyToken } from './jwt';
import { connectToDatabase } from '../db/mongodb';

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
    const { db } = await connectToDatabase();
    const user = await db.collection('users').findOne(
      { id: userId },
      { projection: { password_hash: 0, _id: 0 } }
    );

    if (!user || user.status !== 'active') {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      status: user.status
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
} 
