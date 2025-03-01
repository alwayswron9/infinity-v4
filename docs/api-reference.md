# API Reference

This document provides information about the API endpoints available in the Infinity v4 application.

## API Structure

The API is implemented using Next.js API Routes in the `/src/app/api` directory. The application follows a RESTful API design pattern.

## Authentication

Many API endpoints require authentication. Authentication is handled using JWT tokens.

Authentication flow:
1. User logs in via `/api/auth/login`
2. Server issues a JWT token
3. Client includes the token in subsequent requests in the Authorization header
4. Server verifies the token using middleware

## API Endpoints

Based on the project structure, here are the likely API endpoints:

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user information

### User Management

- `GET /api/users` - List users
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Data Management

- `GET /api/data` - Get data
- `POST /api/data` - Create data
- `PUT /api/data/:id` - Update data
- `DELETE /api/data/:id` - Delete data

### Models

- `GET /api/models` - Get models
- `GET /api/models/:id` - Get model details
- `POST /api/models` - Create model
- `PUT /api/models/:id` - Update model
- `DELETE /api/models/:id` - Delete model

## Request and Response Formats

### Request Format

For POST and PUT requests, the body should be in JSON format:

```json
{
  "property1": "value1",
  "property2": "value2"
}
```

Headers for authenticated requests:

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Response Format

Successful responses typically follow this format:

```json
{
  "data": {
    // Response data
  },
  "message": "Operation successful"
}
```

Error responses:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

## Error Handling

The API uses standard HTTP status codes:

- 200: OK - Request successful
- 201: Created - Resource created
- 400: Bad Request - Invalid input
- 401: Unauthorized - Authentication required
- 403: Forbidden - Insufficient permissions
- 404: Not Found - Resource not found
- 500: Internal Server Error - Server-side error

## Rate Limiting

The API may include rate limiting to prevent abuse. Clients should handle 429 Too Many Requests responses by implementing retry logic with exponential backoff.

## API Utilities

The application includes API utilities in the `/src/lib/api` directory to help with API interactions.

## Client-Side API Usage

For client-side API calls, the application likely uses native fetch or custom hooks built around it.
