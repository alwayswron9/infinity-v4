# Model Definitions Module Implementation Plan

## Overview
This module provides the foundation for creating, managing, and updating dynamic data model schemas at runtime. It allows users to specify metadata such as the model's name, description, fields, relationships, indexes, and embedding configuration. The design strictly follows the guidelines in [04-system-design.md](../04-system-design.md) and deliberately excludes advanced features detailed in [02-out-of-scope.md](../02-out-of-scope.md) (e.g., custom field types, computed fields, complex relationship constraints, and advanced vector capabilities).

Key MVP assumptions:
- Only basic data types (string, number, boolean, date, vector) are supported.
- Relationships are limited to simple foreign key references (hasOne, hasMany, belongsTo).
- Embedding functionality is minimal: enable/disable with a list of source fields.
- No advanced validations, computed fields, or dynamic migrations.

**NOTE:** All implementations must strictly adhere to the technical specifications in [04-system-design.md](../04-system-design.md) and must not include any advanced features outlined in [02-out-of-scope.md](../02-out-of-scope.md).

## Directory Structure

- **src/app/api/models/**
  - **route.ts**: API endpoint handler for CRUD operations on model definitions.

- **lib/models/**
  - **modelService.ts**: Contains business logic for processing model definitions (validation, transformation, and calling the DB layer).

- **types/**
  - **modelDefinition.ts**: TypeScript interfaces that define the structure of a model definition, field definitions, relationship definitions, and optional indexing configurations.

- **lib/db/**
  - **modelsCollection.ts**: Abstraction layer for MongoDB operations on the model definitions collection, handling insert, read, update, and delete actions.

## File Details and Responsibilities

### 1. src/app/api/models/route.ts
- **Responsibilities:**
  - Handle HTTP requests for model definitions.
    - **POST**: Create a new model definition. Validate request payload using Zod (or similar) against types in `types/modelDefinition.ts`.
    - **GET**: Retrieve model definitions. Return all definitions or a specific one if an ID is provided via query parameters.
    - **PUT**: Update an existing model definition by ID. Ensure only mutable fields are updated and reject out-of-scope modifications.
    - **DELETE**: Remove a model definition by ID.
  - Provide consistent response formats (success/error structures) as outlined in [04-system-design.md](../04-system-design.md).
  - Integrate error logging (using functions from lib/api/logging.ts) and basic auth checks.
  - **Constraints:** Keep under 150 lines by delegating business logic to `modelService.ts`.

### 2. lib/models/modelService.ts
- **Responsibilities:**
  - Implement core business logic functions:
    - `createModelDefinition(data)`: Validate input data (ensure allowed field types are used, e.g., 'string', 'number', 'boolean', 'date', 'vector'). Reject advanced types not mentioned in the MVP.
    - `listModelDefinitions()`: Return all model definitions from the database.
    - `getModelDefinition(id)`: Fetch a specific model definition by its ID.
    - `updateModelDefinition(id, data)`: Validate and apply updates, ensuring immutable fields (like id, owner_id) are unchanged.
    - `deleteModelDefinition(id)`: Remove the model definition record.
  - Enforce rules:
    - Fields must use only supported basic types.
    - Embedding configuration should consist only of a boolean flag and an array of source field names.
  - Use logging for any error conditions and pass errors to the API layer for client responses.
  - **Constraints:** Maintain simplicity and modularity, ensuring each function is concise (<150 lines total within the file).

### 3. types/modelDefinition.ts
- **Responsibilities:** Provide clear TypeScript interfaces for data consistency:
  - **ModelDefinition**:
    - `id: string` (UUID v4)
    - `owner_id: string`
    - `name: string` (required)
    - `description?: string`
    - `fields: Record<string, FieldDefinition>`
    - `relationships: Record<string, RelationshipDefinition>`
    - `indexes?: Record<string, IndexDefinition>`
    - `embedding?: { enabled: boolean; source_fields: string[] }`
  - **FieldDefinition**:
    - `id: string`
    - `type: string` (allowed: 'string', 'number', 'boolean', 'date', 'vector')
    - `required?: boolean`
    - `unique?: boolean`
    - `default?: any`
    - `enum?: any[]`
    - `description?: string`
    - `foreign_key?: { references: { model_id: string; field_id: string } }`
  - **RelationshipDefinition**:
    - `id: string`
    - **Note:** In the MVP, relationships are implemented solely based on a simple foreign key reference. No additional relationship types (such as hasOne, hasMany, or belongsTo) are supported.
    - `target_model_id: string`  // The ID of the related model
    - `foreign_key: { field_id: string }`  // The field in the current model that references the related model's primary key
    - `onDelete?: 'cascade' | 'setNull' | 'restrict'`
    - `onUpdate?: 'cascade' | 'setNull' | 'restrict'`
  - **IndexDefinition** (if applicable): Defines indexing on fields to optimize query performance.
- Include inline comments explaining each field and how they align with the system design choices.
- **Constraints:** Keep file concise and self-contained.

### 4. lib/db/modelsCollection.ts
- **Responsibilities:** Abstract MongoDB interactions:
  - `insertModelDefinition(modelDef)`: Insert a new model definition document into the `model_definitions` collection.
  - `fetchAllModelDefinitions()`: Retrieve all documents from the collection.
  - `fetchModelDefinitionById(id)`: Get a single document by its ID.
  - `updateModelDefinition(id, update)`: Apply updates to the document matching the given ID.
  - `removeModelDefinition(id)`: Delete the document from the collection.
- Ensure that the DB operations enforce basic schema consistency and respect index configurations as defined (e.g., unique constraints on model name if required).
- **Constraints:** Limit file to essential MongoDB operations and keep it under 150 lines.

## Additional Considerations

- **Validation & Error Handling:**
  - Use lightweight schema validation (Zod) in the API layer to validate incoming JSON payloads.
  - All business validations (allowed types, immutable fields) occur in `modelService.ts`.
  - Errors should be logged using the logging utilities (refer to lib/api/logging.ts) and formatted as per [04-system-design.md](../04-system-design.md).
  - Return clear error messages that follow the standard error response format.

- **Testing:**
  - Write unit tests for each function in `modelService.ts` to cover allowed and disallowed scenarios (e.g., rejecting advanced features listed in [02-out-of-scope.md](../02-out-of-scope.md)).
  - Integration tests should verify the complete API flow in `route.ts`, including edge cases.

- **Performance & Modularity:**
  - Every file is structured to be self-contained with a strict line limit (<150 lines). Split logic into helper functions if necessary.
  - Database operations are kept simple and atomic to maintain high performance in the MVP context.

- **Security & Compliance:**
  - Align with existing auth mechanisms. While detailed security is not a priority for MVP, ensure that only authenticated users can access these endpoints.
  - No advanced security features (e.g., SSO, MFA) are included, inline with [02-out-of-scope.md](../02-out-of-scope.md).

## Conclusion
This detailed implementation plan provides a comprehensive roadmap for building the Model Definitions module. It strictly adheres to the architecture defined in [04-system-design.md](../04-system-design.md) while explicitly avoiding the advanced features outlined in [02-out-of-scope.md](../02-out-of-scope.md). By maintaining a modular design with clear separation of concerns, concise files (<150 lines each), and robust validation/error handling, the module is positioned to deliver a fast, reliable MVP for dynamic model management. 