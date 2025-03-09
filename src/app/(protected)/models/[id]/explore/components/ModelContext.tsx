'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Flex, Spinner } from '@chakra-ui/react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

// Define the model context type
interface ModelContextType {
  model: any;
  modelId: string | null;
  loading: boolean;
  error: string | null;
  refreshModel: () => void;
}

// Create the context with default values
const ModelContextValue = createContext<ModelContextType>({
  model: null,
  modelId: null,
  loading: false,
  error: null,
  refreshModel: () => {},
});

// Hook to use the model context
export const useModelContext = () => useContext(ModelContextValue);

// Provider component
export const ModelContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const params = useParams();
  const modelId = params?.id as string || null;
  
  const [model, setModel] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Track if initial load has been completed
  const initialLoadCompletedRef = useRef<boolean>(false);
  // Track last refresh time
  const lastRefreshTimeRef = useRef<number>(0);
  
  // Function to fetch model data
  const fetchModel = async () => {
    if (!modelId) {
      console.error('ModelContext: No modelId provided');
      setLoading(false);
      setError('No model ID provided');
      return;
    }
    
    // Check if we've refreshed too recently (within 2 seconds)
    const now = Date.now();
    if (initialLoadCompletedRef.current && now - lastRefreshTimeRef.current < 2000) {
      console.log('ModelContext: Skipping refresh - too soon since last refresh');
      return;
    }
    
    // Update last refresh time
    lastRefreshTimeRef.current = now;
    
    console.log('ModelContext: Fetching model data for ID:', modelId);
    setLoading(true);
    setError(null);
    
    try {
      // Use the correct API endpoint format with query parameter
      const response = await fetch(`/api/models?id=${modelId}`, {
        credentials: 'same-origin'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('ModelContext: API error response:', errorData);
        throw new Error(errorData.error?.message || `Failed to fetch model: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('ModelContext: Model data received:', data);
      
      if (!data.data) {
        throw new Error('Model data not found in response');
      }
      
      setModel(data.data);
      initialLoadCompletedRef.current = true;
    } catch (error) {
      console.error('Error fetching model:', error);
      setError('Failed to load model');
      toast.error('Failed to load model data');
    } finally {
      setLoading(false);
    }
  };
  
  // Refresh model data - only used for explicit refreshes
  const refreshModel = () => {
    console.log('ModelContext: Explicit model refresh requested');
    fetchModel();
  };
  
  // Fetch model data on mount or when modelId changes - only once
  useEffect(() => {
    if (modelId && !initialLoadCompletedRef.current) {
      console.log('ModelContext: Initial model data load');
      fetchModel();
    }
  }, [modelId]);
  
  // Provide a value even when loading
  const contextValue = {
    model,
    modelId,
    loading,
    error,
    refreshModel
  };
  
  // Early return if model is loading
  if (loading && !model) {
    return (
      <ModelContextValue.Provider value={contextValue}>
        <Flex justify="center" align="center" py={16}>
          <Spinner color="brand.500" size="xl" />
        </Flex>
        {children}
      </ModelContextValue.Provider>
    );
  }
  
  return (
    <ModelContextValue.Provider value={contextValue}>
      {children}
    </ModelContextValue.Provider>
  );
};
