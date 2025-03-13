---
title: "Getting Started with Infinity"
description: "Your guide to setting up and beginning to use Infinity for data management"
lastUpdated: "2023-03-09"
---

# Getting Started with Infinity

This guide will walk you through the initial steps to get up and running with Infinity, from setting up your account to creating your first data model.

## Creating Your Account

To begin using Infinity, you'll need to create an account:

1. Visit [infinity.aiwahlabs.xyz](https://infinity.aiwahlabs.xyz)
2. Click on the "Sign Up" button in the top right corner
3. Enter your email address and create a password
4. Verify your email address through the link sent to your inbox
5. Complete your profile information

![Account Creation Process](/docs/images/screenshots/account-creation-placeholder.png)

## Navigating the Dashboard

Once you've created your account and logged in, you'll be taken to the Infinity dashboard. This is your central hub for all activities within Infinity.

Key areas of the dashboard include:

- **Models Section**: Access and manage your data models
- **Records Browser**: View and interact with your data
- **Settings**: Configure your account and API keys
- **Documentation**: Access guides and API references

![Dashboard Navigation](/docs/images/screenshots/dashboard-navigation-placeholder.png)

## Creating Your First Data Model

Data models are the foundation of Infinity. They define the structure of your data and how it can be accessed.

### To create a new data model:

1. From the dashboard, click the "Create Model" button
2. Enter a name for your model (e.g., "Customers", "Products", "Orders")
3. Add fields to your model by clicking "Add Field"
4. For each field, specify:
   - Field name
   - Data type (text, number, boolean, date, etc.)
   - Whether it's required
   - Any validation rules
5. Set up relationships with other models (if applicable)
6. Click "Create Model" to save

![Creating a Data Model](/docs/images/screenshots/model-creation-placeholder.png)

### Field Types

Infinity supports various field types to ensure your data is properly structured:

| Field Type | Description | Example Use Case |
|------------|-------------|------------------|
| Text | Single or multi-line text | Names, descriptions |
| Number | Integer or decimal values | Prices, quantities |
| Boolean | True/false values | Status flags, toggles |
| Date | Date and time values | Creation dates, deadlines |
| Select | Predefined options | Status, categories |
| Relation | References to other models | Customer for an order |
| File | Uploaded files or images | Profile pictures, documents |
| JSON | Structured data | Complex configurations |
| Vector | Embeddings for AI search | Semantic search data |

## Adding Records

Once you've created a model, you can start adding records:

1. Navigate to your model in the Models section
2. Click "Add Record"
3. Fill in the fields with appropriate data
4. Click "Save" to create the record

![Adding Records](/docs/images/screenshots/adding-records-placeholder.png)

## Generating an API Key

To access your data programmatically or connect with automation tools, you'll need an API key:

1. Go to Settings from the dashboard
2. Select the "API Keys" tab
3. Click "Generate New Key"
4. Name your key (e.g., "Development", "Production", "n8n Integration")
5. Set permissions for the key
6. Copy your API key and store it securely

![API Key Generation](/docs/images/screenshots/api-key-placeholder.png)

**Important**: API keys provide access to your data. Never share them publicly and rotate them regularly for security.

## Next Steps

Now that you've set up your account, created a data model, and generated an API key, you're ready to explore more advanced features:

- [Learn about the API](/docs/5-api-reference)
- [Set up workflow automation](/docs/6-workflow-automation)
- [Explore vector search capabilities](/docs/7-vector-search)
- [Implement advanced data modeling](/docs/8-advanced-data-modeling)

Need help? Contact our support team at [aiwahlabs@gmail.com](mailto:aiwahlabs@gmail.com) for assistance. 