import { useState, useCallback, useRef } from 'react';
import useViewStore from '@/lib/stores/viewStore';
import type { ModelView } from '@/types/viewDefinition';
import { toast } from '@/lib/utils/toast';

// Helper to check if a field is a system field
const isSystemField = (field: string) => field.startsWith('_');

interface UseModelDataOptions {
  modelId: string;
}

interface UseModelDataReturn {
  data: Record<string, any>[];
  isLoading: boolean;
  error: string | null;
  availableColumns: string[];
  systemColumns: string[];
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
  const [systemColumns, setSystemColumns] = useState<string[]>([]);
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

    const loadingToast = toast.loading('Loading data...');

    try {
      setIsLoading(true);
      
      // Get the current view from the store
      const currentView = useViewStore.getState().views?.find(
        (v: ModelView) => v.id === useViewStore.getState().activeView
      );

      // Build query params including filters and sorting
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      // Process and add filters if present
      if (currentView?.config?.filters?.length) {
        // Filter out any inactive filters (ones without values)
        const activeFilters = currentView.config.filters.filter(
          filter => {
            // Consider a filter active if it has a value or is using isNull/isNotNull operators
            return (
              filter.value !== undefined && 
              filter.value !== '' && 
              filter.value !== null
            ) || 
            filter.operator === 'isNull' || 
            filter.operator === 'isNotNull';
          }
        );
        
        if (activeFilters.length > 0) {
          params.append('filters', JSON.stringify(activeFilters));
        }
      }

      // Add sorting if present
      if (currentView?.config?.sorting?.length) {
        params.append('sorting', JSON.stringify(currentView.config.sorting));
      }

      const response = await fetch(`/api/data/${modelId}?${params.toString()}`);
      
      // If this request is no longer the current one, ignore the result
      if (currentRequestRef.current !== requestId) {
        toast.dismiss(loadingToast);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to load model data');
      }
      const modelData = await response.json();
      
      // Log the response for debugging
      console.log('API Response:', modelData);
      
      // Ensure data is an array even if empty
      setData(modelData.data || []);
      
      // Calculate pagination values
      const totalItems = modelData.meta.total || 0;
      const totalPages = Math.ceil(totalItems / limit) || 1;
      
      // Set pagination with calculated values
      const newPagination = {
        pageIndex: page - 1,
        pageSize: limit,
        pageCount: totalPages,
        total: totalItems
      };
      
      console.log('Setting pagination:', newPagination);
      setPagination(newPagination);
      
      // Extract available columns from the first data item
      if (modelData.data?.length > 0) {
        const allColumns = Object.keys(modelData.data[0]);
        const [system, regular] = allColumns.reduce<[string[], string[]]>(
          ([sys, reg], key) => {
            if (isSystemField(key)) {
              sys.push(key);
            } else {
              reg.push(key);
            }
            return [sys, reg];
          },
          [[], []]
        );
        
        setSystemColumns(system);
        setAvailableColumns(regular);
      } else if (modelData.schema?.fields) {
        // If no data, try to get columns from the schema
        const allColumns = Object.keys(modelData.schema.fields);
        const [system, regular] = allColumns.reduce<[string[], string[]]>(
          ([sys, reg], key) => {
            if (isSystemField(key)) {
              sys.push(key);
            } else {
              reg.push(key);
            }
            return [sys, reg];
          },
          [[], []]
        );
        
        setSystemColumns(system);
        setAvailableColumns(regular);
      }

      toast.dismiss(loadingToast);
      toast.success('Data loaded successfully');
    } catch (error) {
      // Only set error if this is still the current request
      if (currentRequestRef.current === requestId) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load data';
        setError(errorMessage);
        toast.dismiss(loadingToast);
        toast.error(errorMessage);
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
    systemColumns,
    pagination,
    loadModelData,
    setPagination,
  };
} 