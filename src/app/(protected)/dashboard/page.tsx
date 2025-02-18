'use client';
import React from 'react';
import Link from 'next/link';
import { 
  ArrowRightIcon, 
  KeyIcon, 
  TableCellsIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';

const QuickStartCard = ({ title, description, icon: Icon, href }: { title: string; description: string; icon: any; href: string }) => (
  <Link href={href}>
    <div className="p-6 border border-border rounded-lg hover:shadow-lg transition-shadow duration-200 bg-surface">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-text-primary">{title}</h3>
          <p className="mt-2 text-sm text-text-secondary">{description}</p>
        </div>
      </div>
    </div>
  </Link>
);

const CodeBlock = ({ code }: { code: string }) => (
  <div className="bg-surface-hover rounded-lg p-4 mt-2">
    <pre className="text-sm text-text-primary overflow-x-auto">
      <code>{code}</code>
    </pre>
  </div>
);

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary-hover rounded-2xl p-8 mb-12 text-white">
        <h1 className="text-4xl font-bold mb-4">Welcome to Infinity</h1>
        <p className="text-xl opacity-90">
          Your central data service with powerful REST API capabilities for managing, querying, and searching data.
        </p>
      </div>

      {/* Quick Start Grid */}
      <h2 className="text-2xl font-bold mb-6 text-text-primary">Getting Started</h2>
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <QuickStartCard
          title="Create Your First Model"
          description="Define your data structure with fields, validations, and vector search capabilities."
          icon={TableCellsIcon}
          href="/models"
        />
        <QuickStartCard
          title="Generate API Key"
          description="Get your API key to start making authenticated requests to the API."
          icon={KeyIcon}
          href="/settings"
        />
        <QuickStartCard
          title="Basic Data Operations"
          description="Create, read, update, and delete records using our REST API endpoints."
          icon={MagnifyingGlassIcon}
          href="#basic-operations"
        />
        <QuickStartCard
          title="Advanced Querying"
          description="Use filters, pagination, and vector search to find exactly what you need."
          icon={Squares2X2Icon}
          href="#advanced-querying"
        />
      </div>

      {/* API Usage Section */}
      <div className="bg-surface rounded-xl p-8 mb-12">
        <h2 className="text-2xl font-bold mb-6 text-text-primary" id="basic-operations">Basic Data Operations</h2>
        
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-text-primary">Creating Records</h3>
            <CodeBlock code={`POST /api/public/data/[model_name]
{
  "customer_name": "John Doe",
  "feedback": "Great service!",
  "rating": 5,
  "category": "Praise"
}`} />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-text-primary">Reading Records</h3>
            <CodeBlock code={`# Get all records (paginated)
GET /api/public/data/[model_name]?page=1&limit=10

# Get single record
GET /api/public/data/[model_name]?id=record_id`} />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-text-primary">Updating & Deleting</h3>
            <CodeBlock code={`# Update record
PUT /api/public/data/[model_name]?id=record_id
{
  "rating": 4,
  "feedback": "Updated feedback"
}

# Delete record
DELETE /api/public/data/[model_name]?id=record_id`} />
          </div>
        </div>
      </div>

      {/* Advanced Querying Section */}
      <div className="bg-surface rounded-xl p-8 mb-12" id="advanced-querying">
        <h2 className="text-2xl font-bold mb-6 text-text-primary">Advanced Querying</h2>
        
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-text-primary">Filtering Records</h3>
            <CodeBlock code={`# Apply filters
GET /api/public/data/[model_name]?filter={
  "rating": { "gte": 4 },
  "category": "Bug",
  "created_at": { "gte": "2024-01-01" }
}`} />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-text-primary">Pagination Controls</h3>
            <CodeBlock code={`# Paginate results
GET /api/public/data/[model_name]?page=2&limit=20

Response includes:
{
  "meta": {
    "page": 2,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasNextPage": false,
    "hasPreviousPage": true
  }
}`} />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-text-primary">Vector Search</h3>
            <CodeBlock code={`# Search similar content
POST /api/public/data/[model_name]/search
{
  "query": "customer service experience",
  "limit": 10,
  "minSimilarity": 0.7,
  "filter": {
    "rating": { "gte": 4 }
  }
}`} />
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-surface rounded-xl border border-border p-8">
        <h2 className="text-2xl font-bold mb-6 text-text-primary">Key Features</h2>
        <ul className="space-y-4">
          <li className="flex items-center space-x-3">
            <ArrowRightIcon className="h-5 w-5 text-primary" />
            <span className="text-text-primary">Full CRUD operations with REST API endpoints</span>
          </li>
          <li className="flex items-center space-x-3">
            <ArrowRightIcon className="h-5 w-5 text-primary" />
            <span className="text-text-primary">Advanced filtering and pagination support</span>
          </li>
          <li className="flex items-center space-x-3">
            <ArrowRightIcon className="h-5 w-5 text-primary" />
            <span className="text-text-primary">Vector search for semantic similarity queries</span>
          </li>
          <li className="flex items-center space-x-3">
            <ArrowRightIcon className="h-5 w-5 text-primary" />
            <span className="text-text-primary">Secure API key authentication</span>
          </li>
        </ul>
      </div>
    </div>
  );
}