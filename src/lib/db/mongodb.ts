import { MongoClient } from 'mongodb';
import { createIndexes } from './indexes';

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI is not set in environment variables');
}

if (!process.env.MONGODB_DB) {
  throw new Error('MONGODB_DB is not set in environment variables');
}

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;
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

/**
 * Gets a cached MongoDB client instance or creates a new one
 */
export function getMongoClient(): MongoClient {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = MongoClient.connect(MONGODB_URI)
      .then((client) => {
        cached.conn = client;
        return client;
      });
  }

  // We need to ensure connection is established
  if (!cached.conn) {
    throw new Error('MongoDB connection not initialized. Call connectToDatabase first.');
  }

  return cached.conn;
}

/**
 * Connects to MongoDB and ensures indexes exist
 */
export async function connectToDatabase() {
  if (cached.conn) {
    return { db: cached.conn.db(MONGODB_DB), client: cached.conn };
  }

  if (!cached.promise) {
    cached.promise = MongoClient.connect(MONGODB_URI);
  }

  try {
    const client = await cached.promise;
    cached.conn = client;

    const db = client.db(MONGODB_DB);

    // Create indexes if not already done
    if (!indexesCreated) {
      await createIndexes(db);
      indexesCreated = true;
    }

    return { db, client };
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

/**
 * Closes the MongoDB connection
 */
export async function disconnectFromDatabase(): Promise<void> {
  try {
    if (cached.conn) {
      await cached.conn.close();
      cached.conn = null;
      cached.promise = null;
      console.log('Disconnected from MongoDB');
    }
  } catch (error) {
    console.error('Failed to disconnect from MongoDB:', error);
    throw error;
  }
} 