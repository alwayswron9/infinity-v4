import { z } from 'zod';
import { ObjectId } from 'mongodb';

// Base fields that every record has
export const BaseRecordFields = z.object({
  _id: z.instanceof(ObjectId),
  created_at: z.date(),
  updated_at: z.date(),
  _vector: z.array(z.number()).optional(),
  fields: z.record(z.string(), z.any())
});

// Dynamic fields are validated at runtime based on model definition
export const DynamicFields = z.record(z.string(), z.any());

// Complete data record schema
export const DataRecordSchema = BaseRecordFields;

// Schema for creating a new record (without system-generated fields)
export const CreateDataRecordInput = z.object({
  fields: DynamicFields,
});

// Schema for updating an existing record
export const UpdateDataRecordInput = z.object({
  fields: DynamicFields,
});

// Query parameters for listing records
export const ListRecordsQuery = z.object({
  filter: z.record(z.string(), z.any()).optional(),
  include: z.array(z.string()).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

// Types derived from schemas
export type DataRecord = {
  _id: ObjectId;
  created_at: Date;
  updated_at: Date;
  _vector?: number[];
  fields: Record<string, any>;
};

export type CreateDataRecordInput = {
  fields: Record<string, any>;
};

export type UpdateDataRecordInput = {
  fields: Record<string, any>;
};

export type ListRecordsQuery = {
  filter?: Record<string, any>;
  include?: string[];
  page?: number;
  limit?: number;
}; 