# Infinity Technical Architecture

## System Overview
Infinity serves as a central data service specifically designed to integrate with workflow automation platforms (n8n, Make, Zapier). It provides:
- A single source of truth for maintaining consistent, reliable data across all workflows
- Basic CRUD operations on all data models
- Simple relationship management through foreign keys
- Vector search capability through embeddings
- Basic authentication and security

## Tech Stack

### Frontend
- **Next.js**: React framework for server-side rendering and API routes
- **Tailwind CSS**: Utility-first CSS framework for modern, responsive design
- **TypeScript**: For type-safe development across the application
- **React Query**: Data fetching and state management
- **Zod**: Runtime type validation and schema definition

### Backend & API
- **Node.js**: Runtime environment for server-side JavaScript
- **Next.js API Routes**: For RESTful API endpoints
- **JWT & API Key Auth**: For secure authentication
- **OpenAI SDK**: For vector embeddings generation

### Database & Storage
- **MongoDB Atlas**: Primary database for model definitions and data storage
- **Atlas Vector Search**: For efficient vector similarity searches
- **MongoDB Indexes**: For optimized query performance
- **PostgreSQL**: Relational database for structured data and complex queries
  - **pgvector**: Extension for vector storage and similarity search
  - **Foreign Key Constraints**: For enforcing data integrity
  - **ACID Compliance**: For transactional operations

### Testing & Quality Assurance
- **Jest**: JavaScript testing framework
- **Eslint**: For code quality

## Workflow Platform Integration
Workflow platforms connect to Infinity through:
1. API Key Authentication:
   - Generate API key through admin interface
   - Use API key in all requests via Authorization header
2. Data Operations:
   - Create/update/delete records via REST endpoints
   - Query data with relationship inclusion
   - Perform vector similarity searches
3. Model Management:
   - Define data models and relationships
   - Configure vector embeddings for semantic operations

## Data Architecture

### Base Models & System Models
All models in the system automatically include base fields as defined in `03-schema.md`.

## System User Model
```typescript
{
  id: string;           // Required, UUID v4
  email: string;        // Required, Unique
  name: string;         // Required
  status: string;       // enum: ['active', 'inactive']
  created_at: date;     // Required
  updated_at: date;     // Required
}
```

### Data Storage

#### Model Definitions
Model definitions are stored in a dedicated MongoDB collection and follow this structure:
```typescript
{
  id: string;           // Model definition ID
  owner_id: string;     // References System User
  name: string;         // Model name
  description?: string; // Optional description
  
  "fields": {
    [fieldName: string]: {
      "id": string;         // Field identifier
      "type": string;       // One of the core data types
      "required"?: boolean; // Whether the field is required
      "unique"?: boolean;   // Whether the field must be unique
      "default"?: any;      // Default value if not provided
      "enum"?: any[];      // For fields with enumerated values
      "description"?: string; // Field description
      "foreign_key"?: {    // If field is a foreign key
        "references": {
          "model_id": string;  // Referenced model definition ID
          "field_id": string;  // Referenced field ID (usually the 'id' field)
        }
      }
    }
  },
  "relationships": {
    [relationName: string]: {
      "id": string;        // Relationship identifier
      "target_model_id": string;  // References another model definition ID
      "foreign_key": {
        "field_id": string;      // References field ID in this or target model
      }
      "onDelete"?: "cascade" | "setNull" | "restrict";
      "onUpdate"?: "cascade" | "setNull" | "restrict";
    }
  },
  "indexes"?: {
    [indexName: string]: {
      "fields": string[];    // References field IDs
      "unique"?: boolean;
    }
  },
  embedding?: {         // Optional embedding configuration
    enabled: boolean;   // Whether to enable embeddings
    source_fields: string[];  // Fields to use for embedding generation
  }
}
```

#### Model Instances
Each model definition has its own MongoDB collection (named using the model_def_id) containing the actual data records:
```typescript
{
  id: string;           // Instance ID
  owner_id: string;     // References System User
  created_at: Date;     // Creation timestamp
  updated_at: Date;     // Last update timestamp
  fields: {            // Dynamic fields as defined in model
    [fieldName: string]: any;
  }
  vector?: number[];   // Optional 1536-dim embedding vector
}
```

### Relationship Management
Relationships between models are:
- Managed through foreign key references
- Configured with onDelete/onUpdate behaviors (cascade/setNull/restrict)
- Automatically enforced by the system
- Queryable through relationship inclusion in API requests

Note: Many-to-many relationships and other advanced features are explicitly out of scope for MVP.

## API Design

### Authentication & Authorization

#### Authentication Methods
1. **API Key Authentication**
   - Format: `inf_<32 random chars>`
   - Usage: Include in Authorization header as `Bearer <api_key>`
   - Generation: Through admin interface or API
   - Storage: Hashed in database

2. **JWT Authentication**
   - Format: Standard JWT token
   - Claims:
     ```typescript
     {
       sub: string;      // User ID
       username: string; // User's username
       email: string;    // User email
       name: string;     // User name
       exp: number;      // Expiration timestamp
       iat: number;      // Issued at timestamp
     }
     ```
   - Expiration: 24 hours from issuance (non-refreshable)
   - Usage: Include in Authorization header as `Bearer <jwt_token>`

#### Authentication Endpoints
```typescript
// User Registration
POST /api/auth/register
{
  username: string;  // Required, alphanumeric + underscore only
  email: string;    // Required
  password: string; // Required
  name: string;     // Required
}
// Response:
{
  token: string;        // JWT token
  user: {
    id: string;
    username: string;
    email: string;
    name: string;
    status: string;
  }
}

// User Authentication
POST /api/auth/login
{
  username: string;  // Either username or email is required
  email?: string;    // Either username or email is required
  password: string;
}
// Response:
{
  token: string;        // JWT token
  user: {
    id: string;
    username: string;
    email: string;
    name: string;
    status: string;
  }
}

// API Key Management
POST /api/auth/apikey     // Generate API key
GET /api/auth/apikey      // List API keys
DELETE /api/auth/apikey/:id // Revoke API key

// Token Management
POST /api/auth/token/revoke   // Revoke JWT token

// Auth Check
GET /api/auth/check           // Check if current token is valid
// Response:
{
  authenticated: boolean;     // Whether the token is valid
  user: {                    // Current user information
    id: string;
    username: string;
    email: string;
    name: string;
    status: string;
  }
}
```

#### User Status Management
- Active users can:
  - Log in
  - Generate API keys
  - Access all endpoints
- Inactive users:
  - Cannot log in
  - Existing API keys are automatically revoked
  - Existing JWT tokens are invalidated

### Model Definition Endpoints
```typescript
POST   /api/models        // Create new model definition
GET    /api/models        // List model definitions
GET    /api/models/:id    // Get specific model definition
PUT    /api/models/:id    // Update model definition
DELETE /api/models/:id    // Delete model definition
```

### Data Operation Endpoints
```typescript
// Basic CRUD endpoints
POST   /api/data/:model_id           // Create record
GET    /api/data/:model_id           // List/query records
GET    /api/data/:model_id/:id       // Get specific record
PUT    /api/data/:model_id/:id       // Update record
DELETE /api/data/:model_id/:id       // Delete record

// Query parameters for GET requests
{
  filter?: {                         // Basic field filtering
    [field: string]: any
  },
  include?: string[],                // Related models to include
  page?: number,                     // Page number (default: 1)
  limit?: number                     // Items per page (default: 10)
}

// Standard Success Response Format
{
  success: true,
  data: any,           // Response payload (single record or array)
  meta?: {             // Optional metadata for list endpoints
    page: number,      // Current page number
    limit: number,     // Items per page
    total: number      // Total number of records
  }
}
```

### Vector Search Endpoints
```typescript
POST /api/actions/:model_id/search
// Request body:
{
  query: string,              // Text query to search for
  limit?: number,            // Max results (default 10)
  min_similarity?: number    // Minimum cosine similarity score (0-1)
}
// Response:
{
  success: true,
  data: {
    results: Array<{
      record: any,             // Model record
      similarity: number       // Cosine similarity score (0-1)
    }>
  }
}
```

The system automatically:
1. Generates embeddings for the query text using OpenAI ada-002
2. Performs vector similarity search using cosine similarity (only supported metric)
3. Returns matching records sorted by similarity

Note: Users only need to provide text queries - all vector operations are handled internally.

### Error Responses
All endpoints return consistent error responses:
```typescript
{
  success: false,
  error: {
    code: string;        // Machine-readable error code
    message: string;     // Human-readable error message
  }
}
```

### HTTP Status Codes

#### Success Codes
- **200 OK**: Request succeeded
  - Used for: GET, PUT, DELETE operations
  - Response includes requested/updated data
- **201 Created**: Resource created successfully
  - Used for: POST operations
  - Response includes created resource
- **204 No Content**: Request succeeded, no response body
  - Used for: DELETE operations

#### Client Error Codes
- **400 Bad Request**: Invalid request format/parameters
  - Missing required fields
  - Invalid field values
  - Malformed JSON
- **401 Unauthorized**: Authentication required
  - Missing authentication
  - Invalid API key/token
- **403 Forbidden**: Permission denied
  - Valid authentication but insufficient permissions
- **404 Not Found**: Resource not found
  - Invalid model ID
  - Invalid record ID
- **409 Conflict**: Resource conflict
  - Unique constraint violation
  - Version conflict
- **422 Unprocessable Entity**: Semantic errors
  - Validation failures
  - Business rule violations

#### Server Error Codes
- **500 Internal Server Error**: Unexpected server error
  - Includes error details and request ID
- **503 Service Unavailable**: System temporarily unavailable
  - Maintenance mode
  - Rate limit exceeded

#### Example Error Responses
```typescript
// 400 Bad Request
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Missing required field: name",
    "details": {
      "field": "name",
      "type": "required"
    },
    "request_id": "req_123"
  }
}

// 404 Not Found
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Record not found",
    "details": {
      "model": "User",
      "id": "123"
    },
    "request_id": "req_456"
  }
}

// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred",
    "details": {
      "error": "Database connection failed"
    },
    "request_id": "req_789"
  }
}
```

### Vector Embeddings

#### Configuration
Embeddings are configured at the model level:
```typescript
{
  "embedding": {
    "enabled": boolean;   // Whether to enable embeddings
    "source_fields": string[];  // Fields to use for embedding generation
  }
}
```

#### Generation Process
1. **When Embeddings are Generated:**
   - On record creation
   - On update of any source field
   - On manual regeneration request

2. **Generation Steps:**
   - System concatenates values of source_fields
   - OpenAI ada-002 model generates 1536-dim vector
   - Vector is stored in model instance's vector field

3. **Storage:**
   ```typescript
   {
     id: string;
     // ... other fields ...
     vector?: number[];   // 1536-dim embedding vector
   }
   ```

4. **Search Process:**
   - Query text is converted to vector using same model
   - Cosine similarity computed against stored vectors
   - Results sorted by similarity score
   - Filtered by optional minimum similarity threshold

#### Example Usage
```typescript
// Model Definition
{
  "name": "Document",
  "fields": {
    "title": { "type": "string" },
    "content": { "type": "string" }
  },
  "embedding": {
    "enabled": true,
    "source_fields": ["title", "content"]
  }
}

// Search Request
POST /api/actions/document/search
{
  "query": "example search text",
  "limit": 10,
  "min_similarity": 0.7
}
     ```