import { useState, useCallback, useMemo } from 'react';
import type { ModelDefinition } from '@/types/modelDefinition';
import { toast } from 'sonner';

// Extend ModelDefinition to include recordCount
interface ModelWithStats extends ModelDefinition {
  recordCount: number;
}

interface UseModelsReturn {
  models: ModelWithStats[];
  filteredModels: ModelWithStats[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  showArchived: boolean;
  setSearchQuery: (query: string) => void;
  setShowArchived: (show: boolean) => void;
  loadModels: () => Promise<void>;
  handleArchiveToggle: (modelId: string) => Promise<void>;
  handleDeleteModel: (modelId: string) => Promise<void>;
}

export function useModels(): UseModelsReturn {
  const [models, setModels] = useState<ModelWithStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const loadModels = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/models');
      if (!response.ok) {
        throw new Error('Failed to load models');
      }
      const data = await response.json();
      setModels(data.data || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load models';
      setError(errorMessage);
      console.error('Error loading models:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleArchiveToggle = useCallback(async (modelId: string) => {
    try {
      const model = models.find(m => m.id === modelId);
      if (!model) return;

      const endpoint = `/api/models/${modelId}/${model.status === 'archived' ? 'restore' : 'archive'}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'same-origin'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `Failed to ${model.status === 'archived' ? 'restore' : 'archive'} model`);
      }

      toast.success(`Model ${model.status === 'archived' ? 'restored' : 'archived'} successfully`);
      loadModels(); // Reload models to get updated state
    } catch (error: any) {
      toast.error(error.message);
    }
  }, [models, loadModels]);

  const handleDeleteModel = useCallback(async (modelId: string) => {
    try {
      const response = await fetch(`/api/models/${modelId}`, {
        method: 'DELETE',
        credentials: 'same-origin'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to delete model');
      }

      toast.success('Model deleted successfully');
      loadModels(); // Reload models to get updated state
    } catch (error: any) {
      toast.error(error.message);
    }
  }, [loadModels]);

  // Filter models based on search query and archive status
  const filteredModels = useMemo(() => {
    return models
      .filter(model => showArchived || model.status !== 'archived')
      .filter(model => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
          model.name.toLowerCase().includes(query) ||
          model.description?.toLowerCase().includes(query)
        );
      });
  }, [models, searchQuery, showArchived]);

  return {
    models,
    filteredModels,
    loading,
    error,
    searchQuery,
    showArchived,
    setSearchQuery,
    setShowArchived,
    loadModels,
    handleArchiveToggle,
    handleDeleteModel,
  };
} 