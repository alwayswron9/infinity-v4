# Authentication

This document provides details about the authentication system in the Infinity v4 application.

## Overview

The application implements a custom authentication system using JSON Web Tokens (JWT) and bcrypt for password hashing. The authentication logic is primarily located in the `/src/lib/auth` directory.

## Authentication Flow

1. **Registration**:
   - User submits registration information
   - Password is hashed using bcrypt
   - User is created in the database
   - JWT token is generated and returned

2. **Login**:
   - User submits credentials
   - Password is verified against stored hash
   - JWT token is generated and returned

3. **Session Management**:
   - JWT token is stored client-side
   - Token is included in subsequent API requests
   - Server validates token on protected routes

4. **Logout**:
   - Client removes the stored JWT token

## Protected Routes

Protected routes in the application are organized in the `/src/app/(protected)` directory. These routes are accessible only to authenticated users.

The application uses Next.js middleware (`/src/middleware.ts`) to protect routes:

```typescript
// Example middleware implementation
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  
  // Check if accessing a protected route
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    try {
      // Verify the token
      verifyJwtToken(token);
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}
```

## JWT Implementation

The application uses the `jsonwebtoken` library for JWT operations:

```typescript
// Example JWT token generation
import jwt from 'jsonwebtoken';

function generateToken(userId: string) {
  return jwt.sign(
    { sub: userId },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }
  );
}
```

## Password Security

Passwords are secured using the `bcryptjs` library:

```typescript
// Example password hashing
import bcrypt from 'bcryptjs';

async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function verifyPassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword);
}
```

## User Roles and Permissions

The application likely implements role-based access control for different user types:

- Admin: Full system access
- Standard User: Limited access to specific features
- Guest: Read-only access to public content

## Security Considerations

The authentication system implements several security best practices:

1. **Password Security**:
   - Passwords are hashed, not stored in plain text
   - bcrypt with appropriate work factor provides slow hashing

2. **JWT Security**:
   - Tokens have an expiration time
   - Sensitive information is kept out of token payloads
   - Token secret is stored in environment variables

3. **CSRF Protection**:
   - Proper CSRF protection mechanisms are implemented

4. **Secure Headers**:
   - HTTP security headers are set using Next.js middleware

## Client-Side Authentication

On the client side, authentication state is likely managed using a Zustand store or context:

```typescript
// Example auth store
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: async (credentials) => {
    // Implementation
  },
  logout: () => {
    // Implementation
  },
}));
```

## Environment Variables

The authentication system relies on environment variables for configuration:

```
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```
