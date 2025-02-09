import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env');
}

if (!process.env.MONGODB_DB) {
  throw new Error('Please add your MongoDB Database name to .env');
}

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

export async function connectToDatabase(): Promise<{
  client: MongoClient;
  db: ReturnType<MongoClient['db']>;
}> {
  if (cached.conn) {
    return {
      client: cached.conn,
      db: cached.conn.db(process.env.MONGODB_DB),
    };
  }

  if (!cached.promise) {
    const opts = {
      maxPoolSize: 10,
    };

    cached.promise = MongoClient.connect(process.env.MONGODB_URI!, opts);
  }

  try {
    cached.conn = await cached.promise;
    const db = cached.conn.db(process.env.MONGODB_DB);
    
    // Ensure indexes exist
    await ensureIndexes(db);
    
    return {
      client: cached.conn,
      db,
    };
  } catch (e) {
    cached.promise = null;
    throw e;
  }
} 