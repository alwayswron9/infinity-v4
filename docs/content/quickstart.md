# Infinity Quickstart Guide

## What is Infinity?

Infinity is your central data service designed to make data management and integration seamless across your workflow automation tools. Think of it as a smart database that not only stores your data but also provides powerful search capabilities and easy integration with tools like n8n, Make, and Zapier.

## Quick Example: Customer Feedback System

Let's walk through a practical example of how you can use Infinity to manage customer feedback data:

### 1. Creating Your First Model

To create a model through the UI:
1. Navigate to Models in the sidebar
2. Click "Create New Model"
3. Define your model structure:

```json
{
  "name": "CustomerFeedback",
  "fields": {
    "customer_name": {
      "type": "string",
      "required": true
    },
    "product": {
      "type": "string",
      "required": true
    },
    "feedback": {
      "type": "text",
      "required": true
    },
    "rating": {
      "type": "number",
      "required": true,
      "min": 1,
      "max": 5
    },
    "category": {
      "type": "string",
      "enum": ["Bug", "Feature Request", "Praise", "Support"]
    }
  },
  "embedding": {
    "enabled": true,
    "source_fields": ["feedback"]
  }
}
```

### 2. Generate an API Key

To access your data programmatically:
1. Go to Settings → API Keys
2. Click "Generate New Key"
3. Save your API key securely - it will look like: `inf_xxxxxxxxxxxx`

### 3. Using the Public API

All API endpoints are available at `https://your-domain.com/api/public/data/[model_name]`

#### Create a Record
```bash
curl -X POST https://your-domain.com/api/public/data/CustomerFeedback \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "John Doe",
    "product": "Mobile App",
    "feedback": "Love the new interface! Very intuitive.",
    "rating": 5,
    "category": "Praise"
  }'
```

#### Retrieve Records
```bash
# Get all records
GET /api/public/data/CustomerFeedback

# Get specific record
GET /api/public/data/CustomerFeedback/[record_id]

# Search records
POST /api/public/data/CustomerFeedback/search
{
  "query": "interface design"
}
```

### 4. Integration with n8n

Here's how to use your CustomerFeedback model in n8n:

1. Add an HTTP Request node
2. Configure the node:
   - Method: POST
   - URL: https://your-domain.com/api/public/data/CustomerFeedback
   - Headers: 
     ```
     Authorization: Bearer your_api_key
     Content-Type: application/json
     ```
   - Body: Your feedback data

Example n8n workflow:
1. Trigger (e.g., Form Trigger)
2. HTTP Request (Infinity) to save feedback
3. If rating < 3, create support ticket
4. If rating = 5, send to testimonial collection

## Next Steps

1. Explore the Models section to create more complex data structures
2. Use the vector search capability to find similar feedback
3. Set up automated workflows with your preferred automation tool
4. Check out our API documentation for advanced features

Need help? Visit our documentation or reach out to support. 