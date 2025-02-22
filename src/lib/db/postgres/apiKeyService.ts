import { executeQuery } from '../postgres';
import { v4 as uuidv4 } from 'uuid';
import { generateApiKey, hashApiKey } from '@/lib/auth/apikey';

export interface ApiKey {
  id: string;
  user_id: string;
  key_hash: string;
  name: string;
  status: 'active' | 'inactive';
  last_used_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface ApiKeyWithKey {
  key: string;
  id: string;
  user_id: string;
  name: string;
  status: 'active' | 'inactive';
  last_used_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export class PostgresApiKeyService {
  /**
   * Create a new API key
   */
  async createApiKey(userId: string, name: string): Promise<ApiKeyWithKey> {
    try {
      // Generate new API key and hash
      const id = uuidv4();
      const key = generateApiKey();
      const keyHash = hashApiKey(key);
      const now = new Date();

      // Insert into database
      const result = await executeQuery(`
        INSERT INTO api_keys (
          id, user_id, key_hash, name, status, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7
        ) RETURNING *
      `, [
        id,
        userId,
        keyHash,
        name,
        'active',
        now,
        now
      ]);

      if (!result.rows[0]) {
        throw new Error('Failed to create API key');
      }

      const apiKey = result.rows[0];

      // Return with the plain text key
      return {
        key,
        id: apiKey.id,
        user_id: apiKey.user_id,
        name: apiKey.name,
        status: apiKey.status,
        last_used_at: apiKey.last_used_at,
        created_at: apiKey.created_at,
        updated_at: apiKey.updated_at
      };
    } catch (error) {
      console.error('Failed to create API key:', error);
      throw error;
    }
  }

  /**
   * Find an API key by its hash
   */
  async findByKeyHash(keyHash: string): Promise<ApiKey | null> {
    try {
      const result = await executeQuery(
        'SELECT * FROM api_keys WHERE key_hash = $1 AND status = $2',
        [keyHash, 'active']
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Failed to find API key by hash:', error);
      throw error;
    }
  }

  /**
   * List all API keys for a user
   */
  async listUserApiKeys(userId: string): Promise<ApiKey[]> {
    try {
      const result = await executeQuery(
        'SELECT * FROM api_keys WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );

      return result.rows;
    } catch (error) {
      console.error('Failed to list user API keys:', error);
      throw error;
    }
  }

  /**
   * Update API key status
   */
  async updateStatus(id: string, userId: string, status: 'active' | 'inactive'): Promise<void> {
    try {
      const result = await executeQuery(`
        UPDATE api_keys 
        SET status = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $2 AND user_id = $3
      `, [status, id, userId]);

      if (result.rowCount === 0) {
        throw new Error('API key not found or unauthorized');
      }
    } catch (error) {
      console.error('Failed to update API key status:', error);
      throw error;
    }
  }

  /**
   * Update last used timestamp
   */
  async updateLastUsed(id: string): Promise<void> {
    try {
      await executeQuery(
        'UPDATE api_keys SET last_used_at = CURRENT_TIMESTAMP WHERE id = $1',
        [id]
      );
    } catch (error) {
      console.error('Failed to update API key last used timestamp:', error);
      throw error;
    }
  }

  /**
   * Delete an API key
   */
  async deleteApiKey(id: string, userId: string): Promise<void> {
    try {
      const result = await executeQuery(
        'DELETE FROM api_keys WHERE id = $1 AND user_id = $2',
        [id, userId]
      );

      if (result.rowCount === 0) {
        throw new Error('API key not found or unauthorized');
      }
    } catch (error) {
      console.error('Failed to delete API key:', error);
      throw error;
    }
  }

  /**
   * Revoke all API keys for a user
   */
  async revokeAllUserApiKeys(userId: string): Promise<void> {
    try {
      await executeQuery(
        'UPDATE api_keys SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
        ['inactive', userId]
      );
    } catch (error) {
      console.error('Failed to revoke user API keys:', error);
      throw error;
    }
  }
} 