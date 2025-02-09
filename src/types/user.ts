import { z } from 'zod';

// System User Schema
export const SystemUserSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3),
  email: z.string().email(),
  name: z.string().min(1),
  status: z.enum(['active', 'inactive']),
  created_at: z.date(),
  updated_at: z.date(),
  // Additional fields for auth 
  password_hash: z.string(),
});

// Registration Schema (what users provide when registering)
export const UserRegistrationSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

// Login Schema (using username for login)
export const UserLoginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

// Types
export type SystemUser = z.infer<typeof SystemUserSchema>;
export type UserRegistration = z.infer<typeof UserRegistrationSchema>;
export type UserLogin = z.infer<typeof UserLoginSchema>;

// API Response Types
export type AuthResponse = {
  token: string;
  user: Omit<SystemUser, 'password_hash'>;
}; 