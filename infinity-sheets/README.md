# Infinity Sheets

Infinity Sheets is a powerful data modeling and management service for the Infinity v4 platform. It provides a flexible and scalable way to define data models, store records, and perform vector similarity searches.

## Features

- **Model Definition**: Create and manage data models with custom fields and relationships
- **Data Storage**: Store and retrieve data records based on model definitions
- **Vector Embeddings**: Generate and store vector embeddings for text fields
- **Vector Search**: Perform similarity searches using vector embeddings
- **Authentication**: Secure API with JWT and API key authentication
- **Validation**: Validate data against model definitions

## Tech Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **SQLAlchemy**: SQL toolkit and ORM
- **PostgreSQL**: Relational database with pgvector extension for vector operations
- **OpenAI**: API for generating vector embeddings
- **Docker**: Containerization for easy deployment

## Getting Started

### Prerequisites

- Docker and Docker Compose
- PostgreSQL with pgvector extension
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/infinity-sheets.git
   cd infinity-sheets
   ```

2. Create a `.env` file with the following variables:
   ```
   # Database
   DATABASE_URL=postgresql://postgres:postgres@postgres:5432/infinity
   
   # Authentication
   JWT_SECRET=your-jwt-secret
   API_KEY_PREFIX=inf_
   API_KEY_HEADER=X-API-Key
   
   # OpenAI
   OPENAI_API_KEY=your-openai-api-key
   ```

3. Start the service with Docker Compose:
   ```bash
   docker-compose up -d
   ```

4. The API will be available at http://localhost:8000

## API Documentation

Once the service is running, you can access the API documentation at http://localhost:8000/docs

## Integration with Infinity v4

Infinity Sheets is designed to work seamlessly with the Infinity v4 platform. The main application handles authentication and provides a proxy to the Sheets service.

## Development

### Running Tests

```bash
pytest
```

### Code Formatting

```bash
black app tests
```

## License

See the LICENSE file for details.
