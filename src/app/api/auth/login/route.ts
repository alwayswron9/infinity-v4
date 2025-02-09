import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { verifyPassword } from '@/lib/auth/password';
import { generateToken } from '@/lib/auth/jwt';
import { UserLoginSchema, SystemUser } from '@/types/user';
import { createErrorResponse } from '@/lib/api/middleware';
import { ZodError } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request body
    const validatedData = UserLoginSchema.parse(body);
    
    const { db } = await connectToDatabase();
    
    // Find user by username
    const user = await db
      .collection('users')
      .findOne(
        { username: validatedData.username },
        { projection: { password_hash: 1, id: 1, username: 1, email: 1, name: 1, status: 1, created_at: 1, updated_at: 1 } }
      ) as SystemUser | null;
      
    if (!user) {
      return createErrorResponse({ 
        field: 'username',
        message: 'No account found with this username'
      }, 401);
    }
    
    // Check if user is active
    if (user.status !== 'active') {
      return createErrorResponse('Account is inactive. Please contact support.', 403);
    }
    
    // Verify password
    const isValidPassword = await verifyPassword(
      validatedData.password,
      user.password_hash
    );
    
    if (!isValidPassword) {
      return createErrorResponse({ 
        field: 'password',
        message: 'Incorrect password'
      }, 401);
    }
    
    // Generate JWT token
    const token = generateToken(user);
    
    // Return user data (excluding password hash) and set token as cookie
    const { password_hash, ...userWithoutPassword } = user;
    
    const response = NextResponse.json({
      user: userWithoutPassword,
      success: true
    });

    // Set token as HTTP-only cookie
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 1 day
    });
    
    return response;
    
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof ZodError) {
      const fieldErrors = error.errors[0];
      return createErrorResponse({
        field: fieldErrors.path[0] as string,
        message: fieldErrors.message
      }, 400);
    }
    return createErrorResponse('Internal server error', 500);
  }
} 