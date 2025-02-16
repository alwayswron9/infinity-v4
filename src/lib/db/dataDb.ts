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

const cached = global as typeof global & {
  conn?: MongoClient;
  promise?: Promise<MongoClient> | null;
};

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
      })
      .catch((err) => {
        cached.promise = null;
        throw err;
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
  if (cached.conn) return cached.conn;
  
  if (!process.env.MONGODB_DATA_URI) {
    throw new Error('Please define MONGODB_DATA_URI in .env');
  }

  const conn = await MongoClient.connect(process.env.MONGODB_DATA_URI);
  cached.conn = conn;
  return conn;
}

/**
 * Ensures a collection exists and has the necessary indexes
 */
export async function ensureCollection(modelId: string): Promise<void> {
  const client = await connectToDataDatabase();
  const db = client.db(process.env.MONGODB_DATA_DB);
  const collectionName = `data_${modelId}`;

  const collections = await db.listCollections({ name: collectionName }).toArray();
  if (collections.length === 0) {
    await db.createCollection(collectionName);
    console.log(`Created collection ${collectionName}`);
    
    // Only create basic indexes
    const collection = db.collection(collectionName);
    await collection.createIndexes([
      { key: { _created_at: 1 } },
      { key: { _updated_at: 1 } }
    ]);
  }
}

/**
 * Closes the MongoDB Data connection
 */
export async function disconnectFromDataDatabase(): Promise<void> {
  try {
    if (cached.conn) {
      await cached.conn.close();
      cached.conn = undefined;
      cached.promise = null;
      console.log('Disconnected from MongoDB Data');
    }
  } catch (error) {
    console.error('Failed to disconnect from MongoDB Data:', error);
    throw error;
  }
}

// Add this initialization call at server startup
connectToDataDatabase().catch(console.error); 