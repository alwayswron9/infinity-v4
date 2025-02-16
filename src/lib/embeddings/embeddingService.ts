import OpenAI from 'openai';
import { MongoClient, ObjectId } from 'mongodb';
import { ModelDefinition } from '@/types/modelDefinition';
import { DataRecord, SearchResult } from '@/types/dataRecord';
import { getDataMongoClient } from '@/lib/db/dataDb';

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
    if (!text.trim()) {
      throw new Error('Cannot generate embedding for empty text');
    }

    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });

    if (!response.data[0]?.embedding) {
      throw new Error('Failed to generate embedding from OpenAI');
    }
    
    return response.data[0].embedding;
  }

  /**
   * Updates the embedding vector for a record
   */
  async updateRecordEmbedding(record: DataRecord): Promise<number[]> {
    if (!this.model.embedding?.enabled) {
      console.log('[Embedding] Embeddings disabled for model:', this.model.id);
      return [];
    }

    console.log('[Embedding] Starting embedding generation for record:', record._id);
    
    const textForEmbedding = this.model.embedding.source_fields
      .map(field => {
        const value = record[field];
        if (!value) {
          console.warn(`[Embedding] Missing source field '${field}' in record ${record._id}`);
        }
        return String(value || '');
      })
      .join(' ');

    console.log('[Embedding] Generated text for embedding:', textForEmbedding.slice(0, 100) + '...');

    try {
      console.log('[Embedding] Calling OpenAI API...');
      const vector = await this.generateEmbedding(textForEmbedding);
      console.log('[Embedding] Received vector of length:', vector.length);

      if (vector.every(v => v === 0)) {
        console.error('[Embedding] Zero vector generated for record:', record._id);
        throw new Error('Zero vector from OpenAI');
      }

      await getDataMongoClient().db().collection(this.getCollectionName()).updateOne(
        { _id: record._id },
        { $set: { _vector: vector } }
      );
      console.log('[Embedding] Successfully stored vector for record:', record._id);
      return vector;
    } catch (error) {
      console.error('[Embedding] Failed to generate embedding:', error);
      throw error; // Rethrow for upstream handling
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
    if (!this.model.embedding?.enabled) {
      throw new Error('Vector search is not enabled for this model');
    }

    const collection = getDataMongoClient().db().collection(this.getCollectionName());
    
    // Add collection verification
    const count = await collection.countDocuments();
    console.log(`Searching in collection ${this.getCollectionName()} (${count} records)`);

    if (count === 0) {
      console.log('No records found in collection');
      return [];
    }

    // Add vector existence to filter
    const vectorFilter = {
      ...filter,
      _vector: { $exists: true, $ne: null }
    };

    const records = await collection.find(vectorFilter).toArray();
    console.log('Records with vectors after filter:', records.length);

    if (records.length === 0) {
      console.log('No records with vectors found after applying filters');
      return [];
    }

    // Generate query embedding
    console.log('Generating embedding for query:', query);
    const queryEmbedding = await this.generateEmbedding(query);

    // Calculate similarities for records with valid vectors
    const results = records
      .filter(record => Array.isArray(record._vector) && record._vector.length > 0)
      .map(record => {
        try {
          return {
            record: this.toClientRecord(record),
            similarity: this.cosineSimilarity(queryEmbedding, record._vector)
          };
        } catch (error) {
          console.error(`Error calculating similarity for record ${record._id}:`, error);
          return null;
        }
      })
      .filter((result): result is { record: DataRecord; similarity: number } => result !== null);

    console.log('Successfully processed records:', results.length);

    // Post-processing
    const filteredResults = results
      .filter(({ similarity }) => similarity >= minSimilarity)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(({ record, similarity }) => ({
        ...record,
        similarity
      }));

    console.log('Final results after similarity filtering:', filteredResults.length);
    return filteredResults;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    
    if (magnitudeA === 0 || magnitudeB === 0) {
      console.error('Zero magnitude vector detected');
      return 0;
    }
    
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