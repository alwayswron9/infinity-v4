import { Collection } from 'mongodb';
import { connectToDatabase } from './mongodb';
import { ModelDefinition, CreateModelDefinitionInput, UpdateModelDefinitionInput } from '@/types/modelDefinition';
import { v4 as uuidv4 } from 'uuid';

const COLLECTION_NAME = 'model_definitions';

export class ModelsCollection {
  private collection?: Collection<ModelDefinition>;

  constructor() {
    this.init();
  }

  private async init() {
    const { db } = await connectToDatabase();
    this.collection = db.collection<ModelDefinition>(COLLECTION_NAME);
  }

  private async getCollection(): Promise<Collection<ModelDefinition>> {
    if (!this.collection) {
      const { db } = await connectToDatabase();
      this.collection = db.collection<ModelDefinition>(COLLECTION_NAME);
    }
    return this.collection;
  }

  async create(input: CreateModelDefinitionInput, ownerId: string): Promise<ModelDefinition> {
    const now = new Date();
    const modelDef: ModelDefinition = {
      ...input,
      id: uuidv4(),
      owner_id: ownerId,
      created_at: now,
      updated_at: now,
    };

    const collection = await this.getCollection();
    await collection.insertOne(modelDef);

    return modelDef;
  }

  async findById(id: string): Promise<ModelDefinition | null> {
    const collection = await this.getCollection();
    return collection.findOne({ id });
  }

  async findByOwnerId(ownerId: string): Promise<ModelDefinition[]> {
    const collection = await this.getCollection();
    return collection.find({ owner_id: ownerId }).toArray();
  }

  async update(id: string, input: UpdateModelDefinitionInput): Promise<ModelDefinition | null> {
    const collection = await this.getCollection();
    
    // Get the current model definition
    const currentModel = await this.findById(id);
    if (!currentModel) {
      return null;
    }

    const updatedModel = {
      ...currentModel,
      ...input,
      updated_at: new Date()
    };

    const result = await collection.findOneAndUpdate(
      { id },
      { $set: updatedModel },
      { returnDocument: 'after' }
    );

    return result;
  }

  async delete(id: string): Promise<boolean> {
    const model = await this.findById(id);
    if (!model) {
      return false;
    }

    const collection = await this.getCollection();
    const result = await collection.deleteOne({ id });

    return result.deletedCount === 1;
  }

  // Helper method to check if a model name is already taken by the same owner
  async isNameTaken(name: string, ownerId: string, excludeId?: string): Promise<boolean> {
    const collection = await this.getCollection();
    const query = {
      name,
      owner_id: ownerId,
      ...(excludeId && { id: { $ne: excludeId } })
    };
    
    const count = await collection.countDocuments(query);
    return count > 0;
  }
} 
