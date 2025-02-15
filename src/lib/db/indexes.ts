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
}

/**
 * Creates a vector search index for a data collection if it doesn't exist
 */
export async function ensureVectorSearchIndex(db: Db, collectionName: string): Promise<void> {
  try {
    const collection = db.collection(collectionName);
    
    // Check if vector search index already exists
    const indexes = await collection.listIndexes().toArray();
    const hasVectorIndex = indexes.some(index => index.name === 'vector_index');
    
    if (!hasVectorIndex) {
      console.log(`Creating vector search index for collection ${collectionName}...`);
      
        // Use createSearchIndex for vector search indexes
        await db.command({
          createSearchIndexes: collectionName,
          indexes: [{
            name: "vector_index",
            definition: {
              mappings: {
                dynamic: true,
                fields: {
                  _vector: {
                    dimensions: 1536,
                    similarity: "cosine",
                    type: "knnVector"
                  }
                }
              }
            }
          }]
        });
        
        console.log(`Vector search index created for collection ${collectionName}`);
    }
  } catch (error) {
    console.error(`Error creating vector search index for ${collectionName}:`, error);
    throw error;
  }
} 