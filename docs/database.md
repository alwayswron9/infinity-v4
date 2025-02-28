# Database

This document provides information about the database structure and setup for the Infinity v4 application.

## Database Technologies

The application appears to use multiple database technologies:

1. **PostgreSQL**: Primary relational database
2. **MongoDB**: NoSQL database for specific features

## Database Setup

### PostgreSQL

The project includes a SQL dump file (`infinity_local_dump.sql`) that can be used to set up the initial database schema.

To restore the database from the dump file:

```bash
psql -U your_username -d your_database_name -f infinity_local_dump.sql
```

### Connection Configuration

Database connection details are configured through environment variables in the `.env` or `.env.local` files:

```
# PostgreSQL connection
POSTGRES_URL=postgresql://username:password@localhost:5432/database_name

# MongoDB connection (if used)
MONGODB_URI=mongodb://username:password@localhost:27017/database_name
```

## Database Structure

Based on the project's directory structure and the SQL dump file, the database likely includes tables for:

- Users and authentication
- Data models
- Application content
- Relationships between these entities

## Database Access Layer

The application includes database utilities in the `/src/lib/db` directory for interacting with the database. These utilities likely include:

- Connection management
- Query builders
- Transaction handling
- Entity mappers

## Database Interaction Patterns

### PostgreSQL Interaction

The application uses `pg` and `pg-pool` libraries to interact with PostgreSQL:

```typescript
import { pool } from '@/lib/db/postgres';

async function getUserById(id: string) {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0];
}
```

### MongoDB Interaction

For MongoDB interactions, the application uses the standard MongoDB Node.js driver:

```typescript
import { getMongoDb } from '@/lib/db/mongodb';

async function getDocumentById(collection: string, id: string) {
  const db = await getMongoDb();
  return db.collection(collection).findOne({ _id: id });
}
```

## Data Models

The application likely includes the following data models:

- User: User account information
- Profile: Extended user profile data
- Model: Data models managed by the application
- Relationship: Connections between different entities
- Settings: Application and user settings

## Data Migration

For evolving the database schema, the application may include migration scripts or use a migration library.

## Best Practices

When interacting with the database:

1. Always use parameterized queries to prevent SQL injection
2. Use transactions for operations that require atomicity
3. Handle connection pooling appropriately
4. Implement proper error handling for database operations
5. Consider query performance and indexing for frequently accessed data
