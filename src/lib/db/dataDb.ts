import { MongoClient, Db } from 'mongodb';
import { ensureVectorSearchIndex } from './indexes';

if (!process.env.MONGODB_DATA_URI) {
  throw new Error('MONGODB_DATA_URI is not set in environment variables');
}

if (!process.env.MONGODB_DATA_DB) {
  throw new Error('MONGODB_DATA_DB is not set in environment variables');
}

const MONGODB_DATA_URI = process.env.MONGODB_DATA_URI;
const MONGODB_DATA_DB = process.env.MONGODB_DATA_DB;

let cached = global.mongodbData;

if (!cached) {
  cached = global.mongodbData = { conn: null, promise: null };
}

declare global {
  var mongodbData: { conn: MongoClient | null; promise: Promise<MongoClient> | null };
}

/**
 * Gets a cached MongoDB client instance for data operations or creates a new one
 */
export function getDataMongoClient(): MongoClient {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = MongoClient.connect(MONGODB_DATA_URI)
      .then((client) => {
        cached.conn = client;
        return client;
      });
  }

  if (!cached.conn) {
    throw new Error('MongoDB Data connection not initialized. Call connectToDataDatabase first.');
  }

  return cached.conn;
}

/**
 * Connects to MongoDB Data database
 */
export async function connectToDataDatabase() {
  if (cached.conn) {
    return { db: cached.conn.db(MONGODB_DATA_DB), client: cached.conn };
  }

  if (!cached.promise) {
    cached.promise = MongoClient.connect(MONGODB_DATA_URI);
  }

  try {
    const client = await cached.promise;
    cached.conn = client;
    const db = client.db(MONGODB_DATA_DB);
    return { db, client };
  } catch (error) {
    console.error('Failed to connect to MongoDB Data:', error);
    throw error;
  }
}

/**
 * Ensures a collection exists and has the necessary indexes
 */
export async function ensureCollection(modelId: string): Promise<void> {
  const { db } = await connectToDataDatabase();
  const collectionName = `data_${modelId}`;
  
  // Get list of collections
  const collections = await db.listCollections().toArray();
  const collectionExists = collections.some(col => col.name === collectionName);
  
  if (!collectionExists) {
    // Create the collection
    await db.createCollection(collectionName);
    console.log(`Created collection ${collectionName}`);
    
    // Create basic indexes
    await db.collection(collectionName).createIndexes([
      { key: { _created_at: 1 } },
      { key: { _updated_at: 1 } }
    ]);
  }
  
  // Ensure vector search index exists (if needed)
  await ensureVectorSearchIndex(db, collectionName);
}

/**
 * Closes the MongoDB Data connection
 */
export async function disconnectFromDataDatabase(): Promise<void> {
  try {
    if (cached.conn) {
      await cached.conn.close();
      cached.conn = null;
      cached.promise = null;
      console.log('Disconnected from MongoDB Data');
    }
  } catch (error) {
    console.error('Failed to disconnect from MongoDB Data:', error);
    throw error;
  }
} 