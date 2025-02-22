import { z } from 'zod';

// Basic field types supported in MVP
export const FieldType = z.enum(['string', 'number', 'boolean', 'date', 'vector']);
export type FieldType = z.infer<typeof FieldType>;

// Type for user-creatable fields (excluding vector type)
export const CreatableFieldType = z.enum(['string', 'number', 'boolean', 'date']);
export type CreatableFieldType = z.infer<typeof CreatableFieldType>;

// Foreign key reference schema
export const ForeignKeyReference = z.object({
  references: z.object({
    model_id: z.string().uuid(),
    field_id: z.string().uuid()
  })
});
export type ForeignKeyReference = z.infer<typeof ForeignKeyReference>;

// Field definition schema for all fields (including system-managed vector fields)
export const FieldDefinition = z.object({
  id: z.string().uuid(),
  type: FieldType,
  required: z.boolean().optional(),
  unique: z.boolean().optional(),
  default: z.any().optional(),
  enum: z.array(z.any()).optional(),
  description: z.string().optional(),
  foreign_key: ForeignKeyReference.optional()
});
export type FieldDefinition = z.infer<typeof FieldDefinition>;

// Field definition for user-created fields (excluding vector type)
export const CreatableFieldDefinition = z.object({
  id: z.string().uuid(),
  type: CreatableFieldType,
  required: z.boolean().optional(),
  unique: z.boolean().optional(),
  default: z.any().optional(),
  enum: z.array(z.any()).optional(),
  description: z.string().optional(),
  foreign_key: ForeignKeyReference.optional()
});
export type CreatableFieldDefinition = z.infer<typeof CreatableFieldDefinition>;

// Relationship definition schema
export const RelationshipDefinition = z.object({
  id: z.string().uuid(),
  target_model_id: z.string().uuid(),
  foreign_key: z.object({
    field_id: z.string().uuid()
  }),
  onDelete: z.enum(['cascade', 'setNull', 'restrict']).optional(),
  onUpdate: z.enum(['cascade', 'setNull', 'restrict']).optional()
});
export type RelationshipDefinition = z.infer<typeof RelationshipDefinition>;

// Index definition schema
export const IndexDefinition = z.object({
  fields: z.array(z.string()),
  unique: z.boolean().optional()
});
export type IndexDefinition = z.infer<typeof IndexDefinition>;

// Embedding configuration schema
export const EmbeddingConfig = z.object({
  enabled: z.boolean(),
  source_fields: z.array(z.string())
});
export type EmbeddingConfig = z.infer<typeof EmbeddingConfig>;

// Complete model definition schema (includes system-managed fields)
export const ModelDefinition = z.object({
  id: z.string().uuid(),
  owner_id: z.string().uuid(),
  name: z.string().min(1).regex(/^[a-zA-Z0-9-]+$/, 'Model name can only contain letters, numbers, and hyphens'),
  description: z.string().optional(),
  fields: z.record(z.string(), FieldDefinition),
  relationships: z.record(z.string(), RelationshipDefinition).optional(),
  indexes: z.record(z.string(), IndexDefinition).optional(),
  embedding: EmbeddingConfig.optional(),
  status: z.enum(['active', 'archived']).default('active'),
  created_at: z.date(),
  updated_at: z.date()
});
export type ModelDefinition = z.infer<typeof ModelDefinition>;

// Schema for creating a new model definition (without system-generated fields)
export const CreateModelDefinitionInput = z.object({
  name: z.string().min(1).regex(/^[a-zA-Z0-9-]+$/, 'Model name can only contain letters, numbers, and hyphens'),
  description: z.string().optional(),
  fields: z.record(z.string(), CreatableFieldDefinition),
  relationships: z.record(z.string(), RelationshipDefinition).optional(),
  indexes: z.record(z.string(), IndexDefinition).optional(),
  embedding: EmbeddingConfig.optional()
});
export type CreateModelDefinitionInput = z.infer<typeof CreateModelDefinitionInput>;

// Schema for updating an existing model definition
export const UpdateModelDefinitionInput = CreateModelDefinitionInput.partial();
export type UpdateModelDefinitionInput = z.infer<typeof UpdateModelDefinitionInput>;

export interface ModelDefinition {
  id: string; // UUID
  name: string;
  description?: string;
  fields: Record<string, FieldDefinition>;
  relationships?: Record<string, RelationshipDefinition>;
  indexes?: Record<string, IndexDefinition>;
  embedding?: { enabled: boolean; source_fields: string[] };
  owner_id: string; // UUID
  status: 'active' | 'archived';
  created_at: Date;
  updated_at: Date;
} 