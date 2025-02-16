import { MongoClient, ObjectId } from 'mongodb';
import { ModelDefinition } from '@/types/modelDefinition';
import { CreateDataRecordInput, DataRecord, ListRecordsQuery, UpdateDataRecordInput } from '@/types/dataRecord';
import { getDataMongoClient, ensureCollection } from '@/lib/db/dataDb';
import { EmbeddingService } from '@/lib/embeddings/embeddingService';

export class DataService {
  private client: MongoClient;
  private model: ModelDefinition;
  private embeddingService: EmbeddingService;

  constructor(model: ModelDefinition) {
    this.client = getDataMongoClient();
    this.model = model;
    this.embeddingService = new EmbeddingService(model);
    // No automatic collection initialization
  }

  // Add manual initialization method
  async initializeCollection(): Promise<void> {
    await ensureCollection(this.model.id);
  }

  private getCollectionName(): string {
    return `data_${this.model.id}`;
  }

  /**
   * Transform database record to client record
   */
  private toClientRecord(dbRecord: any): DataRecord {
    if (!dbRecord) return dbRecord;

    // Extract system fields and other fields
    const { _id, _created_at, _updated_at, _vector, ...fields } = dbRecord;

    // Return client format with flattened structure
    return {
      _id,
      _created_at: new Date(_created_at),
      _updated_at: new Date(_updated_at),
      _vector,
      ...fields
    };
  }

  /**
   * Transform client record to database record
   */
  private toDbRecord(clientRecord: Partial<DataRecord>): any {
    if (!clientRecord) return clientRecord;

    // Extract system fields and other fields
    const { _id, _created_at, _updated_at, _vector, ...fields } = clientRecord;

    // Return flattened database format
    return {
      _id,
      _created_at,
      _updated_at,
      _vector,
      ...fields
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
    // Ensure collection exists before creating record
    await this.initializeCollection();
    
    if (!input) {
      throw new Error('Input is required');
    }

    // Filter out any system fields from input
    const { _id, _created_at, _updated_at, _vector, ...fields } = input;

    // Validate fields against model definition
    await this.validateFields(fields);

    const now = new Date();
    const clientRecord: DataRecord = {
      _id: new ObjectId(),
      _created_at: now,
      _updated_at: now,
      ...fields
    };

    let vector: number[] | undefined = undefined;
    // Generate embedding first if enabled
    if (this.model.embedding?.enabled) {
      try {
        vector = await this.embeddingService.updateRecordEmbedding(clientRecord);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error during embedding';
        throw new Error(`Creation failed: ${message}`);
      }
    }

    // Only proceed with database insertion if embedding was successful or not required
    const dbRecord = this.toDbRecord({
      ...clientRecord,
      _vector: vector
    });
    
    const collection = this.client.db().collection(this.getCollectionName());
    await collection.insertOne(dbRecord);

    console.log('[Data] Record created, ID:', clientRecord._id);
    return {
      ...clientRecord,
      _vector: vector
    };
  }

  private excludeVectorData(record: any) {
    const { _vector, ...rest } = record;
    return rest;
  }

  async getRecord(id: string): Promise<DataRecord> {
    const collection = this.client.db().collection(this.getCollectionName());
    const record = await collection.findOne({ _id: new ObjectId(id) });

    if (!record) {
      throw new Error('Record not found');
    }

    return this.excludeVectorData(record);
  }

  async listRecords(query: ListRecordsQuery): Promise<{ records: DataRecord[]; total: number }> {
    const collection = this.client.db().collection(this.getCollectionName());
    const { filter = {}, page = 1, limit = 10 } = query;

    // Transform filters to work with flattened structure
    const finalFilter: Record<string, any> = {};

    // Handle filters directly since fields are at root level
    for (const [key, value] of Object.entries(filter)) {
      if (key === '_id') {
        finalFilter._id = typeof value === 'string' ? new ObjectId(value) : value;
      } else {
        finalFilter[key] = value;
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
      records: documents.map(doc => this.excludeVectorData(doc)),
      total 
    };
  }

  async updateRecord(id: string, input: UpdateDataRecordInput): Promise<DataRecord> {
    if (!input) {
      throw new Error('Input is required');
    }

    // Validate fields against model definition
    await this.validateFields(input);

    const collection = this.client.db().collection(this.getCollectionName());
    
    // First get the existing record
    const existingRecord = await collection.findOne({ _id: new ObjectId(id) });
    if (!existingRecord) {
      throw new Error('Record not found');
    }

    // Prepare the updated record
    const updatedRecord = {
      ...existingRecord,
      ...input,
      _updated_at: new Date(),
    };

    const clientRecord = this.toClientRecord(updatedRecord);

    let vector: number[] | undefined = undefined;
    // Update embedding first if enabled
    if (this.model.embedding?.enabled) {
      try {
        vector = await this.embeddingService.updateRecordEmbedding(clientRecord);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error during embedding';
        throw new Error(`Record update failed: ${message}`);
      }
    }

    // Only proceed with database update if embedding was successful or not required
    const finalRecord = {
      ...clientRecord,
      _vector: vector
    };

    const dbRecord = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: this.toDbRecord(finalRecord) },
      { returnDocument: 'after' }
    );

    if (!dbRecord) {
      throw new Error('Update failed');
    }

    return this.toClientRecord(dbRecord);
  }

  async deleteRecord(id: string): Promise<void> {
    const collection = this.client.db().collection(this.getCollectionName());
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      throw new Error('Record not found or delete failed');
    }
  }

  // Add this method to handle partial updates
  async partialUpdateRecord(id: string, input: Partial<UpdateDataRecordInput>): Promise<DataRecord> {
    if (!input) {
      throw new Error('Input is required');
    }

    // Validate fields against model definition
    await this.validateFields(input);

    const collection = this.client.db().collection(this.getCollectionName());
    const dbRecord = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...input,
          _updated_at: new Date(),
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
      try {
        await this.embeddingService.updateRecordEmbedding(clientRecord);
      } catch (error: unknown) {
        await collection.replaceOne({ _id: new ObjectId(id) }, this.toDbRecord(clientRecord));
        const message = error instanceof Error ? error.message : 'Unknown error during embedding';
        throw new Error(`Record update failed: ${message}`);
      }
    }

    return clientRecord;
  }

  // Add this method to handle upserts
  async upsertRecord(id: string | undefined, input: CreateDataRecordInput | UpdateDataRecordInput): Promise<DataRecord> {
    if (id) {
      return this.updateRecord(id, input as UpdateDataRecordInput);
    }
    return this.createRecord(input as CreateDataRecordInput);
  }
} 