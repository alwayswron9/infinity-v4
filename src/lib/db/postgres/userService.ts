import { executeQuery } from '../postgres';
import { SystemUser, UserRegistration } from '@/types/user';
import { hashPassword } from '@/lib/auth/password';
import { v4 as uuidv4 } from 'uuid';

export class PostgresUserService {
  /**
   * Create a new user
   */
  async createUser(registration: UserRegistration): Promise<SystemUser> {
    try {
      // Check if user already exists
      const existingUser = await executeQuery(
        'SELECT id FROM users WHERE email = $1 OR username = $2',
        [registration.email, registration.username]
      );

      if (existingUser.rows.length > 0) {
        throw new Error('Email or username already registered');
      }
 
      const now = new Date();
      const user: SystemUser = {
        id: uuidv4(),
        username: registration.username,
        email: registration.email,
        name: registration.name,
        status: 'active',
        password_hash: await hashPassword(registration.password),
        created_at: now,
        updated_at: now,
      };

      // Insert user into database
      await executeQuery(`
        INSERT INTO users (
          id, username, email, name, status, password_hash, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8
        )
      `, [
        user.id,
        user.username,
        user.email,
        user.name,
        user.status,
        user.password_hash,
        user.created_at,
        user.updated_at
      ]);

      return user;
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  }

  /**
   * Find a user by their ID
   */
  async findById(id: string): Promise<SystemUser | null> {
    try {
      const result = await executeQuery(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Failed to find user by ID:', error);
      throw error;
    }
  }

  /**
   * Find a user by their username
   */
  async findByUsername(username: string): Promise<SystemUser | null> {
    try {
      const result = await executeQuery(
        'SELECT * FROM users WHERE username = $1',
        [username]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Failed to find user by username:', error);
      throw error;
    }
  }

  /**
   * Find a user by their email
   */
  async findByEmail(email: string): Promise<SystemUser | null> {
    try {
      const result = await executeQuery(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Failed to find user by email:', error);
      throw error;
    }
  }

  /**
   * Update a user's status
   */
  async updateStatus(id: string, status: 'active' | 'inactive'): Promise<void> {
    try {
      await executeQuery(
        'UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [status, id]
      );
    } catch (error) {
      console.error('Failed to update user status:', error);
      throw error;
    }
  }

  /**
   * Update a user's profile information
   */
  async updateProfile(
    id: string,
    updates: { name?: string; email?: string }
  ): Promise<void> {
    try {
      const setStatements = [];
      const values = [];
      let paramCount = 1;

      if (updates.name) {
        setStatements.push(`name = $${paramCount}`);
        values.push(updates.name);
        paramCount++;
      }

      if (updates.email) {
        // Check if email is already taken
        const existingUser = await this.findByEmail(updates.email);
        if (existingUser && existingUser.id !== id) {
          throw new Error('Email already taken');
        }
        setStatements.push(`email = $${paramCount}`);
        values.push(updates.email);
        paramCount++;
      }

      if (setStatements.length === 0) {
        return;
      }

      values.push(id);
      await executeQuery(
        `UPDATE users SET ${setStatements.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount}`,
        values
      );
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  }

  /**
   * Update a user's password
   */
  async updatePassword(id: string, newPassword: string): Promise<void> {
    try {
      const passwordHash = await hashPassword(newPassword);
      await executeQuery(
        'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [passwordHash, id]
      );
    } catch (error) {
      console.error('Failed to update password:', error);
      throw error;
    }
  }

  /**
   * Delete a user and all their associated data
   */
  async deleteUser(id: string): Promise<void> {
    try {
      // Start a transaction
      await executeQuery('BEGIN');

      try {
        // Delete user's API keys
        await executeQuery('DELETE FROM api_keys WHERE user_id = $1', [id]);

        // Delete user's model definitions
        await executeQuery('DELETE FROM model_definitions WHERE owner_id = $1', [id]);

        // Delete the user
        await executeQuery('DELETE FROM users WHERE id = $1', [id]);

        // Commit the transaction
        await executeQuery('COMMIT');
      } catch (error) {
        // Rollback on error
        await executeQuery('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw error;
    }
  }
} 