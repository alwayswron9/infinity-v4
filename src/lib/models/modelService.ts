import { ModelsCollection } from '../db/modelsCollection';
import { 
  ModelDefinition, 
  CreateModelDefinitionInput, 
  UpdateModelDefinitionInput,
  CreateModelDefinitionInput as CreateSchema,
  UpdateModelDefinitionInput as UpdateSchema
} from '@/types/modelDefinition';

export class ModelService {
  private collection: ModelsCollection;

  constructor() {
    this.collection = new ModelsCollection();
  }

  async createModelDefinition(input: CreateModelDefinitionInput, ownerId: string): Promise<ModelDefinition> {
    // Validate input against schema
    const validatedInput = CreateSchema.parse(input);

    // Check if model name is already taken by this owner
    const isNameTaken = await this.collection.isNameTaken(validatedInput.name, ownerId);
    if (isNameTaken) {
      throw new Error(`Model name '${validatedInput.name}' is already taken`);
    }

    // Validate field types and relationships
    this.validateFieldsAndRelationships(validatedInput);

    // Create the model definition
    return this.collection.create(validatedInput, ownerId);
  }

  async listModelDefinitions(ownerId: string): Promise<ModelDefinition[]> {
    return this.collection.findByOwnerId(ownerId);
  }

  async getModelDefinition(id: string): Promise<ModelDefinition> {
    const model = await this.collection.findById(id);
    if (!model) {
      throw new Error(`Model definition not found: ${id}`);
    }
    return model;
  }

  async updateModelDefinition(id: string, input: UpdateModelDefinitionInput, ownerId: string): Promise<ModelDefinition> {
    // Validate input against schema
    const validatedInput = UpdateSchema.parse(input);

    // Get existing model
    const existingModel = await this.getModelDefinition(id);
    
    // Verify ownership
    if (existingModel.owner_id !== ownerId) {
      throw new Error('Unauthorized to update this model definition');
    }

    // Check if new name is taken (if name is being updated)
    if (validatedInput.name && validatedInput.name !== existingModel.name) {
      const isNameTaken = await this.collection.isNameTaken(validatedInput.name, ownerId, id);
      if (isNameTaken) {
        throw new Error(`Model name '${validatedInput.name}' is already taken`);
      }
    }

    // Validate field types and relationships if they're being updated
    if (validatedInput.fields || validatedInput.relationships) {
      this.validateFieldsAndRelationships({
        ...existingModel,
        ...validatedInput
      });
    }

    // Update the model
    const updated = await this.collection.update(id, validatedInput);
    if (!updated) {
      throw new Error(`Failed to update model definition: ${id}`);
    }

    return updated;
  }

  async deleteModelDefinition(id: string, ownerId: string): Promise<void> {
    // Get existing model
    const model = await this.getModelDefinition(id);
    
    // Verify ownership
    if (model.owner_id !== ownerId) {
      throw new Error('Unauthorized to delete this model definition');
    }

    // Delete the model
    const success = await this.collection.delete(id);
    if (!success) {
      throw new Error(`Failed to delete model definition: ${id}`);
    }
  }

  private validateFieldsAndRelationships(input: CreateModelDefinitionInput | ModelDefinition) {
    // Validate that all field types are supported
    Object.entries(input.fields).forEach(([fieldName, field]) => {
      if (!['string', 'number', 'boolean', 'date'].includes(field.type)) {
        throw new Error(`Unsupported field type '${field.type}' for field '${fieldName}'`);
      }
    });

    // Validate relationships if present
    if (input.relationships) {
      Object.entries(input.relationships).forEach(([relationName, relation]) => {
        // Ensure the referenced field exists in the model
        const referencedField = input.fields[relation.foreign_key.field_id];
        if (!referencedField) {
          throw new Error(`Invalid foreign key reference in relationship '${relationName}': field '${relation.foreign_key.field_id}' does not exist`);
        }
      });
    }

    // Validate embedding configuration if present
    if (input.embedding) {
      // Validate enabled flag
      if (typeof input.embedding.enabled !== 'boolean') {
        throw new Error('Embedding enabled flag must be a boolean');
      }

      // If enabled, validate source fields
      if (input.embedding.enabled) {
        if (!Array.isArray(input.embedding.source_fields)) {
          throw new Error('Embedding source_fields must be an array');
        }

        if (input.embedding.source_fields.length === 0) {
          throw new Error('At least one source field must be specified when embedding is enabled');
        }

        // Validate each source field
        input.embedding.source_fields.forEach(fieldName => {
          const field = input.fields[fieldName];
          if (!field) {
            throw new Error(`Invalid embedding source field: '${fieldName}' does not exist`);
          }
          if (field.type !== 'string') {
            throw new Error(`Invalid embedding source field: '${fieldName}' must be a string field`);
          }
        });
      }
    }
  }
} 