import { MongoClient, ObjectId } from 'mongodb';
import { ModelDefinition } from '@/types/modelDefinition';
import { CreateDataRecordInput, DataRecord, ListRecordsQuery, UpdateDataRecordInput } from '@/types/dataRecord';
import { getMongoClient } from '@/lib/db/mongodb';
import { EmbeddingService } from '@/lib/embeddings/embeddingService';

export class DataService {
  private client: MongoClient;
  private model: ModelDefinition;
  private embeddingService: EmbeddingService;

  constructor(model: ModelDefinition) {
    this.client = getMongoClient();
    this.model = model;
    this.embeddingService = new EmbeddingService(model);
  }

  private getCollectionName(): string {
    return 'data';
  }

  /**
   * Transform database record to client record
   */
  private toClientRecord(dbRecord: any): DataRecord {
    if (!dbRecord) return dbRecord;

    // Extract system fields
    const { _id, created_at, updated_at, _vector, model_id, fields } = dbRecord;

    // Return client format
    return {
        _id,
        fields,
        created_at: new Date(created_at),
        updated_at: new Date(updated_at),
        _vector
    };
  }

  /**
   * Transform client record to database record
   */
  private toDbRecord(clientRecord: Partial<DataRecord>): any {
    if (!clientRecord) return clientRecord;

    // Keep fields nested under fields object
    const { fields, ...systemFields } = clientRecord;
    return {
        ...systemFields,
        model_id: this.model.id,
        fields
    };
  }

  private async validateFields(fields: Record<string, any>): Promise<void> {
    // Validate required fields
    for (const [fieldName, fieldDef] of Object.entries(this.model.fields)) {
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
          case 'vector':
            if (!Array.isArray(value) || !value.every(n => typeof n === 'number')) {
              throw new Error(`Field ${fieldName} must be an array of numbers`);
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

  async createRecord(input: CreateDataRecordInput): Promise<DataRecord> {
    if (!input.fields) {
      throw new Error('Fields object is required');
    }

    // Validate fields against model definition
    await this.validateFields(input.fields);

    const now = new Date();
    const clientRecord: DataRecord = {
      _id: new ObjectId(),
      fields: input.fields,
      created_at: now,
      updated_at: now,
      _vector: this.model.embedding?.enabled ? new Array(1536).fill(0) : undefined
    };

    const dbRecord = this.toDbRecord(clientRecord);
    const collection = this.client.db().collection(this.getCollectionName());
    await collection.insertOne(dbRecord);

    // Generate embedding if needed
    if (this.model.embedding?.enabled) {
      await this.embeddingService.updateRecordEmbedding(clientRecord);
    }

    return clientRecord;
  }

  async getRecord(id: string): Promise<DataRecord> {
    const collection = this.client.db().collection(this.getCollectionName());
    const record = await collection.findOne({ _id: new ObjectId(id) });

    if (!record) {
      throw new Error('Record not found');
    }

    return this.toClientRecord(record);
  }

  async listRecords(query: ListRecordsQuery): Promise<{ records: DataRecord[]; total: number }> {
    const collection = this.client.db().collection(this.getCollectionName());
    const { filter = {}, page = 1, limit = 10 } = query;

    // Transform field filters to use fields prefix
    const finalFilter: Record<string, any> = {
        model_id: this.model.id
    };

    // Move field filters under the fields object
    if (Object.keys(filter).length > 0) {
        const fieldFilters: Record<string, any> = {};
        for (const [key, value] of Object.entries(filter)) {
            if (key === '_id') {
                finalFilter._id = typeof value === 'string' ? new ObjectId(value) : value;
            } else {
                fieldFilters[key] = value;
            }
        }
        if (Object.keys(fieldFilters).length > 0) {
            finalFilter.fields = fieldFilters;
        }
    }

    const [documents, total] = await Promise.all([
        collection
            .find(finalFilter)
            .skip((page - 1) * limit)
            .limit(limit)
            .toArray(),
        collection.countDocuments(finalFilter),
    ]);

    return { 
        records: documents.map(doc => this.toClientRecord(doc)),
        total 
    };
  }

  async updateRecord(id: string, input: UpdateDataRecordInput): Promise<DataRecord> {
    if (!input.fields) {
        throw new Error('Fields object is required');
    }

    // Validate fields against model definition
    await this.validateFields(input.fields);

    const collection = this.client.db().collection(this.getCollectionName());
    const dbRecord = await collection.findOneAndUpdate(
        { _id: new ObjectId(id), model_id: this.model.id },
        {
            $set: {
                fields: input.fields,
                updated_at: new Date(),
            },
        },
        { returnDocument: 'after' }
    );

    if (!dbRecord) {
        throw new Error('Record not found or update failed');
    }

    const clientRecord = this.toClientRecord(dbRecord);

    // Update embedding if needed
    if (this.model.embedding?.enabled) {
        await this.embeddingService.updateRecordEmbedding(clientRecord);
    }

    return clientRecord;
  }

  async deleteRecord(id: string): Promise<void> {
    const collection = this.client.db().collection(this.getCollectionName());
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      throw new Error('Record not found or delete failed');
    }
  }
} 