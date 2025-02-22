import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/auth/password';
import { generateToken } from '@/lib/auth/jwt';
import { UserLoginSchema, SystemUser } from '@/types/user';
import { createErrorResponse } from '@/lib/api/middleware';
import { PostgresUserService } from '@/lib/db/postgres/userService';
import { ZodError } from 'zod';

const userService = new PostgresUserService();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request body
    const validatedData = UserLoginSchema.parse(body);
    
    // Find user by username
    const user = await userService.findByUsername(validatedData.username);
      
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

    // Set token cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 // 24 hours
    });
    
    return response;
    
  } catch (error) {
    console.error('Login error:', error);
    
    if (error instanceof ZodError) {
      return createErrorResponse({
        field: error.errors[0].path[0] as string,
        message: error.errors[0].message
      }, 400);
    }
    
    return createErrorResponse('Login failed', 500);
  }
} 