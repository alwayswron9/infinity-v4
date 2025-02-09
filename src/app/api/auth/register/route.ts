import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { connectToDatabase } from '@/lib/db/mongodb';
import { hashPassword } from '@/lib/auth/password';
import { generateToken } from '@/lib/auth/jwt';
import { UserRegistrationSchema, SystemUserSchema, SystemUser } from '@/types/user';
import { createErrorResponse } from '@/lib/api/middleware';
import { withLogging } from '@/lib/api/logging';
import { ZodError } from 'zod';

async function handler(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request body
    const validatedData = UserRegistrationSchema.parse(body);
    
    const { db } = await connectToDatabase();
    
    // Check if a user with the same email or username exists
    const existingUser = await db
      .collection('users')
      .findOne({ $or: [ { email: validatedData.email }, { username: validatedData.username } ] });
      
    if (existingUser) {
      return createErrorResponse('Email or username already registered', 409);
    }
    
    // Create new user
    const now = new Date();
    const user: SystemUser = {
      id: uuidv4(),
      username: validatedData.username,
      email: validatedData.email,
      name: validatedData.name,
      status: 'active' as const,
      password_hash: await hashPassword(validatedData.password),
      created_at: now,
      updated_at: now,
    };
    
    // Validate user object against schema
    SystemUserSchema.parse(user);
    
    // Insert into database
    await db.collection('users').insertOne(user);
    
    // Generate JWT token
    const token = generateToken(user);
    
    // Return user data (excluding password hash) and set token as cookie
    const { password_hash, ...userWithoutPassword } = user;
    
    const response = NextResponse.json({
      user: userWithoutPassword,
      success: true
    }, { status: 201 });

    // Set token as HTTP-only cookie
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      // 1 week expiry
      maxAge: 60 * 60 * 24 * 7
    });
    
    return response;
    
  } catch (error) {
    console.error('Registration error:', error);
    if (error instanceof ZodError) {
      return createErrorResponse('Invalid request data', 400);
    }
    return createErrorResponse('Internal server error', 500);
  }
}

export const POST = (req: NextRequest) => withLogging(req, handler)(); 