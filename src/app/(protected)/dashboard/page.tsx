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
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Section } from '@/components/layout/Section';

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
    <PageContainer>
      <PageHeader
        title="Welcome to Infinity"
        description="Your central data service with powerful REST API capabilities"
      />

      <Section className="bg-surface">
        <div className="grid md:grid-cols-2 gap-6 px-2">
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
      </Section>

      <Section title="API Examples" className="bg-surface">
        <div className="space-y-8 px-2">
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
      </Section>

      <Section title="Key Features" className="bg-surface">
        <div className="space-y-4 px-2">
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
        </div>
      </Section>
    </PageContainer>
  );
}