import { toast } from 'sonner';

// Types for our handlers
export interface DataHandlerProps {
  modelId: string | null;
  loadModelData: (page?: number, limit?: number, showLoadingState?: boolean) => Promise<void>;
  pagination: {
    pageIndex: number;
    pageSize: number;
    pageCount: number;
    total: number;
  } | null;
  onRecordDrawerClose: () => void;
  onAddDataClose: () => void;
  currentRecord?: Record<string, any> | null;
  handleRefreshData: () => void;
  setPagination: (pagination: any) => void;
}

// Function to refresh data - only called explicitly after data operations
export const createRefreshDataHandler = (props: {
  modelId: string | null;
  pagination: {
    pageIndex: number;
    pageSize: number;
    pageCount: number;
    total: number;
  } | null;
  loadModelData: (page?: number, limit?: number, showLoadingState?: boolean) => Promise<void>;
}) => {
  const { modelId, pagination, loadModelData } = props;
  
  // Create refs in the component that uses this
  let isManualRefreshing = false;
  let lastRefreshTime = Date.now();
  
  return () => {
    // Set manual refreshing flag to true
    isManualRefreshing = true;
    
    // Check if we've refreshed too recently (within 500ms)
    const now = Date.now();
    if (now - lastRefreshTime < 500) {
      console.log('Skipping manual refresh - too soon since last refresh');
      return;
    }
    
    // Update last refresh time
    lastRefreshTime = now;
    
    console.log('Performing explicit manual refresh');
    
    if (modelId && pagination) {
      // Pass false for showLoadingState to avoid UI flicker during refresh
      loadModelData(pagination.pageIndex + 1, pagination.pageSize, false);
    } else if (modelId) {
      loadModelData(1, 10, false);
    }
    
    // Reset manual refreshing flag after a short delay
    setTimeout(() => {
      isManualRefreshing = false;
    }, 1000);
  };
};

// Handle pagination change
export const createPaginationHandler = (props: {
  pagination: {
    pageIndex: number;
    pageSize: number;
    pageCount: number;
    total: number;
  } | null;
  loadModelData: (page?: number, limit?: number, showLoadingState?: boolean) => Promise<void>;
  setPagination: (pagination: any) => void;
}) => {
  const { pagination, loadModelData, setPagination } = props;
  
  return (pageIndex: number, pageSize: number) => {
    setPagination({
      pageIndex,
      pageSize,
      pageCount: Math.ceil((pagination?.total || 0) / pageSize),
      total: pagination?.total || 0
    });
    // This is an explicit data load, not a refresh
    console.log('Loading data for pagination change:', pageIndex + 1, pageSize);
    loadModelData(pageIndex + 1, pageSize, true);
  };
};

// Handle delete row
export const createDeleteRowHandler = (props: {
  modelId: string | null;
  handleRefreshData: () => void;
}) => {
  const { modelId, handleRefreshData } = props;
  
  return async (row: Record<string, any>) => {
    if (!modelId || !row._id) return;
    
    try {
      const response = await fetch(`/api/data/${modelId}?id=${row._id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete record');
      }
      
      toast.success('Record deleted successfully');
      
      // Refresh data after deletion - this is an explicit refresh
      console.log('Refreshing data after deletion');
      handleRefreshData();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      toast.error(errorMessage);
    }
  };
};

// Handle submit data
export const createSubmitDataHandler = (props: {
  modelId: string | null;
  handleRefreshData: () => void;
  onAddDataClose: () => void;
}) => {
  const { modelId, handleRefreshData, onAddDataClose } = props;
  
  return async (data: Record<string, any>) => {
    if (!modelId) return;
    
    try {
      const response = await fetch(`/api/data/${modelId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields: data }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add data');
      }
      
      toast.success('Data added successfully');
      onAddDataClose();
      
      // Refresh data after adding - this is an explicit refresh
      console.log('Refreshing data after adding new record');
      handleRefreshData();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      toast.error(errorMessage);
    }
  };
};

// Handle update record
export const createUpdateRecordHandler = (props: {
  modelId: string | null;
  handleRefreshData: () => void;
  onRecordDrawerClose: () => void;
  currentRecord: Record<string, any> | null;
}) => {
  const { modelId, handleRefreshData, onRecordDrawerClose, currentRecord } = props;
  
  return async (data: Record<string, any>) => {
    if (!modelId || !currentRecord?._id) return;
    
    try {
      const response = await fetch(`/api/data/${modelId}?id=${currentRecord._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields: data }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update record');
      }
      
      toast.success('Record updated successfully');
      onRecordDrawerClose();
      
      // Refresh data after updating - this is an explicit refresh
      console.log('Refreshing data after updating record');
      handleRefreshData();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      toast.error(errorMessage);
    }
  };
};

// Handle clear data
export const createClearDataHandler = (props: {
  modelId: string | null;
  handleRefreshData: () => void;
}) => {
  const { modelId, handleRefreshData } = props;
  
  return async () => {
    if (!modelId) return;
    
    try {
      const response = await fetch(`/api/data/${modelId}/clear`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to clear data');
      }
      
      toast.success('All data cleared successfully');
      
      // Refresh data after clearing - this is an explicit refresh
      console.log('Refreshing data after clearing all data');
      handleRefreshData();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      toast.error(errorMessage);
    }
  };
};

// Handle copy model details
export const createCopyModelDetailsHandler = (props: { 
  model: any;
  setCopyingDetails: (value: boolean) => void;
}) => {
  const { model, setCopyingDetails } = props;
  
  return async () => {
    if (!model) return;
    
    setCopyingDetails(true);
    try {
      // Create a formatted string with model details
      const detailsText = `Model: ${model.name}
ID: ${model.id}
Description: ${model.description || 'N/A'}
Fields: ${Object.keys(model.fields || {}).join(', ')}`;
      
      await navigator.clipboard.writeText(detailsText);
      toast.success('Model details copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy details');
    } finally {
      setCopyingDetails(false);
    }
  };
};
