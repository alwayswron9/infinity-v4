import { ModelDefinition } from '@/types/modelDefinition';
import { executeQuery } from '../db/postgres';
import OpenAI from 'openai';
import { DataRecord, SearchResult } from '@/types/dataRecord';

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
  async generateEmbedding(text: string): Promise<number[]> {
    if (!text) {
      throw new Error('Text is required for embedding');
    }

    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Failed to generate embedding:', error);
      throw new Error('Failed to generate embedding');
    }
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
      .map((field: string) => {
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

      await this.storeEmbedding(record._id.toString(), vector);
      console.log('[Embedding] Successfully stored vector for record:', record._id);
      return vector;
    } catch (error) {
      console.error('[Embedding] Failed to generate embedding:', error);
      throw error;
    }
  }

  /**
   * Performs a vector similarity search
   */
  async searchSimilar(
    query: string,
    limit: number = 10,
    minSimilarity: number = 0.7
  ): Promise<SearchResult[]> {
    if (!this.model.embedding?.enabled) {
      throw new Error('Vector search is not enabled for this model');
    }

    console.log('[Search] Searching for:', query.slice(0, 50) + (query.length > 50 ? '...' : ''));
    console.log('[Search] Model ID:', this.model.id);
    console.log('[Search] Min Similarity:', minSimilarity);

    try {
      // First check if we have any records with embeddings
      const checkResults = await executeQuery(
        `SELECT COUNT(*) as count 
         FROM model_data 
         WHERE model_id = $1 
         AND embedding IS NOT NULL`,
        [this.model.id]
      );
      
      console.log('[Search] Found records with embeddings:', checkResults.rows[0].count);

      // Generate query embedding
      const queryEmbedding = await this.generateEmbedding(query);

      // Return empty array if no query embedding
      if (!queryEmbedding || queryEmbedding.length === 0) {
        console.log('[Search] No valid embedding generated');
        return [];
      }

      console.log(`[Search] Generated query embedding of length ${queryEmbedding.length}`);

      // Use a lower minimum similarity threshold to get more results
      const effectiveMinSimilarity = Math.min(minSimilarity, 0.3);
      console.log('[Search] Using effective min similarity:', effectiveMinSimilarity);

      // Perform similarity search using PostgreSQL
      const results = await executeQuery(
        `SELECT 
          id,
          model_id,
          owner_id,
          data,
          created_at,
          updated_at,
          1 - (embedding <=> $1::vector) as similarity
         FROM model_data
         WHERE model_id = $2
           AND embedding IS NOT NULL
           AND 1 - (embedding <=> $1::vector) >= $3
         ORDER BY similarity DESC
         LIMIT $4`,
        [
          `[${queryEmbedding.join(',')}]`,
          this.model.id,
          effectiveMinSimilarity,
          limit
        ]
      );

      console.log(`[Search] Found ${results.rows.length} results with similarity >= ${effectiveMinSimilarity}`);
      if (results.rows.length > 0) {
        console.log('[Search] First result similarity:', results.rows[0].similarity);
      }

      // Transform results to include similarity score but exclude vector
      return results.rows.map(row => ({
        _id: row.id,
        _created_at: new Date(row.created_at),
        _updated_at: new Date(row.updated_at),
        ...row.data,
        similarity: row.similarity
      }));
    } catch (error) {
      console.error('[Search] Failed to perform search:', error);
      throw error;
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    
    if (magnitudeA === 0 || magnitudeB === 0) {
      console.error('[Similarity] Zero magnitude vector detected');
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

  async storeEmbedding(recordId: string, embedding: number[]): Promise<void> {
    try {
      await executeQuery(
        'UPDATE model_data SET embedding = $1 WHERE id = $2',
        [embedding, recordId]
      );
    } catch (error) {
      console.error('Failed to store embedding:', error);
      throw error;
    }
  }
} 