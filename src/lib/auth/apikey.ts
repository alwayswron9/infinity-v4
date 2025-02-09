import crypto from 'crypto';

if (!process.env.API_KEY_PREFIX) {
  throw new Error('API_KEY_PREFIX is not set in environment variables');
}

const API_KEY_PREFIX = process.env.API_KEY_PREFIX;
const API_KEY_LENGTH = 32;

export function generateApiKey(): string {
  const randomBytes = crypto.randomBytes(API_KEY_LENGTH);
  const key = randomBytes.toString('hex');
  return `${API_KEY_PREFIX}${key}`;
}

export function validateApiKeyFormat(apiKey: string): boolean {
  if (!apiKey.startsWith(API_KEY_PREFIX)) {
    return false;
  }

  const key = apiKey.slice(API_KEY_PREFIX.length);
  return key.length === API_KEY_LENGTH * 2; // *2 because hex encoding doubles length
}

export function hashApiKey(apiKey: string): string {
  return crypto
    .createHash('sha256')
    .update(apiKey)
    .digest('hex');
}

// For storing in the database
export type ApiKeyRecord = {
  id: string;
  user_id: string;
  key_hash: string;
  name: string;
  created_at: Date;
  last_used_at: Date | null;
  status: 'active' | 'revoked';
}; 