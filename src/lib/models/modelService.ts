import { executeQuery } from '../db/postgres';
import { 
  ModelDefinition, 
  CreateModelDefinitionInput, 
  UpdateModelDefinitionInput,
  CreateModelDefinitionInput as CreateSchema,
  UpdateModelDefinitionInput as UpdateSchema,
  FieldDefinition,
  RelationshipDefinition,
  IndexDefinition
} from '@/types/modelDefinition';
import { v4 as uuidv4 } from 'uuid';

// Define the database row type
interface ModelDefinitionRow {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  fields: Record<string, FieldDefinition>;
  relationships: Record<string, RelationshipDefinition> | null;
  indexes: Record<string, IndexDefinition> | null;
  embedding: { enabled: boolean; source_fields: string[] } | null;
  status: string | null;
  created_at: Date;
  updated_at: Date;
}

// Add these type definitions
interface ModelField {
  type: string;
  // Add other field properties as needed
}

interface ModelRelationship {
  foreign_key: {
    field_id: string;
  };
  // Add other relationship properties as needed
}

// SQL to create the model_definitions table
const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS model_definitions (
    id UUID PRIMARY KEY,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    fields JSONB NOT NULL,
    relationships JSONB,
    indexes JSONB,
    embedding JSONB,
    status VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    UNIQUE(owner_id, name)
  );

  -- Create indexes for common queries
  CREATE INDEX IF NOT EXISTS model_definitions_owner_id_idx ON model_definitions(owner_id);
  CREATE INDEX IF NOT EXISTS model_definitions_name_idx ON model_definitions(name);
`;

export class ModelService {
  constructor() {
    this.init();
  }

  private async init() {
    await executeQuery(CREATE_TABLE_SQL);
  }

  async createModelDefinition(input: CreateModelDefinitionInput, ownerId: string): Promise<ModelDefinition> {
    // Validate input against schema
    const validatedInput = CreateSchema.parse(input);

    // Check if model name is already taken by this owner
    const isNameTaken = await this.isNameTaken(validatedInput.name, ownerId);
    if (isNameTaken) {
      throw new Error(`Model name '${validatedInput.name}' is already taken`);
    }

    // Validate field types and relationships
    this.validateModel(validatedInput);

    const now = new Date();
    const modelDef: ModelDefinition = {
      ...validatedInput,
      id: uuidv4(),
      owner_id: ownerId,
      created_at: now,
      updated_at: now,
    };

    const sql = `
      INSERT INTO model_definitions (
        id, owner_id, name, description, fields, relationships, indexes, embedding, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
      ) RETURNING *;
    `;

    const values = [
      modelDef.id,
      modelDef.owner_id,
      modelDef.name,
      modelDef.description,
      JSON.stringify(modelDef.fields),
      modelDef.relationships ? JSON.stringify(modelDef.relationships) : null,
      modelDef.indexes ? JSON.stringify(modelDef.indexes) : null,
      modelDef.embedding ? JSON.stringify(modelDef.embedding) : null,
      modelDef.created_at,
      modelDef.updated_at
    ];

    const result = await executeQuery(sql, values);
    return this.mapRowToModel(result.rows[0]);
  }

  async listModelDefinitions(ownerId: string): Promise<ModelDefinition[]> {
    const sql = 'SELECT * FROM model_definitions WHERE owner_id = $1 ORDER BY created_at DESC;';
    const result = await executeQuery(sql, [ownerId]);
    return result.rows.map(row => this.mapRowToModel(row));
  }

  async getModelDefinition(id: string): Promise<ModelDefinition> {
    const sql = 'SELECT * FROM model_definitions WHERE id = $1;';
    const result = await executeQuery(sql, [id]);
    
    if (result.rows.length === 0) {
      throw new Error(`Model definition not found: ${id}`);
    }

    return this.mapRowToModel(result.rows[0]);
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
      const isNameTaken = await this.isNameTaken(validatedInput.name, ownerId, id);
      if (isNameTaken) {
        throw new Error(`Model name '${validatedInput.name}' is already taken`);
      }
    }

    // Validate field types and relationships if they're being updated
    if (validatedInput.fields || validatedInput.relationships) {
      this.validateModel({
        ...existingModel,
        ...validatedInput
      });
    }

    const updatedModel = {
      ...existingModel,
      ...validatedInput,
      updated_at: new Date()
    };

    const sql = `
      UPDATE model_definitions 
      SET 
        name = $1,
        description = $2,
        fields = $3,
        relationships = $4,
        indexes = $5,
        embedding = $6,
        updated_at = $7
      WHERE id = $8 AND owner_id = $9
      RETURNING *;
    `;

    const values = [
      updatedModel.name,
      updatedModel.description,
      JSON.stringify(updatedModel.fields),
      updatedModel.relationships ? JSON.stringify(updatedModel.relationships) : null,
      updatedModel.indexes ? JSON.stringify(updatedModel.indexes) : null,
      updatedModel.embedding ? JSON.stringify(updatedModel.embedding) : null,
      updatedModel.updated_at,
      id,
      ownerId
    ];

    const result = await executeQuery(sql, values);
    
    if (result.rows.length === 0) {
      throw new Error(`Failed to update model definition: ${id}`);
    }

    return this.mapRowToModel(result.rows[0]);
  }

  async deleteModelDefinition(id: string, ownerId: string): Promise<void> {
    // Get existing model
    const model = await this.getModelDefinition(id);
    
    // Verify ownership
    if (model.owner_id !== ownerId) {
      throw new Error('Unauthorized to delete this model definition');
    }

    const sql = 'DELETE FROM model_definitions WHERE id = $1 AND owner_id = $2;';
    const result = await executeQuery(sql, [id, ownerId]);

    if (result.rowCount === 0) {
      throw new Error(`Failed to delete model definition: ${id}`);
    }
  }

  async validateCrudOperation(modelId: string, ownerId: string): Promise<ModelDefinition> {
    const model = await this.getModelDefinition(modelId);
    
    if (model.owner_id !== ownerId) {
      throw new Error('Unauthorized to perform this operation');
    }

    return model;
  }

  async getModelDefinitionByName(name: string, ownerId: string): Promise<ModelDefinition> {
    const sql = 'SELECT * FROM model_definitions WHERE name = $1 AND owner_id = $2;';
    const result = await executeQuery(sql, [name, ownerId]);
    
    if (result.rows.length === 0) {
      throw new Error(`Model definition not found with name: ${name}`);
    }

    return this.mapRowToModel(result.rows[0]);
  }

  private async isNameTaken(name: string, ownerId: string, excludeId?: string): Promise<boolean> {
    let sql = 'SELECT COUNT(*) FROM model_definitions WHERE name = $1 AND owner_id = $2';
    const values = [name, ownerId];

    if (excludeId) {
      sql += ' AND id != $3';
      values.push(excludeId);
    }

    const result = await executeQuery(sql, values);
    return parseInt(result.rows[0].count) > 0;
  }

  private validateModel(input: CreateModelDefinitionInput) {
    // Validate that all field types are supported
    Object.entries(input.fields).forEach(([fieldName, field]: [string, ModelField]) => {
      if (!['string', 'number', 'boolean', 'date'].includes(field.type)) {
        throw new Error(`Unsupported field type '${field.type}' for field '${fieldName}'`);
      }
    });

    // Validate relationships if they exist
    if (input.relationships) {
      Object.entries(input.relationships).forEach(([relationName, relation]: [string, ModelRelationship]) => {
        const referencedField = input.fields[relation.foreign_key.field_id];
        if (!referencedField) {
          throw new Error(
            `Invalid foreign key reference in relationship '${relationName}': ` +
            `field '${relation.foreign_key.field_id}' does not exist`
          );
        }
      });
    }

    // Validate embedding source fields
    if (input.embedding?.enabled) {
      input.embedding.source_fields.forEach((fieldName: string) => {
        const field = input.fields[fieldName];
        if (!field) {
          throw new Error(`Invalid embedding source field: '${fieldName}' does not exist`);
        }
      });
    }
  }

  private mapRowToModel(row: ModelDefinitionRow): ModelDefinition {
    return {
      id: row.id,
      owner_id: row.owner_id,
      name: row.name,
      description: row.description || undefined,
      fields: row.fields,
      relationships: row.relationships || undefined,
      indexes: row.indexes || undefined,
      embedding: row.embedding || undefined,
      status: row.status || 'active',
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }

  async createModel(definition: ModelDefinition) {
    try {
      await executeQuery(
        `INSERT INTO model_definitions 
         (id, name, description, fields, owner_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
        [
          definition.id,
          definition.name,
          definition.description,
          JSON.stringify(definition.fields),
          definition.owner_id
        ]
      );
    } catch (error) {
      console.error('Failed to create model:', error);
      throw error;
    }
  }

  async archiveModel(id: string, ownerId: string): Promise<void> {
    try {
      // Verify ownership and archive the model
      await executeQuery(
        `UPDATE model_definitions 
         SET status = 'archived'
         WHERE id = $1 AND owner_id = $2`,
        [id, ownerId]
      );

      // Archive associated data
      await executeQuery(
        `UPDATE model_data 
         SET status = 'archived'
         WHERE model_id = $1`,
        [id]
      );
    } catch (error) {
      console.error('Failed to archive model:', error);
      throw error;
    }
  }

  async restoreModel(id: string, ownerId: string): Promise<void> {
    try {
      await executeQuery(
        `UPDATE model_definitions 
         SET status = 'active'
         WHERE id = $1 AND owner_id = $2`,
        [id, ownerId]
      );

      await executeQuery(
        `UPDATE model_data 
         SET status = 'active'
         WHERE model_id = $1`,
        [id]
      );
    } catch (error) {
      console.error('Failed to restore model:', error);
      throw error;
    }
  }
} 