---
title: "Vector Search"
description: "Leverage AI-powered semantic search to find relevant data across your models"
lastUpdated: "2023-03-09"
---

# Vector Search in Infinity

Infinity's vector search capabilities allow you to find records based on meaning and context, not just exact keyword matches. This guide explains how vector search works and how to implement it in your Infinity models.

![Vector Search Overview](/docs/images/diagrams/vector-search-overview-placeholder.png)

## Understanding Vector Search

### What is Vector Search?

Traditional search methods find records that contain exact matches of search terms. Vector search (semantic search) goes beyond this by understanding the meaning behind your query and finding contextually relevant results.

For example, if you search for "affordable office chair," vector search can find records about "budget-friendly desk seating" even if they don't contain your exact search terms.

### How Vector Search Works

1. **Text Embedding**: Text is converted into high-dimensional vectors that capture semantic meaning
2. **Vector Storage**: These vectors are stored alongside your records
3. **Similarity Matching**: When you search, your query is converted to a vector and compared to stored vectors
4. **Ranking**: Results are ranked by similarity score

![Vector Search Process](/docs/images/diagrams/vector-search-process-placeholder.png)

## Setting Up Vector Search

### Creating Vector Fields

To enable vector search for a model:

1. Go to the model editor for your chosen model
2. Click "Add Field"
3. Select "Vector" as the field type
4. Choose which text fields to include in the vector representation
5. Save your changes

![Vector Field Configuration](/docs/images/screenshots/vector-field-configuration-placeholder.png)

### Configuration Options

When setting up a vector field, you can configure:

| Option | Description |
|--------|-------------|
| Source Fields | Which text fields to include in the vector representation |
| Model | The AI model used for embedding (default: OpenAI's text-embedding-3-small) |
| Dimensions | Vector size (default: 1536) |
| Update Trigger | When to update vectors (on create, on update, or manually) |

### Processing Existing Data

If you add a vector field to a model with existing records:

1. Go to the model settings
2. Find the "Vector Processing" section
3. Click "Process Existing Records"
4. A background job will create vector embeddings for all existing records

## Using Vector Search

### Basic Search

To perform a basic vector search:

1. Navigate to your model's record list
2. Click the "Vector Search" button in the search bar
3. Enter your natural language query
4. View results ranked by relevance

![Basic Vector Search](/docs/images/screenshots/basic-vector-search-placeholder.png)

### Advanced Search Options

For more control over your vector searches:

| Option | Description |
|--------|-------------|
| Similarity Threshold | Minimum similarity score (0-1) for results |
| Result Limit | Maximum number of results to return |
| Field Weights | Adjust importance of different fields in the search |
| Filters | Combine vector search with traditional filters |

### API Access

Access vector search programmatically through the API:

```
GET /api/public/data/{model}/search?query="comfortable ergonomic office chair"&threshold=0.7&limit=20
```

Response format:

```json
{
  "data": [
    {
      "id": "rec_01H2XYZ...",
      "similarity": 0.92,
      "name": "Executive Mesh Chair",
      "description": "Ergonomic design with lumbar support...",
      // ... other fields
    },
    // ... more results
  ]
}
```

## Use Cases for Vector Search

### Customer Support Knowledge Base

Create a knowledge base where support agents can search for articles using natural language questions:

- **Model**: SupportArticle
- **Vector Fields**: Title, Content
- **Search Examples**:
  - "How do I reset my password?"
  - "Trouble connecting to the dashboard"
  - "Payment method declined"

![Support Knowledge Base](/docs/images/screenshots/knowledge-base-placeholder.png)

### Product Catalog

Enable customers to find products using natural language descriptions:

- **Model**: Product
- **Vector Fields**: Name, Description, Category
- **Search Examples**:
  - "Waterproof hiking boots for winter"
  - "Lightweight laptop for college students"
  - "Kitchen gadgets for small apartments"

### Document Management

Find documents based on their content and context:

- **Model**: Document
- **Vector Fields**: Title, Content, Tags
- **Search Examples**:
  - "Marketing strategy for Q3"
  - "Legal guidelines for data privacy"
  - "Financial forecast for 2024"

## Advanced Vector Search Techniques

### Hybrid Search

Combine vector search with traditional filters for more precise results:

```
GET /api/public/data/products/search?query="laptop for gaming"&filter=inStock:true&filter=price:<1500
```

This finds semantically relevant products that are in stock and under $1,500.

### Vector Field Combinations

Create multiple vector fields to optimize for different search scenarios:

1. **General Content**: Include all text fields for broad searches
2. **Technical Specs**: Include only specification fields for technical queries
3. **Customer Facing**: Include fields relevant to customer searches

### Multilingual Search

Vector search works across languages, allowing you to:

1. Store content in multiple languages
2. Search in any language
3. Find relevant results regardless of the language used in the query or content

## Best Practices

### Optimize for Performance

Vector search uses more computational resources than traditional search:

- Limit vector dimensions when possible
- Use selective field indexing (only include relevant fields)
- Consider batching vector updates for large datasets

### Refine Vector Representations

For better search results:

- Include only meaningful text in vector fields
- Remove boilerplate text or standard disclaimers
- Consider preprocessing text to remove noise

### Monitor and Improve

Track vector search effectiveness:

- Review search logs to identify missed results
- Collect user feedback on search relevance
- Periodically update vector embeddings as your data evolves

## Troubleshooting

### Low Relevance Results

If search results aren't relevant:

1. Check which fields are included in the vector representation
2. Consider adjusting field weights
3. Try increasing the similarity threshold

### Missing Results

If expected results aren't appearing:

1. Verify vector embeddings have been generated for all records
2. Check if filters might be excluding relevant results
3. Try decreasing the similarity threshold

### Performance Issues

If vector search is slow:

1. Review the size of your dataset
2. Check vector dimensions and complexity
3. Consider optimizing your query patterns

## Limits and Considerations

- Vector storage increases database size
- Processing large text fields increases embedding costs
- Updates to vector fields may not be immediate for large datasets

## Next Steps

Now that you understand vector search in Infinity, you might want to explore:

- [Advanced Data Modeling](/docs/8-advanced-data-modeling)
- [Workflow Automation with Vector Search](/docs/6-workflow-automation)
- [API Integration for AI Applications](/docs/5-api-reference)

For assistance with vector search, contact our support team at [aiwahlabs@gmail.com](mailto:aiwahlabs@gmail.com). 