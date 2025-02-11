import OpenAI from 'openai';
import { MongoClient, ObjectId, WithId, Document } from 'mongodb';
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
    return 'data';
  }

  /**
   * Transform database record to client record (moves fields to root level)
   */
  private toClientRecord(dbRecord: any): DataRecord {
    if (!dbRecord) return dbRecord;

    // Extract system fields
    const { _id, created_at, updated_at, _vector, ...fields } = dbRecord;

    // Return client format
    return {
      _id,
      fields,
      created_at,
      updated_at,
      _vector
    };
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

    // Extract text from source fields
    const textForEmbedding = this.model.embedding.source_fields
      .map(field => String(record.fields[field] || ''))
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
   * Performs a vector similarity search
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
      const queryVector = await this.generateEmbedding(query);
      const collection = getMongoClient().db().collection(this.getCollectionName());

      // Combine model filter with any additional filters
      const finalFilter = { model_id: this.model.id, ...filter };

      const pipeline = [
        {
          $vectorSearch: {
            queryVector,
            path: "_vector",
            numDimensions: 1536,
            index: "vector_index",
            numCandidates: 100,
            limit: limit * 2
          }
        },
        {
          $match: finalFilter
        },
        {
          $limit: limit
        },
        {
          $project: {
            document: "$$ROOT",
            score: { $meta: "vectorSearchScore" }
          }
        }
      ];

      // Don't log the query vector
      const pipelineLog = JSON.parse(JSON.stringify(pipeline));
      if (pipelineLog[0]?.$vectorSearch?.queryVector) {
        pipelineLog[0].$vectorSearch.queryVector = '[vector data]';
      }
      console.log('Executing pipeline:', JSON.stringify(pipelineLog, null, 2));

      const results = await collection.aggregate(pipeline).toArray();
      console.log(`Search returned ${results.length} results`);
      if (results.length > 0) {
        console.log('First result:', {
          id: results[0].document._id,
          fields: results[0].document.fields,
          score: results[0].score
        });
      }
      
      return results
        .map(result => ({
          record: this.toClientRecord(result.document),
          similarity: result.score
        }))
        .filter(result => result.similarity >= minSimilarity);

    } catch (error) {
      console.error('Error performing vector search:', error);
      throw error;
    }
  }
} 