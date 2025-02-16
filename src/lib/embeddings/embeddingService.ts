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
    minSimilarity: number = 0.7,
    filter?: Record<string, any>
  ): Promise<SearchResult[]> {
    // Get raw vector data from MongoDB
    const collection = getMongoClient().db().collection(this.getCollectionName());
    const records = await collection.find(filter || {}).toArray();

    // Generate query embedding
    const queryEmbedding = await this.generateEmbedding(query);

    // Calculate similarities
    const results = records.map(record => ({
      record,
      similarity: this.cosineSimilarity(queryEmbedding, record._vector)
    }))
    .filter(result => result.similarity >= minSimilarity)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);

    return results.map(result => ({
      ...result.record,
      _score: result.similarity
    }));
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
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