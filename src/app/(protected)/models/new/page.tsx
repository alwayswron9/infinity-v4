'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, PlusIcon, TrashIcon, SaveIcon, InfoIcon, SearchIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { CreateModelDefinitionInput, FieldType } from '@/types/modelDefinition';

type Field = {
  id: string;
  name: string;
  type: Exclude<FieldType, 'vector'>;  // Exclude vector type
  required: boolean;
  unique: boolean;
  description?: string;
};

const FIELD_TYPES = {
  string: 'String',
  number: 'Number',
  boolean: 'Boolean',
  date: 'Date',
} as const;

export default function NewModelPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [model, setModel] = useState<Partial<CreateModelDefinitionInput>>({
    name: '',
    description: '',
    fields: {},
    embedding: {
      enabled: false,
      source_fields: []
    }
  });
  const [newField, setNewField] = useState<Field>({
    id: crypto.randomUUID(),
    name: '',
    type: 'string',
    required: false,
    unique: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(model.fields || {}).length === 0) {
      toast.error('Add at least one field to your model');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify(model),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to create model');
      }

      toast.success('Model created successfully');
      router.push('/models');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const addField = () => {
    if (!newField.name.trim()) {
      toast.error('Field name is required');
      return;
    }

    if (model.fields?.[newField.name]) {
      toast.error('Field name must be unique');
      return;
    }

    setModel(prev => ({
      ...prev,
      fields: {
        ...prev.fields,
        [newField.name]: {
          id: newField.id,
          type: newField.type,
          required: newField.required,
          unique: newField.unique,
          description: newField.description,
        }
      }
    }));

    setNewField({
      id: crypto.randomUUID(),
      name: '',
      type: 'string',
      required: false,
      unique: false,
    });
  };

  const removeField = (fieldName: string) => {
    const fields = { ...model.fields };
    delete fields[fieldName];
    setModel(prev => ({ ...prev, fields }));
  };

  // Helper to toggle source fields for embedding
  const toggleSourceField = (fieldName: string) => {
    setModel(prev => {
      const currentSourceFields = prev.embedding?.source_fields || [];
      const newSourceFields = currentSourceFields.includes(fieldName)
        ? currentSourceFields.filter(f => f !== fieldName)
        : [...currentSourceFields, fieldName];

      return {
        ...prev,
        embedding: {
          enabled: prev.embedding?.enabled ?? false,
          source_fields: newSourceFields
        }
      };
    });
  };

  // Toggle vector search
  const toggleVectorSearch = (enabled: boolean) => {
    setModel(prev => ({
      ...prev,
      embedding: {
        enabled,
        source_fields: enabled ? (prev.embedding?.source_fields || []) : []
      }
    }));
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/models"
          className="p-2 hover:bg-surface rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-semibold">New Model</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={model.name}
              onChange={e => setModel(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-border bg-surface"
              placeholder="e.g., Customer, Product, Order"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={model.description}
              onChange={e => setModel(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-border bg-surface"
              placeholder="Describe your model..."
              rows={3}
            />
          </div>
        </div>

        {/* Fields */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-medium">Fields</h2>
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-sm">
              <InfoIcon className="w-4 h-4" />
              <span>Vector fields are handled automatically by the platform</span>
            </div>
          </div>
          
          {/* Existing Fields */}
          <div className="space-y-2 mb-4">
            {Object.entries(model.fields || {}).map(([name, field]) => (
              <div
                key={field.id}
                className="flex items-center gap-4 p-4 bg-surface rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium">{name}</div>
                  <div className="text-sm text-text-secondary">
                    {FIELD_TYPES[field.type as keyof typeof FIELD_TYPES]}
                    {field.required && ' • Required'}
                    {field.unique && ' • Unique'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeField(name)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Field Form */}
          <div className="flex gap-4 items-start">
            <div className="flex-1 grid grid-cols-2 gap-4">
              <input
                type="text"
                value={newField.name}
                onChange={e => setNewField(prev => ({ ...prev, name: e.target.value }))}
                className="px-4 py-2 rounded-lg border border-border bg-surface"
                placeholder="Field name"
              />
              <select
                value={newField.type}
                onChange={e => setNewField(prev => ({ ...prev, type: e.target.value as Field['type'] }))}
                className="px-4 py-2 rounded-lg border border-border bg-surface"
              >
                {Object.entries(FIELD_TYPES).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <div className="col-span-2 flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newField.required}
                    onChange={e => setNewField(prev => ({ ...prev, required: e.target.checked }))}
                    className="rounded border-border"
                  />
                  <span className="text-sm">Required</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newField.unique}
                    onChange={e => setNewField(prev => ({ ...prev, unique: e.target.checked }))}
                    className="rounded border-border"
                  />
                  <span className="text-sm">Unique</span>
                </label>
              </div>
            </div>
            <button
              type="button"
              onClick={addField}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Vector Search Configuration */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-medium">Vector Search</h2>
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-sm">
              <InfoIcon className="w-4 h-4" />
              <span>Enable semantic search using OpenAI embeddings</span>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={model.embedding?.enabled}
                onChange={e => toggleVectorSearch(e.target.checked)}
                className="rounded border-border"
              />
              <span>Enable vector search for this model</span>
            </label>

            {model.embedding?.enabled && (
              <div className="space-y-2">
                <label className="block text-sm font-medium">Source Fields for Embeddings</label>
                <p className="text-sm text-text-secondary mb-2">
                  Select the fields that should be used to generate embeddings for semantic search
                </p>
                <div className="space-y-2">
                  {Object.entries(model.fields || {}).filter(([_, field]) => field.type === 'string').map(([name]) => (
                    <label key={name} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={model.embedding?.source_fields.includes(name)}
                        onChange={() => toggleSourceField(name)}
                        className="rounded border-border"
                      />
                      <span>{name}</span>
                    </label>
                  ))}
                </div>
                {Object.keys(model.fields || {}).filter(name => model.fields?.[name].type === 'string').length === 0 && (
                  <div className="text-sm text-text-secondary italic">
                    Add string fields to enable vector search
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || (model.embedding?.enabled && model.embedding.source_fields.length === 0)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <SaveIcon className="w-5 h-5" />
            <span>{submitting ? 'Creating...' : 'Create Model'}</span>
          </button>
        </div>
      </form>
    </div>
  );
} 