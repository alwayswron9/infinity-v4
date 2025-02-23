import { useState, useCallback, useRef } from 'react';

interface UseModelDataOptions {
  modelId: string;
}

interface UseModelDataReturn {
  data: Record<string, any>[];
  isLoading: boolean;
  error: string | null;
  availableColumns: string[];
  pagination: {
    pageIndex: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
  loadModelData: (page?: number, limit?: number) => Promise<void>;
  setPagination: (pagination: {
    pageIndex: number;
    pageSize: number;
    pageCount: number;
    total: number;
  }) => void;
}

export function useModelData({ modelId }: UseModelDataOptions): UseModelDataReturn {
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
    pageCount: 0,
    total: 0
  });

  // Track the current request to prevent race conditions
  const currentRequestRef = useRef<string | null>(null);

  const loadModelData = useCallback(async (page = 1, limit = 10) => {
    // Create a unique request ID
    const requestId = `${Date.now()}-${Math.random()}`;
    currentRequestRef.current = requestId;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/data/${modelId}?page=${page}&limit=${limit}`);
      
      // If this request is no longer the current one, ignore the result
      if (currentRequestRef.current !== requestId) {
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to load model data');
      }
      const modelData = await response.json();
      
      setData(modelData.data || []);
      setPagination({
        pageIndex: page - 1,
        pageSize: limit,
        pageCount: Math.ceil(modelData.meta.total / limit),
        total: modelData.meta.total
      });
      
      // Extract available columns from the first data item
      if (modelData.data?.length > 0) {
        const columns = Object.keys(modelData.data[0]).filter(key => key !== '_vector');
        setAvailableColumns(columns);
      }
    } catch (error) {
      // Only set error if this is still the current request
      if (currentRequestRef.current === requestId) {
        setError(error instanceof Error ? error.message : 'Failed to load data');
      }
    } finally {
      // Only update loading state if this is still the current request
      if (currentRequestRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }, [modelId]); // Only recreate when modelId changes

  return {
    data,
    isLoading,
    error,
    availableColumns,
    pagination,
    loadModelData,
    setPagination,
  };
} 