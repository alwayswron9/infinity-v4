import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db/mongodb'
import { withAuth, AuthenticatedRequest, createErrorResponse } from '@/lib/api/middleware'
import { JWTPayload } from '@/lib/auth/jwt'

export async function POST(req: NextRequest) {
  return withAuth(req, async (authenticatedReq: AuthenticatedRequest) => {
    try {
      const { db } = await connectToDatabase()
      const token = authenticatedReq.cookies.get('token')?.value
      
      if (!token) {
        return createErrorResponse('No active session', 400)
      }

      // Get user ID based on auth type
      const userId = authenticatedReq.auth.type === 'jwt'
        ? (authenticatedReq.auth.payload as JWTPayload).sub
        : (authenticatedReq.auth.payload as { user_id: string }).user_id;

      // Add token to blacklist
      await db.collection('revoked_tokens').insertOne({
        token,
        revoked_at: new Date(),
        user_id: userId
      })

      // Clear client-side cookie
      const response = NextResponse.json({ success: true })
      response.cookies.delete('token')
      
      return response
      
    } catch (error) {
      console.error('Token revocation error:', error)
      return createErrorResponse('Internal server error', 500)
    }
  })
} 