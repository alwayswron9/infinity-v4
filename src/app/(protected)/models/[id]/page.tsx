'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, SaveIcon, ClipboardCopyIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { use } from 'react';
import { 
  ModelDefinition, 
  UpdateModelDefinitionInput, 
  CreatableFieldDefinition,
  FieldDefinition 
} from '@/types/modelDefinition';
import { BasicInfoSection } from '@/components/models/BasicInfoSection';
import { FieldsSection } from '@/components/models/FieldsSection';
import { VectorSearchSection } from '@/components/models/VectorSearchSection';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Section } from '@/components/layout/Section';

export default function EditModelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [model, setModel] = useState<ModelDefinition | null>(null);
  const [copyingDetails, setCopyingDetails] = useState(false);

  useEffect(() => {
    fetchModel();
  }, [id]);

  const fetchModel = async () => {
    try {
      const response = await fetch(`/api/models?id=${id}`, {
        credentials: 'same-origin'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to fetch model');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to fetch model');
      }

      setModel(data.data);
    } catch (error: any) {
      toast.error(error.message);
      router.push('/models');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!model) return;

    if (Object.keys(model.fields).length === 0) {
      toast.error('Add at least one field to your model');
      return;
    }

    setSubmitting(true);
    try {
      // Filter out any vector fields before updating
      const fields: Record<string, CreatableFieldDefinition> = {};
      const entries = Object.entries(model.fields) as [string, FieldDefinition][];
      for (const [name, field] of entries) {
        if (field.type !== 'vector') {
          const { type, id, required, unique, description, default: defaultValue, enum: enumValues, foreign_key } = field;
          if (type === 'string' || type === 'number' || type === 'boolean' || type === 'date') {
            fields[name] = {
              type,
              id,
              required,
              unique,
              description,
              default: defaultValue,
              enum: enumValues,
              foreign_key,
            };
          }
        }
      }

      const updateData: UpdateModelDefinitionInput = {
        name: model.name,
        description: model.description,
        fields,
        embedding: model.embedding,
        relationships: model.relationships,
        indexes: model.indexes
      };

      const response = await fetch(`/api/models?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to update model');
      }

      toast.success('Model updated successfully');
      router.push('/models');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyModelDetails = async () => {
    if (!model) return;
    
    setCopyingDetails(true);
    try {
      const response = await fetch(`/api/models/${id}/details`, {
        credentials: 'same-origin'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch model details');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch model details');
      }

      const details = data.data;
      
      // Format the details as a readable string
      const formattedDetails = [
        `Model: ${details.name}`,
        `Description: ${details.description}`,
        `ID: ${details.id}`,
        `Record Count: ${details.recordCount}`,
        `Created: ${details.createdAt}`,
        `Updated: ${details.updatedAt}`,
        '',
        'Fields:',
        ...details.fields.map((field: any) => 
          `  - ${field.name} (${field.type})${field.required ? ' [Required]' : ''}${field.unique ? ' [Unique]' : ''}`
        ),
        '',
        `Vector Search: ${details.vectorSearch.enabled ? 'Enabled' : 'Disabled'}`,
        details.vectorSearch.enabled ? `  Source Fields: ${details.vectorSearch.sourceFields.join(', ')}` : '',
        '',
        'Relationships:',
        details.relationships.length > 0 
          ? details.relationships.map((rel: any) => `  - ${rel.name}: ${rel.type} to ${rel.target_model}`) 
          : '  None',
        '',
        'Indexes:',
        details.indexes.length > 0 
          ? details.indexes.map((idx: any) => `  - ${idx.name}: ${idx.fields.join(', ')}`) 
          : '  None'
      ].filter(Boolean).join('\n');

      await navigator.clipboard.writeText(formattedDetails);
      toast.success('Model details copied to clipboard');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setCopyingDetails(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!model) {
    return null;
  }

  return (
    <PageContainer maxWidth="5xl">
      <PageHeader
        title="Edit Model"
        backHref="/models"
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyModelDetails}
              disabled={copyingDetails}
              className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <ClipboardCopyIcon className="w-4 h-4" />
              <span>{copyingDetails ? 'Copying...' : 'Copy Details'}</span>
            </button>
            <button
              type="submit"
              form="model-form"
              disabled={submitting || (model.embedding?.enabled && (!model.embedding.source_fields || model.embedding.source_fields.length === 0))}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <SaveIcon className="w-5 h-5" />
              <span>{submitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        }
      />

      <form id="model-form" onSubmit={handleSubmit} className="space-y-8">
        <BasicInfoSection 
          model={model} 
          onChange={(updates: Partial<ModelDefinition>) => setModel((prev: ModelDefinition | null) => prev ? { ...prev, ...updates } : null)} 
        />
        
        <FieldsSection 
          model={model} 
          onChange={(updates: Partial<ModelDefinition>) => setModel((prev: ModelDefinition | null) => prev ? { ...prev, ...updates } : null)} 
        />
        
        <VectorSearchSection 
          model={model} 
          onChange={(updates: Partial<ModelDefinition>) => setModel((prev: ModelDefinition | null) => prev ? { ...prev, ...updates } : null)} 
        />
      </form>
    </PageContainer>
  );
} 
