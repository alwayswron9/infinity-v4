'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, SaveIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { use } from 'react';
import { ModelDefinition, UpdateModelDefinitionInput, CreatableFieldDefinition } from '@/types/modelDefinition';
import { BasicInfoSection } from '@/components/models/BasicInfoSection';
import { FieldsSection } from '@/components/models/FieldsSection';
import { VectorSearchSection } from '@/components/models/VectorSearchSection';

export default function EditModelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [model, setModel] = useState<ModelDefinition | null>(null);

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
      const fields = Object.entries(model.fields).reduce((acc, [name, field]) => {
        if (field.type !== 'vector') {
          const { type, id, required, unique, description, default: defaultValue, enum: enumValues, foreign_key } = field;
          acc[name] = {
            type,
            id,
            required,
            unique,
            description,
            default: defaultValue,
            enum: enumValues,
            foreign_key,
          } as CreatableFieldDefinition;
        }
        return acc;
      }, {} as Record<string, CreatableFieldDefinition>);

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
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/models"
          className="p-2 hover:bg-surface rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-semibold">Edit Model</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        <BasicInfoSection 
          model={model} 
          onChange={updates => setModel(prev => prev ? { ...prev, ...updates } : null)} 
        />
        
        <FieldsSection 
          model={model} 
          onChange={updates => setModel(prev => prev ? { ...prev, ...updates } : null)} 
        />
        
        <VectorSearchSection 
          model={model} 
          onChange={updates => setModel(prev => prev ? { ...prev, ...updates } : null)} 
        />

        {/* Submit Button */}
        <div className="flex justify-end sticky bottom-6 pt-6">
          <button
            type="submit"
            disabled={submitting || (model.embedding?.enabled && (!model.embedding.source_fields || model.embedding.source_fields.length === 0))}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <SaveIcon className="w-5 h-5" />
            <span>{submitting ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
} 
