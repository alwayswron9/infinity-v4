# Infinity API Technical Documentation

## System Architecture

The Infinity API is built on a Next.js application using the App Router architecture. The system consists of the following key components:

1. **API Routes**: Located in `src/app/api/`
   - Public API endpoints: `src/app/api/public/data/`
   - Model-specific endpoints: `src/app/api/public/data/[model_name]/`
   - Search functionality: `src/app/api/public/data/[model_name]/search/`

2. **Core Services**:
   - `ModelService`: Manages model definitions (`src/lib/models/modelService.ts`)
   - `PostgresDataService`: Handles CRUD operations on data records (`src/lib/data/postgresDataService.ts`)
   - `EmbeddingService`: Manages vector embeddings for similarity search (`src/lib/embeddings/embeddingService.ts`)

3. **Authentication Middleware**:
   - `publicMiddleware.ts`: API key validation and request authentication

## Local Development Environment

### Prerequisites

- Node.js v18+
- PostgreSQL database with pgvector extension enabled
- OpenAI API key for embedding generation

### Environment Configuration

Required environment variables in `.env.local`:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/your_database
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_API_URL=http://localhost:3000
API_KEY_PREFIX=inf_  # Default API key prefix
```

### Server Initialization

The server runs on port 3000 by default:

```bash
npm run dev
```

## Authentication System

The API uses API key authentication with the following implementation:

1. API keys are hashed using SHA-256 before storage for security
2. Keys follow format: `inf_<hex-encoded-random-bytes>`
3. API keys must be passed via the `x-api-key` header (not Authorization: Bearer)
4. Each API key is linked to a specific user account via user_id
5. Keys can have status: `active` or `inactive`

### Authentication Flow

```
Request → API Key Extraction → Key Validation → User Lookup → Request Processing
```

Implementation details in `src/lib/api/publicMiddleware.ts`:

```typescript
// Flow:
// 1. Extract API key from header
const apiKey = req.headers.get('x-api-key');

// 2. Validate key format
validateApiKeyFormat(apiKey) // Checks prefix and length

// 3. Hash and lookup key
const keyHash = hashApiKey(apiKey);
const apiKeyRecord = await apiKeyService.findByKeyHash(keyHash);

// 4. Check status
if (apiKeyRecord.status !== 'active') { /* reject */ }

// 5. Add user context to request
authenticatedReq.apiKey = {
  user_id: apiKeyRecord.user_id,
  key_id: apiKeyRecord.id,
};
```

## Data Model Schema

### ModelDefinition

Schema definition from `src/types/modelDefinition.ts`:

```typescript
export type ModelDefinition = {
  id: string; // UUID
  owner_id: string; // UUID of owning user
  name: string; // Alphanumeric with hyphens only
  description?: string;
  fields: Record<string, FieldDefinition>;
  relationships?: Record<string, RelationshipDefinition>;
  indexes?: Record<string, IndexDefinition>;
  embedding?: EmbeddingConfig;
  status: 'active' | 'archived';
  created_at: Date;
  updated_at: Date;
};
```

### Field Definition

```typescript
export type FieldDefinition = {
  id: string; // UUID
  type: 'string' | 'number' | 'boolean' | 'date' | 'vector';
  required?: boolean;
  unique?: boolean;
  default?: any;
  enum?: any[];
  description?: string;
  foreign_key?: {
    references: {
      model_id: string; // UUID
      field_id: string; // UUID
    }
  };
};
```

### Embedding Configuration

```typescript
export type EmbeddingConfig = {
  enabled: boolean;
  source_fields: string[]; // Field names for generating embeddings
};
```

### DataRecord

Schema definition from `src/types/dataRecord.ts`:

```typescript
export interface DataRecord {
  _id: string; // UUID of the record
  _created_at: Date;
  _updated_at: Date;
  _vector?: number[]; // Optional vector embedding
  [key: string]: any; // Dynamic fields based on model
}
```

## Validation Rules

### Model Validation

1. Model names must be alphanumeric with hyphens: `/^[a-zA-Z0-9-]+$/`
2. Field names must be valid JavaScript property names
3. Models must have at least one field defined
4. Field types must be one of: 'string', 'number', 'boolean', 'date'
5. For vector search, at least one source field must be specified

### Field Validation

Implementation in `PostgresDataService.validateFields()`:

```typescript
private async validateFields(fields: Record<string, any>): Promise<void> {
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
```

## Database Schema

The system uses PostgreSQL with the following key tables:

1. `model_definitions`: Stores model schemas
   ```sql
   CREATE TABLE model_definitions (
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
   ```

2. `model_data`: Stores actual data records
   ```sql
   CREATE TABLE model_data (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     model_id UUID NOT NULL REFERENCES model_definitions(id),
     owner_id UUID NOT NULL REFERENCES users(id),
     data JSONB NOT NULL DEFAULT '{}',
     embedding vector(1536),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
   );
   ```

   - Requires pgvector extension: `CREATE EXTENSION IF NOT EXISTS vector;`
   - Vector index: `CREATE INDEX ON model_data USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);`

## API Endpoints

### 1. Model-Specific Data Endpoints

#### Fetch Records

```
GET /api/public/data/[model_name]
```

Params:
- URL Parameter: `model_name` - Name of the model
- Query Parameters:
  - `id` (optional): Fetch specific record by ID
  - `filter` (optional): JSON object with filter criteria
  - `include` (optional): JSON array of fields to include
  - `page` (optional, default=1): Page number
  - `limit` (optional, default=10): Records per page

Example Request:
```
GET /api/public/data/customers?page=2&limit=20&filter={"status":"active"}
x-api-key: inf_your_api_key_here
```

Response Format:
```typescript
{
  success: boolean;
  data: DataRecord | DataRecord[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
```

Implementation notes:
- Vector data (`_vector`) is excluded from response
- Authentication validates user access to specified model
- Error handling includes field validation errors

#### Create Record(s)

```
POST /api/public/data/[model_name]
```

Params:
- URL Parameter: `model_name` - Name of the model
- Request Body: Record data or array of records for bulk operation

Single Record Format:
```typescript
{
  field1: value1,
  field2: value2,
  // ...
}
```

Bulk Records Format:
```typescript
[
  { field1: value1, ... },
  { field1: value2, ... }
]
```

Example Request:
```
POST /api/public/data/customers
x-api-key: inf_your_api_key_here
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "status": "active"
}
```

Response Format:
```typescript
{
  success: boolean;
  data: DataRecord | DataRecord[];
  errors?: Array<{
    index: number;
    error: string;
    data: any;
  }>;
  meta?: {
    total: number;
    succeeded: number;
    failed: number;
  };
}
```

Status Codes:
- 201: Created successfully
- 207: Partial success (bulk operations)
- 400: Validation error
- 401: Unauthorized
- 500: Server error

Implementation notes:
- If embedding is enabled, vectors are auto-generated using the source_fields
- Validation performed on all fields before creation
- Bulk operations handle partial success/failure
- UUIDs are auto-generated for new records

#### Update Record(s)

```
PUT /api/public/data/[model_name]
```

Params:
- URL Parameter: `model_name` - Name of the model
- Query Parameter: `id` - Record ID (for single record updates)
- Request Body: Update data or array of updates for bulk operation

Single Record Format:
```typescript
{
  field1: updated_value1,
  field2: updated_value2,
  // ...
}
```

Bulk Records Format:
```typescript
[
  { id: "record-id-1", field1: updated_value1, ... },
  { id: "record-id-2", field1: updated_value2, ... }
]
```

Example Request:
```
PUT /api/public/data/customers?id=12345
x-api-key: inf_your_api_key_here
Content-Type: application/json

{
  "status": "inactive",
  "updated_notes": "Customer account deactivated"
}
```

Response Format: Same as create endpoint

Implementation notes:
- Only specified fields are updated (partial updates supported)
- Vector embeddings are regenerated if relevant source fields change
- Validation runs on the updated field values only
- Returns 404 if record not found

#### Delete Record

```
DELETE /api/public/data/[model_name]
```

Params:
- URL Parameter: `model_name` - Name of the model
- Query Parameter: `id` - Record ID to delete

Example Request:
```
DELETE /api/public/data/customers?id=12345
x-api-key: inf_your_api_key_here
```

Response: Status 200 with `{ success: true }`

### 2. Vector Search Endpoints

#### Similarity Search

```
POST /api/public/data/[model_name]/search
```

Params:
- URL Parameter: `model_name` - Name of the model
- Request Body:
```typescript
{
  query: string;           // Text to search for
  limit?: number;          // Max results (default=10)
  minSimilarity?: number;  // Threshold 0-1 (default=0.7)
  filter?: object;         // Optional filters
}
```

Example Request:
```
POST /api/public/data/documents/search
x-api-key: inf_your_api_key_here
Content-Type: application/json

{
  "query": "machine learning applications in healthcare",
  "limit": 5,
  "minSimilarity": 0.6
}
```

Response Format:
```typescript
{
  success: boolean;
  data: Array<DataRecord & { similarity: number }>;
  meta: {
    query: string;
    total: number;
    limit: number;
    minSimilarity: number;
  };
}
```

Implementation notes:
- Uses OpenAI embeddings (text-embedding-3-small model)
- Cosine similarity calculated in PostgreSQL using pgvector
- Results sorted by similarity score (highest first)
- Embeddings are excluded from response
- PostgreSQL actual query uses: `1 - (embedding <=> $1::vector) as similarity`

## Legacy Endpoints (For Backward Compatibility)

### General Data Endpoints

```
GET /api/public/data?model=<model_name>&id=<record_id>
POST /api/public/data?model=<model_name>
PUT /api/public/data?model=<model_name>&id=<record_id>
DELETE /api/public/data?model=<model_name>&id=<record_id>
```

These legacy endpoints have some differences in request format:

- For POST and PUT, the fields must be in a nested "fields" object:
  ```json
  {
    "fields": {
      "field1": "value1",
      "field2": "value2"
    }
  }
  ```

- For bulk operations with legacy endpoints:
  ```json
  [
    {
      "fields": {
        "field1": "value1"
      }
    },
    {
      "fields": {
        "field1": "value2"
      }
    }
  ]
  ```

### General Search Endpoint

```
POST /api/public/data/search?model=<model_name>
```

## Error Handling

Errors are returned with a consistent structure:

```typescript
{
  success: false,
  error: string | { field: string; message: string },
  details?: {
    code?: string,
    fields?: string[],
    stack?: string // Only in development
  }
}
```

Common error codes:
- 400: Bad Request (validation errors)
- 401: Unauthorized (invalid/missing API key)
- 404: Not Found (model or record not found)
- 500: Internal Server Error

Field validation errors include specific messages such as:
- "Missing required field: {fieldName}"
- "Field {fieldName} must be a string"
- "Invalid value for field {fieldName}. Must be one of: {enum values}"

## Vector Search Implementation

The system uses OpenAI's `text-embedding-3-small` model for generating embeddings with the following process:

1. Specified fields from a record are concatenated into a single text string
   ```typescript
   const textForEmbedding = this.model.embedding.source_fields
     .map((field: string) => {
       const value = fields[field];
       return value ? String(value).trim() : '';
     })
     .filter((text: string) => text.length > 0)
     .join(' ');
   ```

2. OpenAI API generates a vector embedding (1536 dimensions)
   ```typescript
   async generateEmbedding(text: string): Promise<number[]> {
     const response = await openai.embeddings.create({
       model: 'text-embedding-3-small',
       input: text,
     });
     return response.data[0].embedding;
   }
   ```

3. Embeddings are stored in PostgreSQL using pgvector extension
   ```sql
   INSERT INTO model_data (id, model_id, owner_id, data, embedding)
   VALUES ($1, $2, $3, $4, $5::vector)
   ```

4. Similarity search uses cosine similarity: `1 - (embedding <=> query_embedding)`
   ```sql
   SELECT 
     id, data, 1 - (embedding <=> $1::vector) as similarity
   FROM model_data
   WHERE model_id = $2
     AND embedding IS NOT NULL
     AND 1 - (embedding <=> $1::vector) >= $3
   ORDER BY similarity DESC
   LIMIT $4
   ```

5. Additional optimizations:
   - The system uses a minimum similarity threshold (default: 0.7)
   - For performance, it uses an effective threshold of: `Math.min(minSimilarity, 0.3)`
   - Implements IVFFlat index for faster vector search

## Bulk Operation Implementation

The API supports bulk operations for creating and updating records with the following characteristics:

1. Accepts arrays of objects in request body
2. Processes each item individually in a loop:
   ```typescript
   for (let i = 0; i < body.length; i++) {
     try {
       // Process individual record
       const record = await dataService.createRecord(body[i]);
       results.push(record);
     } catch (error: any) {
       errors.push({
         index: i,
         error: error.message || 'Failed to create record',
         data: body[i]
       });
     }
   }
   ```

3. Returns partial success (207) status when some operations fail:
   ```typescript
   return NextResponse.json({
     success: errors.length === 0,
     data: results,
     errors: errors.length > 0 ? errors : undefined,
     meta: {
       total: body.length,
       succeeded: results.length,
       failed: errors.length
     }
   }, { status: errors.length === 0 ? 201 : 207 });
   ```

4. Provides detailed error information for each failed item

Implementation challenges:
- Each record is validated individually
- Errors in one record don't stop processing others
- No transaction support across multiple records (each is atomic)
- Error aggregation provides detailed debugging information

## PostgreSQL Integration

The system uses the native PostgreSQL driver with the following key operations:

1. Dynamic table creation for model data
2. Prepared statements for query execution
3. Transaction support for atomic operations
4. Vector operations using pgvector extension
5. JSON storage for flexible schema support

Connection management is handled through a connection pool with connection timeout handling:

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export async function executeQuery(text: string, params: any[] = []): Promise<any> {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}
```

## Optimization Techniques

1. Embeddings are generated asynchronously when records are created or updated
2. Query parameters are properly parametrized to prevent SQL injection
3. Bulk operations can be performed in a single request for better performance
4. Data pagination reduces memory usage and improves response times
5. Vector search uses IVFFlat indexing for better performance with large datasets
6. System-generated fields (_id, _created_at, _updated_at) are automatically handled
7. The API excludes vector data from responses to reduce payload size

## Full Implementation References

### Key Modules:
- `src/lib/models/modelService.ts`: Model definition management
- `src/lib/data/postgresDataService.ts`: Data operations
- `src/lib/embeddings/embeddingService.ts`: Vector embedding generation/search
- `src/lib/api/publicMiddleware.ts`: Authentication
- `src/types/modelDefinition.ts`: Schema definitions
- `src/types/dataRecord.ts`: Data record type definitions 