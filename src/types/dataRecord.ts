import { z } from 'zod';
import { ObjectId } from 'mongodb';

// Base fields that every record has (system fields prefixed with _)
export const BaseRecordFields = z.object({
  _id: z.instanceof(ObjectId),
  _created_at: z.date(),
  _updated_at: z.date(),
  _vector: z.array(z.number()).optional(),
});

// Dynamic fields are validated at runtime based on model definition
export const DynamicFields = z.object({}).catchall(z.any());

// Complete data record schema combines base fields with dynamic fields
export const DataRecordSchema = BaseRecordFields.merge(DynamicFields);

// Schema for creating a new record (without system-generated fields)
export const CreateDataRecordInput = z.object({}).catchall(z.any());

// Schema for updating an existing record
export const UpdateDataRecordInput = z.object({}).catchall(z.any());

// Query parameters for listing records
export const ListRecordsQuery = z.object({
  filter: z.record(z.string(), z.any()).optional(),
  include: z.array(z.string()).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

// Types derived from schemas
export interface DataRecord {
  _id: string;
  _created_at: Date;
  _updated_at: Date;
  _vector?: number[];
  [key: string]: any;
}

export type CreateDataRecordInput = z.infer<typeof CreateDataRecordInput>;

export type UpdateDataRecordInput = z.infer<typeof UpdateDataRecordInput>;

export type ListRecordsQuery = {
  filter?: Record<string, any>;
  include?: string[];
  page?: number;
  limit?: number;
};

export interface SearchResult extends DataRecord {
  similarity: number;
} 