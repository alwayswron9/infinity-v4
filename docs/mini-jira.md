# Infinity MVP Implementation Plan

## Overview

This document outlines the tasks required to complete the MVP of Infinity. The MVP focuses on core functionality to allow users to sign up, define models, create records, and optionally perform vector search on records. Security and full reliability are not priorities at this stage.

Reference Doc: [04-system-design.md](04-system-design.md)

## Checklist

- [x] **Model Definitions Endpoints**
  - [x] Create endpoint to create new model definitions (POST /api/models)
  - [x] Create endpoint to list model definitions (GET /api/models)
  - [x] Create endpoint to get a specific model definition (GET /api/models/:id)
  - [x] Create endpoint to update a model definition (PUT /api/models/:id)
  - [x] Create endpoint to delete a model definition (DELETE /api/models/:id)
  - [x] Persist model definitions in MongoDB (using proper schema)
  -     NOTE: Model definitions must adhere to the schema specified in [04-system-design.md](04-system-design.md) and avoid advanced features outlined in [02-out-of-scope.md](02-out-of-scope.md). Only basic data types (string, number, boolean, date, vector), simple foreign key references, and minimal embedding configurations are allowed.
  - Implementation Details:
    - Created types/modelDefinition.ts with Zod schemas for validation
    - Created lib/db/modelsCollection.ts for MongoDB operations
    - Created lib/models/modelService.ts for business logic
    - Created app/api/models/route.ts for REST endpoints
    - Integrated with existing auth system for user context

- [x] **Data Record Endpoints**
  - [x] Create endpoint to create a new record (POST /api/data/:model_id)
  - [x] Create endpoint to query records for a model (GET /api/data/:model_id)
  - [x] Create endpoint to get a record by id (GET /api/data/:model_id/:id)
  - [x] Create endpoint to update a record (PUT /api/data/:model_id/:id)
  - [x] Create endpoint to delete a record (DELETE /api/data/:model_id/:id)
  - [x] Ensure record validation according to model definition
  - NOTE: Data records must strictly adhere to the dynamic schema as defined in [04-system-design.md](04-system-design.md), and must not implement any advanced validations or dynamic transformations as described in [02-out-of-scope.md](02-out-of-scope.md).

- [ ] **Vector Search Endpoint (Optional but recommended for MVP)**
  - [x] Integrate with OpenAI embeddings (ada-002) for vector generation
  - [x] Implement automatic embedding updates on record creation/updates
  - [ ] Create endpoint to search using embeddings (POST /api/actions/:model_id/search)
  - [ ] Set up MongoDB Atlas vector search index
  - [ ] Implement cosine similarity search with minimum threshold filtering
  - Implementation Details So Far:
    - Created lib/embeddings/embeddingService.ts for OpenAI integration
    - Integrated embedding generation into DataService for record creation/updates
    - Added proper error handling and validation for embedding generation
  - TODO:
    - Create search endpoint and route handler
    - Set up MongoDB Atlas vector search index
    - Implement search functionality using knnBeta operator
  - NOTE: Vector search utilizes 1536-dimensional embeddings generated via OpenAI ada-002 and uses cosine similarity for ranking, strictly adhering to the guidelines in [04-system-design.md](04-system-design.md). Advanced vector search features outlined in [02-out-of-scope.md](02-out-of-scope.md) are not implemented.

- [ ] **Minimal User Interface**
  - [ ] Build UI for model management (form to create/update models)
  - [ ] Build UI for data records (form to add/edit records)
  - [ ] Include functionality for triggering vector search (if implemented)
  - [ ] Ensure proper routing between protected and public pages

- [ ] **Middleware and Auth Integration**
  - [ ] Apply auth middleware to protected endpoints
  - [ ] Ensure logging of API operations and errors
  - [ ] Handle basic error responses in a consistent manner

- [ ] **Testing and QA**
  - [ ] Write minimal tests (Jest tests) for core endpoints
  - [ ] Test user flows from registration to CRUD operations

- [ ] **Documentation & Deployment**
  - [ ] Update [04-system-design.md](04-system-design.md) if needed
  - [ ] Document REST API endpoints
  - [ ] Outline deployment steps for public testing

## Reference Documents

- 04-system-design.md for detailed system architecture and API design details.
- README.md for project overview and initial setup notes.

## Notes

- Security and reliability features like rate limiting, advanced error handling, and input sanitation are not a focus for this MVP.
- The goal is to have a functional system available for early adopters to test the idea and provide feedback. 