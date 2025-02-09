import { Db } from 'mongodb';

export async function createIndexes(db: Db) {
  // Create TTL index for revoked_tokens collection
  // Automatically remove tokens after they expire (24 hours + 1 hour buffer)
  await db.collection('revoked_tokens').createIndex(
    { revoked_at: 1 },
    { expireAfterSeconds: 25 * 60 * 60 }  // 25 hours
  );

  // Create unique index on token to prevent duplicate entries
  await db.collection('revoked_tokens').createIndex(
    { token: 1 },
    { unique: true }
  );

  // Add more indexes here as needed
} 