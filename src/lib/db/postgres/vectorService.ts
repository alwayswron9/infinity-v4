import { executeQuery } from '../postgres';
import OpenAI from 'openai';
import { ModelDefinition } from '@/types/modelDefinition';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface VectorSearchResult {
  id: string;
  data: Record<string, any>;
  similarity: number;
}

export class PostgresVectorService {
  private modelId: string;
  private tableName: string;

  constructor(modelId: string) {
    this.modelId = modelId;
    // Replace hyphens with underscores for PostgreSQL compatibility
    this.tableName = `data_${modelId.replace(/-/g, '_')}`;
  }

  /**
   * Initialize a new data table for a model with vector support
   */
  async initializeTable(model: ModelDefinition): Promise<void> {
    try {
      // Create table with JSONB for flexible data and vector for embeddings
      await executeQuery(`
        CREATE TABLE IF NOT EXISTS "${this.tableName}" (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          data JSONB NOT NULL DEFAULT '{}',
          embedding vector(1536),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create IVFFlat index for vector similarity search
      const embeddingIndexName = `${this.tableName}_embedding_idx`;
      await executeQuery(`
        CREATE INDEX IF NOT EXISTS "${embeddingIndexName}"
        ON "${this.tableName}" 
        USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 100)
      `);

      // Create index on created_at and updated_at
      const createdAtIndexName = `${this.tableName}_created_at_idx`;
      const updatedAtIndexName = `${this.tableName}_updated_at_idx`;
      
      await executeQuery(`
        CREATE INDEX IF NOT EXISTS "${createdAtIndexName}"
        ON "${this.tableName}" (created_at)
      `);
      
      await executeQuery(`
        CREATE INDEX IF NOT EXISTS "${updatedAtIndexName}"
        ON "${this.tableName}" (updated_at)
      `);

      console.log(`Initialized table ${this.tableName} with vector support`);
    } catch (error) {
      console.error(`Failed to initialize table ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Generate embedding for text using OpenAI
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Failed to generate embedding:', error);
      throw error;
    }
  }

  /**
   * Create a new record with vector embedding
   */
  async createRecord(data: Record<string, any>, sourceFields?: string[]): Promise<string> {
    try {
      let embedding: number[] | null = null;

      // Generate embedding if source fields are specified
      if (sourceFields && sourceFields.length > 0) {
        const textForEmbedding = sourceFields
          .map(field => String(data[field] || ''))
          .join(' ');
        embedding = await this.generateEmbedding(textForEmbedding);
      }

      const result = await executeQuery(`
        INSERT INTO "${this.tableName}" (data, embedding)
        VALUES ($1, $2)
        RETURNING id
      `, [JSON.stringify(data), embedding ? JSON.stringify(embedding) : null]);

      return result.rows[0].id;
    } catch (error) {
      console.error('Failed to create record:', error);
      throw error;
    }
  }

  /**
   * Update a record and its embedding
   */
  async updateRecord(
    id: string,
    data: Record<string, any>,
    sourceFields?: string[]
  ): Promise<void> {
    try {
      let embedding: number[] | null = null;

      // Generate new embedding if source fields are specified
      if (sourceFields && sourceFields.length > 0) {
        const textForEmbedding = sourceFields
          .map(field => String(data[field] || ''))
          .join(' ');
        embedding = await this.generateEmbedding(textForEmbedding);
      }

      await executeQuery(`
        UPDATE "${this.tableName}"
        SET 
          data = $1,
          embedding = $2,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
      `, [JSON.stringify(data), embedding ? JSON.stringify(embedding) : null, id]);
    } catch (error) {
      console.error('Failed to update record:', error);
      throw error;
    }
  }

  /**
   * Perform vector similarity search
   */
  async searchSimilar(
    query: string,
    limit: number = 10,
    minSimilarity: number = 0.7,
    filter?: Record<string, any>
  ): Promise<VectorSearchResult[]> {
    try {
      // Generate query embedding
      const queryEmbedding = await this.generateEmbedding(query);

      // Build filter conditions if provided
      let filterConditions = '';
      let filterValues: any[] = [JSON.stringify(queryEmbedding), minSimilarity, limit];
      
      if (filter && Object.keys(filter).length > 0) {
        const conditions = Object.entries(filter).map(([key, value], index) => {
          filterValues.push(value);
          return `data->>'${key}' = $${index + 4}`; // +4 because we already have 3 parameters
        });
        filterConditions = 'AND ' + conditions.join(' AND ');
      }

      const result = await executeQuery(`
        SELECT 
          id,
          data,
          1 - (embedding <=> $1::vector) as similarity
        FROM "${this.tableName}"
        WHERE embedding IS NOT NULL
          AND 1 - (embedding <=> $1::vector) >= $2
          ${filterConditions}
        ORDER BY similarity DESC
        LIMIT $3
      `, filterValues);

      return result.rows.map(row => ({
        id: row.id,
        data: row.data,
        similarity: row.similarity
      }));
    } catch (error) {
      console.error('Failed to perform similarity search:', error);
      throw error;
    }
  }

  /**
   * Delete a record
   */
  async deleteRecord(id: string): Promise<void> {
    try {
      await executeQuery(`
        DELETE FROM "${this.tableName}"
        WHERE id = $1
      `, [id]);
    } catch (error) {
      console.error('Failed to delete record:', error);
      throw error;
    }
  }

  /**
   * Drop the table and its indexes
   */
  async dropTable(): Promise<void> {
    try {
      await executeQuery(`DROP TABLE IF EXISTS "${this.tableName}"`);
      console.log(`Dropped table ${this.tableName}`);
    } catch (error) {
      console.error(`Failed to drop table ${this.tableName}:`, error);
      throw error;
    }
  }
} 