import { NextResponse } from 'next/server';

export async function GET() {
  const response = NextResponse.json({ message: 'Logged out successfully' });
  
  // Clear token cookie
  response.cookies.set({
    name: 'token',
    value: '',
    expires: new Date(0),
    path: '/',
  });

  return response;
} 