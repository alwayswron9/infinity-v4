import { useState, useCallback, useRef, useEffect } from 'react';
import useViewStore from '@/lib/stores/viewStore';
import type { ModelView } from '@/types/viewDefinition';
import { toast } from '@/lib/utils/toast';

// Helper to check if a field is a system field
const isSystemField = (field: string) => field.startsWith('_');

// Debounce time in milliseconds
const DEBOUNCE_TIME = 300;
// Minimum time between refreshes in milliseconds
const MIN_REFRESH_INTERVAL = 1000;

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
  loadModelData: (page?: number, limit?: number, showLoadingState?: boolean) => Promise<void>;
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
  // Store previous data to avoid UI flicker during refresh
  const previousDataRef = useRef<Record<string, any>[]>([]);
  // Track the last refresh time to prevent too frequent refreshes
  const lastRefreshTimeRef = useRef<number>(0);
  // Debounce timer
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Flag to track if initial load has happened
  const initialLoadCompletedRef = useRef<boolean>(false);
  // Flag to prevent automatic refreshes
  const isManualRefreshRef = useRef<boolean>(false);

  // Cleanup function for debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Load data function - only refreshes when explicitly called
  const loadModelData = useCallback(async (page = 1, limit = 10, showLoadingState = true) => {
    // Clear any existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Create a debounced function to prevent multiple rapid calls
    debounceTimerRef.current = setTimeout(async () => {
      // Check if we've refreshed too recently and this is not an initial load
      const now = Date.now();
      const isRefresh = !showLoadingState;
      
      if (isRefresh && now - lastRefreshTimeRef.current < MIN_REFRESH_INTERVAL) {
        console.log('Skipping refresh - too soon since last refresh');
        return;
      }
      
      // Update last refresh time if this is a refresh operation
      if (isRefresh) {
        lastRefreshTimeRef.current = now;
      }

      // Create a unique request ID
      const requestId = `${Date.now()}-${Math.random()}`;
      currentRequestRef.current = requestId;

      // Store current data as previous data before loading new data
      previousDataRef.current = data;

      // Only show loading state if explicitly requested (for initial loads and pagination changes)
      // For refresh operations, we'll keep showing the existing data until new data arrives
      if (showLoadingState) {
        setIsLoading(true);
      }

      let loadingToast: string | number | null = null;
      if (showLoadingState && !initialLoadCompletedRef.current) {
        loadingToast = toast.loading('Loading data...');
      }

      try {
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
          if (loadingToast) toast.dismiss(loadingToast);
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

        // Mark initial load as completed
        initialLoadCompletedRef.current = true;

        if (loadingToast) {
          toast.dismiss(loadingToast);
          // Only show success toast for initial loads, not for refreshes
          if (showLoadingState && !initialLoadCompletedRef.current) {
            toast.success('Data loaded successfully');
          }
        }
      } catch (error) {
        // Only set error if this is still the current request
        if (currentRequestRef.current === requestId) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load data';
          setError(errorMessage);
          if (loadingToast) toast.dismiss(loadingToast);
          toast.error(errorMessage);
          
          // Restore previous data on error to maintain UI consistency
          setData(previousDataRef.current);
        }
      } finally {
        // Only update loading state if this is still the current request
        if (currentRequestRef.current === requestId) {
          setIsLoading(false);
        }
      }
    }, DEBOUNCE_TIME);
  }, [modelId, data]); // Include data in dependencies to capture updates for previousDataRef

  // Initial data load when modelId changes - only load once
  useEffect(() => {
    if (modelId && !initialLoadCompletedRef.current) {
      console.log('Initial data load for model:', modelId);
      loadModelData(1, 10, true);
    }
  }, [modelId, loadModelData]);

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