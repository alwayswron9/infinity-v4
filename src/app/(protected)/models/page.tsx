'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, Loader2Icon, DatabaseIcon, SearchIcon, LinkIcon, ChevronRightIcon, PencilIcon, CompassIcon, TrashIcon, MoreVerticalIcon } from 'lucide-react';
import { ModelDefinition } from '@/types/modelDefinition';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function ModelsPage() {
  const [models, setModels] = useState<ModelDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      console.log('Making fetch request to /api/models');
      const response = await fetch('/api/models', {
        credentials: 'same-origin'
      });
      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch models:', errorData);
        throw new Error(errorData.error?.message || 'Failed to fetch models');
      }

      const data = await response.json();
      console.log('Received models:', data);

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to fetch models');
      }

      setModels(data.data);
    } catch (err: any) {
      const message = err.message || 'Error loading models';
      setError(message);
      toast.error(message);
      console.error('Error in fetchModels:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (modelId: string) => {
    if (!confirm('Are you sure you want to delete this model? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/models?id=${modelId}`, {
        method: 'DELETE',
        credentials: 'same-origin'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to delete model');
      }

      toast.success('Model deleted successfully');
      fetchModels();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2Icon className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-text">Data Models</h1>
        <Link
          href="/models/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>New Model</span>
        </Link>
      </div>

      {models.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-lg">
          <h3 className="text-lg font-medium text-text-secondary mb-2">No models defined yet</h3>
          <p className="text-text-tertiary mb-6">Create your first data model to get started</p>
          <Link
            href="/models/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Create Model</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {models.map((model) => (
            <div
              key={model.id}
              className="p-6 bg-surface rounded-lg hover:bg-surface-hover transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-text">{model.name}</h3>
                  {model.description && (
                    <p className="text-text-secondary mt-1">{model.description}</p>
                  )}
                  <div className="flex items-center gap-6 mt-2 text-sm text-text-tertiary">
                    <div className="flex items-center gap-2">
                      <DatabaseIcon className="w-4 h-4" />
                      <span>{Object.keys(model.fields).length} fields</span>
                    </div>
                    {model.embedding?.enabled && (
                      <div className="flex items-center gap-2">
                        <SearchIcon className="w-4 h-4 text-green-500" />
                        <span className="text-green-600">Vector Search Enabled</span>
                      </div>
                    )}
                    {model.relationships && Object.keys(model.relationships).length > 0 && (
                      <div className="flex items-center gap-2">
                        <LinkIcon className="w-4 h-4" />
                        <span>{Object.keys(model.relationships).length} relationships</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/models/${model.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-surface-hover text-text rounded-lg hover:bg-surface-hover/80 transition-colors"
                  >
                    <PencilIcon className="w-4 h-4" />
                    <span>Edit</span>
                  </Link>
                  <Link
                    href={`/models/${model.id}/explore`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <CompassIcon className="w-4 h-4" />
                    <span>Explore</span>
                  </Link>
                  <div className="relative">
                    <button
                      className="p-2 text-text-secondary hover:bg-surface-hover rounded-lg transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        const menu = document.getElementById(`model-menu-${model.id}`);
                        menu?.classList.toggle('hidden');
                      }}
                      onBlur={(e) => {
                        const menu = document.getElementById(`model-menu-${model.id}`);
                        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                          menu?.classList.add('hidden');
                        }
                      }}
                    >
                      <MoreVerticalIcon className="w-4 h-4" />
                    </button>
                    <div
                      id={`model-menu-${model.id}`}
                      className="hidden absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-border z-10"
                      onMouseLeave={() => {
                        const menu = document.getElementById(`model-menu-${model.id}`);
                        menu?.classList.add('hidden');
                      }}
                    >
                      <button
                        onClick={() => handleDelete(model.id)}
                        className="w-full px-4 py-2 text-left text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Delete Model
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 