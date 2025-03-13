---
title: "API Reference"
description: "Complete reference for the Infinity REST API"
lastUpdated: "2023-03-09"
---

# Infinity API Reference

Infinity provides a comprehensive REST API that allows you to programmatically interact with your data models. This reference documents all available endpoints, authentication methods, and usage examples.

## Authentication

All API requests require authentication using an API key. To obtain an API key, go to the Settings page in the Infinity dashboard and generate a new key.

Include your API key in the request header:

```
X-API-Key: your_api_key_here
```

## Base URL

All API requests should be made to the following base URL:

```
https://infinity.aiwahlabs.xyz/api/public/data
```

## General Endpoints

### Health Check

```
GET /api/health
```

Verifies the API is operational.

**Response:**

```json
{
  "status": "ok",
  "version": "0.3.3"
}
```

## Data Model Endpoints

Each data model you create automatically gets its own set of RESTful endpoints. Replace `{model}` with your actual model name (in lowercase).

### List Records

```
GET /api/public/data/{model}
```

Retrieves a paginated list of records from the specified model.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Records per page (default: 50, max: 100) |
| sort | string | Field to sort by, with optional direction (e.g., `created_at:desc`) |
| filter | string | Field-based filters (e.g., `status:active`) |

**Response:**

```json
{
  "data": [
    {
      "id": "rec_01H2XYZ...",
      "created_at": "2023-06-15T10:30:00Z",
      "updated_at": "2023-06-15T14:20:00Z",
      "field_1": "value",
      "field_2": 123,
      // ... other fields
    },
    // ... more records
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 243,
    "pages": 5
  }
}
```

### Get a Single Record

```
GET /api/public/data/{model}/{id}
```

Retrieves a single record by its ID.

**Response:**

```json
{
  "data": {
    "id": "rec_01H2XYZ...",
    "created_at": "2023-06-15T10:30:00Z",
    "updated_at": "2023-06-15T14:20:00Z",
    "field_1": "value",
    "field_2": 123,
    // ... other fields
  }
}
```

### Create a Record

```
POST /api/public/data/{model}
```

Creates a new record in the specified model.

**Request Body:**

```json
{
  "field_1": "value",
  "field_2": 123,
  // ... other fields based on your model definition
}
```

**Response:**

```json
{
  "data": {
    "id": "rec_01H2XYZ...",
    "created_at": "2023-06-15T10:30:00Z",
    "updated_at": "2023-06-15T10:30:00Z",
    "field_1": "value",
    "field_2": 123,
    // ... other fields
  }
}
```

### Update a Record

```
PUT /api/public/data/{model}/{id}
```

Completely replaces a record with new data.

**Request Body:**

```json
{
  "field_1": "new value",
  "field_2": 456,
  // ... all fields need to be included
}
```

**Response:**

```json
{
  "data": {
    "id": "rec_01H2XYZ...",
    "created_at": "2023-06-15T10:30:00Z",
    "updated_at": "2023-06-15T15:45:00Z",
    "field_1": "new value",
    "field_2": 456,
    // ... other fields
  }
}
```

### Partial Update a Record

```
PATCH /api/public/data/{model}/{id}
```

Updates only the specified fields of a record.

**Request Body:**

```json
{
  "field_1": "updated value"
  // only fields that need to be updated
}
```

**Response:**

```json
{
  "data": {
    "id": "rec_01H2XYZ...",
    "created_at": "2023-06-15T10:30:00Z",
    "updated_at": "2023-06-15T16:20:00Z",
    "field_1": "updated value",
    "field_2": 123,
    // ... other fields remain unchanged
  }
}
```

### Delete a Record

```
DELETE /api/public/data/{model}/{id}
```

Deletes a record by its ID.

**Response:**

```json
{
  "success": true,
  "message": "Record deleted successfully"
}
```

## Advanced Query Options

### Filtering

You can filter records using the `filter` query parameter:

```
GET /api/public/data/customers?filter=status:active
```

Multiple filters can be combined:

```
GET /api/public/data/orders?filter=status:completed&filter=total:>100
```

Supported operators:

- `:` exact match
- `:>` greater than
- `:<` less than
- `:>=` greater than or equal
- `:<=` less than or equal
- `:!=` not equal
- `:~` contains (text fields)

### Sorting

Sort records using the `sort` parameter:

```
GET /api/public/data/products?sort=price:asc
```

You can sort by multiple fields:

```
GET /api/public/data/customers?sort=created_at:desc&sort=name:asc
```

### Pagination

Control pagination with `page` and `limit`:

```
GET /api/public/data/transactions?page=2&limit=25
```

### Field Selection

Request only specific fields:

```
GET /api/public/data/users?fields=id,name,email
```

### Relationships

Include related records:

```
GET /api/public/data/orders?include=customer,items
```

## Vector Search

For models with vector fields, you can perform semantic search:

```
GET /api/public/data/{model}/search?query="comfortable office chair"
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| query | string | The search query text |
| limit | number | Maximum number of results (default: 10) |
| threshold | number | Similarity threshold (0-1, default: 0.7) |

**Response:**

```json
{
  "data": [
    {
      "id": "rec_01H2XYZ...",
      "similarity": 0.92,
      "field_1": "value",
      // ... other fields
    },
    // ... more records
  ]
}
```

## Error Handling

The API uses standard HTTP status codes and provides error details in the response:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid field value",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address"
      }
    ]
  }
}
```

Common error codes:

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | BAD_REQUEST | Invalid request format |
| 400 | VALIDATION_ERROR | Field validation failed |
| 401 | UNAUTHORIZED | Missing or invalid API key |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Record or endpoint not found |
| 429 | RATE_LIMIT_EXCEEDED | Too many requests |
| 500 | SERVER_ERROR | Internal server error |

## Rate Limiting

API requests are subject to rate limiting to ensure service stability. Current limits:

- 100 requests per minute per API key
- 5,000 requests per day per API key

Rate limit headers are included in all responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1623848400
```

If you exceed the rate limit, you'll receive a 429 response with a Retry-After header.

## Webhooks

Infinity can send webhooks when events occur in your data models:

1. Go to Settings > Webhooks
2. Click "Add Webhook"
3. Configure:
   - URL to receive the webhook
   - Events to trigger the webhook (create, update, delete)
   - Models to watch
   - Secret key for verification

Webhook payloads include:

```json
{
  "event": "record.created",
  "model": "customer",
  "timestamp": "2023-06-15T10:30:00Z",
  "data": {
    "id": "rec_01H2XYZ...",
    "field_1": "value",
    // ... record data
  }
}
```

Verify webhooks by checking the `X-Infinity-Signature` header against your secret key.

## SDKs & Client Libraries

- [JavaScript SDK](https://github.com/aiwahlabs/infinity-js)
- [Python SDK](https://github.com/aiwahlabs/infinity-py)

## Examples

### JavaScript Example

```javascript
// Using the Infinity JavaScript SDK
import { InfinityClient } from '@aiwahlabs/infinity-js';

const client = new InfinityClient({
  apiKey: 'your_api_key_here'
});

// Create a record
const newCustomer = await client.models.customers.create({
  name: 'Jane Doe',
  email: 'jane@example.com',
  status: 'active'
});

// List records with filtering
const activeCustomers = await client.models.customers.list({
  filter: { status: 'active' },
  sort: [{ field: 'created_at', direction: 'desc' }],
  page: 1,
  limit: 50
});

// Update a record
const updatedCustomer = await client.models.customers.update(
  newCustomer.id,
  { status: 'inactive' }
);

// Delete a record
await client.models.customers.delete(newCustomer.id);
```

### cURL Example

```bash
# List records
curl --location 'https://infinity.aiwahlabs.xyz/api/public/data/customers?page=1&limit=50' \
--header 'X-API-Key: your_api_key_here'

# Create a record
curl --location 'https://infinity.aiwahlabs.xyz/api/public/data/customers' \
--header 'X-API-Key: your_api_key_here' \
--header 'Content-Type: application/json' \
--data-raw '{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "status": "active"
}'

# Update a record
curl --location --request PATCH 'https://infinity.aiwahlabs.xyz/api/public/data/customers/rec_01H2XYZ...' \
--header 'X-API-Key: your_api_key_here' \
--header 'Content-Type: application/json' \
--data-raw '{
  "status": "inactive"
}'
```

## Need Help?

If you need assistance with the API, contact our support team at [aiwahlabs@gmail.com](mailto:aiwahlabs@gmail.com) or check our [API Guides](/docs/api-guides) for more detailed examples. 