import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '@/lib/auth/jwt';
import { UserRegistrationSchema } from '@/types/user';
import { createErrorResponse } from '@/lib/api/middleware';
import { PostgresUserService } from '@/lib/db/postgres/userService';
import { ZodError } from 'zod';

const userService = new PostgresUserService();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request body
    const validatedData = UserRegistrationSchema.parse(body);
    
    try {
      // Create new user
      const user = await userService.createUser(validatedData);
      
      // Generate JWT token
      const token = generateToken(user);
      
      // Return user data (excluding password hash) and set token as cookie
      const { password_hash, ...userWithoutPassword } = user;
      
      const response = NextResponse.json({
        user: userWithoutPassword,
        success: true
      }, { status: 201 });

      // Set token cookie
      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 24 * 60 * 60 // 24 hours
      });
      
      return response;
    } catch (error: any) {
      if (error.message === 'Email or username already registered') {
        return createErrorResponse('Email or username already registered', 409);
      }
      throw error;
    }
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof ZodError) {
      return createErrorResponse({
        field: error.errors[0].path[0] as string,
        message: error.errors[0].message
      }, 400);
    }
    
    return createErrorResponse('Registration failed', 500);
  }
} 