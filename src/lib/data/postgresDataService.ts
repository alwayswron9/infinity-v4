import { executeQuery, vectorSimilaritySearch } from '../db/postgres';
import { ModelDefinition, FieldDefinition } from '@/types/modelDefinition';
import { CreateDataRecordInput, DataRecord, ListRecordsQuery, UpdateDataRecordInput, SearchResult } from '@/types/dataRecord';
import { EmbeddingService } from '@/lib/embeddings/embeddingService';
import { v4 as uuidv4 } from 'uuid';

export class PostgresDataService {
  private model: ModelDefinition;
  private embeddingService: EmbeddingService;

  constructor(model: ModelDefinition) {
    this.model = model;
    this.embeddingService = new EmbeddingService(model);
  }

  /**
   * Transform database record to client record
   */
  private toClientRecord(dbRecord: any): DataRecord {
    if (!dbRecord) return dbRecord;

    const { id, data, created_at, updated_at } = dbRecord;

    return {
      _id: id,
      _created_at: new Date(created_at),
      _updated_at: new Date(updated_at),
      ...data
    };
  }

  private async validateFields(fields: Record<string, any>): Promise<void> {
    // Add type assertion for model.fields
    const modelFields = this.model.fields as Record<string, FieldDefinition>;
    
    // Validate required fields
    for (const [fieldName, fieldDef] of Object.entries(modelFields)) {
      if (fieldDef.required && !(fieldName in fields)) {
        throw new Error(`Missing required field: ${fieldName}`);
      }

      if (fieldName in fields) {
        const value = fields[fieldName];
        
        // Type validation
        switch (fieldDef.type) {
          case 'string':
            if (typeof value !== 'string') {
              throw new Error(`Field ${fieldName} must be a string`);
            }
            break;
          case 'number':
            if (typeof value !== 'number') {
              throw new Error(`Field ${fieldName} must be a number`);
            }
            break;
          case 'boolean':
            if (typeof value !== 'boolean') {
              throw new Error(`Field ${fieldName} must be a boolean`);
            }
            break;
          case 'date':
            if (!(value instanceof Date) && !Date.parse(value)) {
              throw new Error(`Field ${fieldName} must be a valid date`);
            }
            break;
        }

        // Enum validation
        if (fieldDef.enum && !fieldDef.enum.includes(value)) {
          throw new Error(`Invalid value for field ${fieldName}. Must be one of: ${fieldDef.enum.join(', ')}`);
        }
      }
    }
  }

  private getTextForEmbedding(fields: Record<string, any>): string {
    if (!this.model.embedding?.source_fields) {
      return '';
    }

    return this.model.embedding.source_fields
      .map((field: string) => {
        const value = fields[field];
        return value ? String(value).trim() : '';
      })
      .filter((text: string) => text.length > 0)
      .join(' ');
  }

  private formatVectorForPostgres(vector: number[] | undefined): string | null {
    if (!vector) return null;
    return `[${vector.join(',')}]`;
  }

  private validateFilter(filter: Record<string, any>) {
    for (const field of Object.keys(filter)) {
      if (!this.model.fields[field]) {
        throw new Error(`Invalid filter field: '${field}' does not exist in model definition`);
      }
    }
  }

  async createRecord(input: CreateDataRecordInput): Promise<DataRecord> {
    if (!input) {
      throw new Error('Input is required');
    }

    // Filter out any system fields from input
    const { _id, _created_at, _updated_at, _vector, ...fields } = input;

    // Validate fields against model definition
    await this.validateFields(fields);

    let vector: number[] | undefined = undefined;
    // Generate embedding if enabled
    if (this.model.embedding?.enabled) {
      try {
        const text = this.getTextForEmbedding(fields);
        if (text) {
          console.log(`[Data] Generating embedding for text: ${text.slice(0, 50)}${text.length > 50 ? '...' : ''}`);
          vector = await this.embeddingService.generateEmbedding(text);
          console.log(`[Data] Generated vector of length ${vector.length}`);
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error during embedding';
        throw new Error(`Creation failed: ${message}`);
      }
    }

    const result = await executeQuery(
      `INSERT INTO model_data (id, model_id, owner_id, data, embedding)
       VALUES ($1, $2, $3, $4, $5::vector)
       RETURNING *`,
      [uuidv4(), this.model.id, this.model.owner_id, JSON.stringify(fields), this.formatVectorForPostgres(vector)]
    );

    return this.toClientRecord(result.rows[0]);
  }

  async getRecord(id: string): Promise<DataRecord> {
    const result = await executeQuery(
      'SELECT * FROM model_data WHERE id = $1 AND model_id = $2',
      [id, this.model.id]
    );

    if (result.rows.length === 0) {
      throw new Error('Record not found');
    }

    return this.toClientRecord(result.rows[0]);
  }

  async listRecords(query?: ListRecordsQuery): Promise<{ records: DataRecord[]; total: number }> {
    const { filter = {}, page = 1, limit = 10 } = query || {};
    const offset = (page - 1) * limit;

    // Build WHERE clause
    const whereClauses: string[] = ['model_id = $1'];
    const values: any[] = [this.model.id];
    let paramIndex = 2;

    // Handle different filter formats
    if (Array.isArray(filter)) {
      // Handle array of filter objects (complex format from UI)
      console.log('Processing array of filter objects:', filter);
      
      for (const filterItem of filter) {
        const { field, operator, value, conjunction } = filterItem;
        
        // Skip invalid filters
        if (!field || !operator) continue;
        
        // Validate field exists in model
        if (!this.model.fields[field]) {
          console.warn(`Skipping filter with invalid field: ${field}`);
          continue;
        }
        
        // Add conjunction if not the first filter
        if (whereClauses.length > 1 && conjunction) {
          // Replace the last AND with the specified conjunction
          const lastClause = whereClauses.pop();
          whereClauses.push(`${lastClause} ${conjunction.toUpperCase()}`);
        }
        
        // Process based on operator
        switch (operator) {
          case 'equals':
            whereClauses.push(`data->>$${paramIndex} = $${paramIndex + 1}`);
            values.push(field, value);
            paramIndex += 2;
            break;
          case 'notEquals':
            whereClauses.push(`data->>$${paramIndex} <> $${paramIndex + 1}`);
            values.push(field, value);
            paramIndex += 2;
            break;
          case 'contains':
            whereClauses.push(`data->>$${paramIndex} ILIKE $${paramIndex + 1}`);
            values.push(field, `%${value}%`);
            paramIndex += 2;
            break;
          case 'notContains':
            whereClauses.push(`data->>$${paramIndex} NOT ILIKE $${paramIndex + 1}`);
            values.push(field, `%${value}%`);
            paramIndex += 2;
            break;
          case 'startsWith':
            whereClauses.push(`data->>$${paramIndex} ILIKE $${paramIndex + 1}`);
            values.push(field, `${value}%`);
            paramIndex += 2;
            break;
          case 'endsWith':
            whereClauses.push(`data->>$${paramIndex} ILIKE $${paramIndex + 1}`);
            values.push(field, `%${value}`);
            paramIndex += 2;
            break;
          case 'gt':
            whereClauses.push(`(data->>$${paramIndex})::numeric > $${paramIndex + 1}`);
            values.push(field, value);
            paramIndex += 2;
            break;
          case 'gte':
            whereClauses.push(`(data->>$${paramIndex})::numeric >= $${paramIndex + 1}`);
            values.push(field, value);
            paramIndex += 2;
            break;
          case 'lt':
            whereClauses.push(`(data->>$${paramIndex})::numeric < $${paramIndex + 1}`);
            values.push(field, value);
            paramIndex += 2;
            break;
          case 'lte':
            whereClauses.push(`(data->>$${paramIndex})::numeric <= $${paramIndex + 1}`);
            values.push(field, value);
            paramIndex += 2;
            break;
          case 'isNull':
            whereClauses.push(`data->>$${paramIndex} IS NULL OR data->>$${paramIndex} = ''`);
            values.push(field);
            paramIndex += 1;
            break;
          case 'isNotNull':
            whereClauses.push(`data->>$${paramIndex} IS NOT NULL AND data->>$${paramIndex} <> ''`);
            values.push(field);
            paramIndex += 1;
            break;
          default:
            console.warn(`Unsupported operator: ${operator}, defaulting to equals`);
            whereClauses.push(`data->>$${paramIndex} = $${paramIndex + 1}`);
            values.push(field, value);
            paramIndex += 2;
        }
      }
    } else if (typeof filter === 'object') {
      // Handle simple key-value object format
      console.log('Processing simple key-value filter:', filter);
      
      // Validate filter against model fields
      this.validateFilter(filter);
      
      for (const [field, value] of Object.entries(filter)) {
        // Handle different filter operations based on value type or special operators
        if (value === null) {
          // Handle NULL checks
          whereClauses.push(`data->>$${paramIndex} IS NULL`);
          values.push(field);
          paramIndex += 1;
        } else if (typeof value === 'object' && value.operator) {
          // Handle complex filter objects with explicit operators
          switch (value.operator) {
            case 'equals':
              whereClauses.push(`data->>$${paramIndex} = $${paramIndex + 1}`);
              values.push(field, value.value);
              paramIndex += 2;
              break;
            case 'contains':
              whereClauses.push(`data->>$${paramIndex} ILIKE $${paramIndex + 1}`);
              values.push(field, `%${value.value}%`);
              paramIndex += 2;
              break;
            case 'startsWith':
              whereClauses.push(`data->>$${paramIndex} ILIKE $${paramIndex + 1}`);
              values.push(field, `${value.value}%`);
              paramIndex += 2;
              break;
            case 'endsWith':
              whereClauses.push(`data->>$${paramIndex} ILIKE $${paramIndex + 1}`);
              values.push(field, `%${value.value}`);
              paramIndex += 2;
              break;
            // Add more operators as needed
            default:
              // Default to equality for unknown operators
              whereClauses.push(`data->>$${paramIndex} = $${paramIndex + 1}`);
              values.push(field, value.value);
              paramIndex += 2;
          }
        } else {
          // Simple equality check (default behavior)
          whereClauses.push(`data->>$${paramIndex} = $${paramIndex + 1}`);
          values.push(field, value);
          paramIndex += 2;
        }
      }
    }

    console.log('Final WHERE clause:', whereClauses.join(' AND '));
    console.log('Query parameters:', values);

    try {
      // Get total count
      const countQuery = `SELECT COUNT(*) FROM model_data WHERE ${whereClauses.join(' AND ')}`;
      const countResult = await executeQuery(countQuery, values);
      const total = parseInt(countResult.rows[0].count, 10);

      // Get paginated results
      const dataQuery = `
        SELECT * FROM model_data 
        WHERE ${whereClauses.join(' AND ')}
        ORDER BY created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      const dataValues = [...values, limit, offset];
      
      const result = await executeQuery(dataQuery, dataValues);

      return {
        records: result.rows.map(row => this.toClientRecord(row)),
        total
      };
    } catch (error) {
      throw new Error(`Failed to list records: ${error instanceof Error ? error.message : error}`);
    }
  }

  async updateRecord(id: string, input: UpdateDataRecordInput): Promise<DataRecord> {
    if (!input) {
      throw new Error('Input is required');
    }

    // Validate fields against model definition
    await this.validateFields(input);

    // Get existing record
    const existingRecord = await this.getRecord(id);
    if (!existingRecord) {
      throw new Error('Record not found');
    }

    let vector: number[] | undefined = undefined;
    // Update embedding if enabled
    if (this.model.embedding?.enabled) {
      try {
        const text = this.getTextForEmbedding(input);
        if (text) {
          console.log(`[Data] Updating embedding for text: ${text.slice(0, 50)}${text.length > 50 ? '...' : ''}`);
          vector = await this.embeddingService.generateEmbedding(text);
          console.log(`[Data] Updated vector of length ${vector.length}`);
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error during embedding';
        throw new Error(`Update failed: ${message}`);
      }
    }

    const result = await executeQuery(
      `UPDATE model_data 
       SET data = $1, embedding = $2::vector, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND model_id = $4
       RETURNING *`,
      [JSON.stringify(input), this.formatVectorForPostgres(vector), id, this.model.id]
    );

    if (result.rows.length === 0) {
      throw new Error('Update failed');
    }

    return this.toClientRecord(result.rows[0]);
  }

  async deleteRecord(id: string): Promise<void> {
    const result = await executeQuery(
      'DELETE FROM model_data WHERE id = $1 AND model_id = $2',
      [id, this.model.id]
    );

    if (result.rowCount === 0) {
      throw new Error('Record not found or delete failed');
    }
  }

  async clearData(): Promise<void> {
    try {
      const result = await executeQuery(
        'DELETE FROM model_data WHERE model_id = $1',
        [this.model.id]
      );
      console.log(`[Data] Cleared ${result.rowCount} records from model ${this.model.name}`);
    } catch (error) {
      console.error('[Data] Failed to clear data:', error);
      throw error;
    }
  }

  async searchSimilar(
    query: string,
    limit: number = 10,
    minSimilarity: number = 0.7
  ): Promise<DataRecord[]> {
    if (!this.model.embedding?.enabled) {
      throw new Error('Vector search is not enabled for this model');
    }

    console.log('[Search] Searching for:', query.slice(0, 50) + (query.length > 50 ? '...' : ''));

    try {
      // Generate query embedding
      const queryEmbedding = await this.embeddingService.generateEmbedding(query);
      console.log(`[Search] Generated query embedding of length ${queryEmbedding.length}`);

      // Perform the similarity search
      const results = await executeQuery(
        `SELECT *, 
                1 - (embedding <=> $1::vector) as similarity
         FROM model_data
         WHERE model_id = $2
           AND embedding IS NOT NULL
           AND 1 - (embedding <=> $1::vector) >= $3
         ORDER BY similarity DESC
         LIMIT $4`,
        [
          this.formatVectorForPostgres(queryEmbedding),
          this.model.id,
          minSimilarity,
          limit
        ]
      );

      console.log(`[Search] Found ${results.rows.length} results with similarity >= ${minSimilarity}`);
      
      return results.rows.map(row => ({
        ...this.toClientRecord(row),
        similarity: row.similarity
      }));
    } catch (error) {
      console.error('[Search] Failed to perform search:', error);
      throw error;
    }
  }

  async searchRecords(
    modelId: string,
    embedding: number[],
    limit: number = 10,
    minSimilarity: number = 0.7
  ): Promise<SearchResult[]> {
    const tableName = `data_${modelId}`;
    try {
      const results = await vectorSimilaritySearch(
        tableName,
        embedding,
        limit,
        minSimilarity
      );
      return results.map(row => ({
        _id: row.id,
        _created_at: new Date(row.created_at),
        _updated_at: new Date(row.updated_at),
        id: row.id,
        data: row.data,
        similarity: row.similarity
      }));
    } catch (error) {
      console.error('Failed to search records:', error);
      throw error;
    }
  }
} 