import OpenAI from 'openai';
import { MongoClient, ObjectId } from 'mongodb';
import { ModelDefinition } from '@/types/modelDefinition';
import { DataRecord } from '@/types/dataRecord';
import { getMongoClient } from '@/lib/db/mongodb';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class EmbeddingService {
  private model: ModelDefinition;

  constructor(model: ModelDefinition) {
    this.model = model;
  }

  private getCollectionName(): string {
    return `data_${this.model.id}`;
  }

  /**
   * Calculates cosine similarity between two vectors
   */
  private calculateCosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    return similarity;
  }

  /**
   * Generates an embedding vector for the given text using OpenAI's ada-002 model
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });

    return response.data[0].embedding;
  }

  /**
   * Updates the embedding vector for a record
   */
  async updateRecordEmbedding(record: DataRecord): Promise<void> {
    if (!this.model.embedding?.enabled) {
      return;
    }

    // Extract text from source fields directly since they're at root level
    const textForEmbedding = this.model.embedding.source_fields
      .map(field => {
        const value = record[field];
        return value ? String(value) : '';
      })
      .filter(text => text.length > 0)
      .join(' ');

    if (!textForEmbedding) {
      return;
    }

    try {
      // Generate embedding vector
      const vector = await this.generateEmbedding(textForEmbedding);

      // Update record with new vector
      const collection = getMongoClient().db().collection(this.getCollectionName());
      await collection.updateOne(
        { _id: record._id },
        { $set: { _vector: vector } }
      );
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error('Failed to generate embedding');
    }
  }

  /**
   * Performs a vector similarity search using JavaScript
   */
  async searchSimilar(
    query: string, 
    limit: number = 10, 
    minSimilarity: number = 0,
    filter?: Record<string, any>
  ): Promise<Array<{ record: DataRecord; similarity: number }>> {
    if (!this.model.embedding?.enabled) {
      throw new Error('Vector search is not enabled for this model');
    }

    try {
      // Generate query vector
      const queryVector = await this.generateEmbedding(query);

      // Get all records from the collection
      const collection = getMongoClient().db().collection(this.getCollectionName());
      const records = await collection.find(filter || {}).toArray();

      // Calculate similarities and sort
      const results = records
        .filter(record => record._vector) // Only include records with vectors
        .map(record => ({
          record: this.toClientRecord(record),
          similarity: this.calculateCosineSimilarity(queryVector, record._vector)
        }))
        .filter(result => result.similarity >= minSimilarity)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      console.log(`Search returned ${results.length} results`);
      if (results.length > 0) {
        console.log('First result:', {
          id: results[0].record._id,
          similarity: results[0].similarity
        });
      }

      return results;
    } catch (error) {
      console.error('Error performing vector search:', error);
      throw error;
    }
  }

  /**
   * Transform database record to client record
   */
  private toClientRecord(dbRecord: any): DataRecord {
    if (!dbRecord) return dbRecord;

    // Extract system fields
    const { _id, _created_at, _updated_at, _vector, ...fields } = dbRecord;

    // Return client format
    return {
      _id,
      _created_at: new Date(_created_at),
      _updated_at: new Date(_updated_at),
      _vector,
      ...fields
    };
  }
} 