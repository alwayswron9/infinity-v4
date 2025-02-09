import { MongoClient } from 'mongodb';
import { createIndexes } from './indexes';

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI is not set in environment variables');
}

const MONGODB_URI = process.env.MONGODB_URI;
let client: MongoClient | null = null;
let indexesCreated = false;

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
declare global {
  var mongodb: { conn: MongoClient | null; promise: Promise<MongoClient> | null };
}

let cached = global.mongodb;

if (!cached) {
  cached = global.mongodb = { conn: null, promise: null };
}

/**
 * Ensures required indexes exist in MongoDB
 */
async function ensureIndexes(db: ReturnType<MongoClient['db']>) {
  // Users collection indexes
  await db.collection('users').createIndexes([
    { key: { email: 1 }, unique: true },
    { key: { status: 1 } },
  ]);

  // API Keys collection indexes
  await db.collection('api_keys').createIndexes([
    { key: { key_hash: 1 }, unique: true },
    { key: { user_id: 1 } },
    { key: { status: 1 } },
  ]);
}

export async function connectToDatabase() {
  if (client) {
    return { db: client.db(), client };
  }

  client = await MongoClient.connect(MONGODB_URI);
  const db = client.db();

  // Create indexes if not already done
  if (!indexesCreated) {
    await createIndexes(db);
    indexesCreated = true;
  }

  return { db, client };
} 