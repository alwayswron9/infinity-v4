"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import type { ModelView as ModelViewType, ViewConfig, ViewColumnConfig } from '@/types/viewDefinition';
import type { ColumnDef } from '@tanstack/react-table';
import { useModelData } from '@/hooks/useModelData';
import { useViewManagement } from '@/hooks/useViewManagement';
import useViewStore from '@/lib/stores/viewStore';
import { toast } from 'sonner';

// Import our new components
import { ModelHeader } from '@/components/data/explore/ModelHeader';
import { DataContainer } from '@/components/data/explore/DataContainer';
import { RecordDrawer } from '@/components/data/explore/RecordDrawer';
import { AddDataDrawer } from '@/components/data/explore/AddDataDrawer';
import { LoadingState } from '@/components/data/explore/LoadingState';
import { ErrorState } from '@/components/data/explore/ErrorState';

// Import explore.css styles
import '@/app/explore.css';

export default function ExplorePage() {
  const params = useParams();
  const modelId = typeof params.id === 'string' ? params.id : '';
  
  // Track if initial data load has happened
  const [isInitialLoad, setIsInitialLoad] = React.useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);
  const [modelName, setModelName] = React.useState<string>('');
  const [modelDefinition, setModelDefinition] = React.useState<any>(null);
  const [copyingDetails, setCopyingDetails] = React.useState(false);
  
  // State for the add data drawer
  const [isAddDataOpen, setIsAddDataOpen] = React.useState(false);
  
  // State for record details/edit
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const [currentRecord, setCurrentRecord] = React.useState<Record<string, any> | null>(null);
  
  // Fetch model details
  React.useEffect(() => {
    const fetchModelDetails = async () => {
      try {
        const response = await fetch(`/api/models?id=${modelId}`);
        if (!response.ok) throw new Error('Failed to fetch model details');
        const data = await response.json();
        if (data.success && data.data) {
          setModelName(data.data.name);
          setModelDefinition(data.data);
        }
      } catch (error) {
        console.error('Error fetching model details:', error);
      }
    };

    if (modelId) {
      fetchModelDetails();
    }
  }, [modelId]);

  const {
    data,
    isLoading: isLoadingData,
    error: dataError,
    availableColumns,
    pagination,
    loadModelData,
  } = useModelData({ modelId });

  // Cast the currentView to the consistent ModelViewType to fix type issues
  const {
    currentView: viewManagementCurrentView,
    loading: isLoadingViews,
    error: viewError,
    handleViewSelect: baseHandleViewSelect,
    handleCreateView,
    handleSaveView,
    handleViewConfigChange: baseHandleViewConfigChange,
    handleDeleteView: baseHandleDeleteView,
  } = useViewManagement({ modelId });

  // Explicitly type the currentView to resolve type conflicts
  const currentView = viewManagementCurrentView as ModelViewType | undefined;

  const { views: storeViews, activeView } = useViewStore();

  // Explicitly type the views array to match the component expectations
  const views = storeViews as ModelViewType[];

  // Add state for view name editing
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [editedName, setEditedName] = React.useState('');

  // Handle view selection
  const handleViewSelect = React.useCallback((viewId: string) => {
    baseHandleViewSelect(viewId);
    setIsInitialLoad(true); // Reset initial load flag to trigger data reload
    setHasUnsavedChanges(false);
  }, [baseHandleViewSelect]);

  // Handle view deletion
  const handleDeleteView = React.useCallback(async (viewId: string) => {
    if (!baseHandleDeleteView) return;
    try {
      await baseHandleDeleteView(viewId);
      
      // After successful deletion, if this was the active view, select another view
      if (activeView === viewId && views.length > 1) {
        const remainingViews = views.filter(v => v.id !== viewId);
        const defaultView = remainingViews.find(v => v.is_default);
        const nextView = defaultView || remainingViews[0];
        if (nextView) {
          handleViewSelect(nextView.id);
        }
      }
    } catch (error) {
      console.error('Error deleting view:', error);
    }
  }, [baseHandleDeleteView, activeView, views, handleViewSelect]);

  // Handle view name edit
  const handleViewNameEdit = React.useCallback(async (newName: string) => {
    if (!currentView || newName === currentView.name) return;
    try {
      await handleSaveView({
        ...currentView,
        name: newName
      });
      setHasUnsavedChanges(false);  // Name updates are saved immediately
    } catch (error) {
      console.error('Error updating view name:', error);
    }
  }, [currentView, handleSaveView]);

  // Load initial data when views are ready
  React.useEffect(() => {
    if (!modelId || isLoadingViews || !currentView) return;
    
    if (isInitialLoad) {
      loadModelData(1, 10);
      setIsInitialLoad(false);
    }
  }, [modelId, isLoadingViews, currentView, isInitialLoad, loadModelData]);

  // Update edited name when current view changes
  React.useEffect(() => {
    if (currentView) {
      setEditedName(currentView.name);
      setHasUnsavedChanges(false);
    }
  }, [currentView]);

  // Handle pagination changes
  const handlePaginationChange = React.useCallback((pageIndex: number, pageSize: number) => {
    if (!currentView) return;
    loadModelData(pageIndex + 1, pageSize);
  }, [currentView, loadModelData]);

  // Handle view config changes (filters, sorting, etc.)
  const handleViewConfigChange = React.useCallback(async (configUpdate: Partial<ViewConfig>) => {
    if (!currentView) return;
    
    try {
      // Create updated view with new config
      const updatedView = {
        ...currentView,
        config: { ...currentView.config, ...configUpdate }
      };

      // Update the local state
      await baseHandleViewConfigChange(configUpdate);
      
      setHasUnsavedChanges(true);
      
      if (pagination) {
        handlePaginationChange(0, pagination.pageSize);
      }
    } catch (error) {
      console.error('Error updating view config:', error);
    }
  }, [currentView, baseHandleViewConfigChange, pagination, handlePaginationChange]);

  // Handle saving the current view
  const handleSaveCurrentView = React.useCallback(async () => {
    if (!currentView) return;
    
    try {
      // Get the current view from the store to ensure we have the latest state
      const viewToSave = useViewStore.getState().views.find(v => v.id === currentView.id);
      if (!viewToSave) return;

      await handleSaveView(viewToSave as ModelViewType);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving view:', error);
    }
  }, [currentView, handleSaveView]);

  const getColumns = React.useCallback((view: ModelViewType): ColumnDef<Record<string, any>>[] => {
    // If we have modelDefinition, use its fields to ensure all columns are available
    if (modelDefinition) {
      const allFields = Object.keys(modelDefinition.fields);
      
      // If view doesn't have columns config yet, create it from model fields
      if (!view?.config?.columns) {
        return allFields.map(field => ({
          accessorKey: field,
          header: field,
          enableSorting: true,
          enableColumnFilter: true,
          cell: ({ getValue }) => {
            const value = getValue();
            // Truncate long text values
            if (typeof value === 'string' && value.length > 100) {
              return value.slice(0, 100) + '...';
            }
            return value;
          }
        }));
      }
      
      // Ensure all model fields are in the view columns
      const existingFields = new Set(view.config.columns.map(col => col.field));
      const missingFields = allFields.filter(field => !existingFields.has(field));
      
      // Add any missing fields to the columns config
      const updatedColumns = [
        ...view.config.columns,
        ...missingFields.map(field => ({
          field,
          visible: true,
          sortable: true,
          filterable: true,
          width: 150
        }))
      ];
      
      return updatedColumns
        .filter((col) => col.visible)
        .map((col) => ({
          accessorKey: col.field,
          header: col.field,
          size: col.width,
          enableSorting: col.sortable ?? true,
          enableColumnFilter: col.filterable ?? true,
          cell: ({ getValue }) => {
            const value = getValue();
            // Truncate long text values
            if (typeof value === 'string' && value.length > 100) {
              return value.slice(0, 100) + '...';
            }
            return value;
          }
        }));
    }
    
    // Fallback to existing behavior if no modelDefinition
    if (!view?.config?.columns) return [];
    
    return view.config.columns
      .filter((col) => col.visible)
      .map((col) => ({
        accessorKey: col.field,
        header: col.field,
        size: col.width,
        enableSorting: col.sortable ?? true,
        enableColumnFilter: col.filterable ?? true,
        cell: ({ getValue }) => {
          const value = getValue();
          // Truncate long text values
          if (typeof value === 'string' && value.length > 100) {
            return value.slice(0, 100) + '...';
          }
          return value;
        }
      }));
  }, [modelDefinition]);

  // Handle form submission
  const handleSubmitData = async (data: Record<string, any>) => {
    try {
      const response = await fetch(`/api/data/${modelId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields: data }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to add data');
      }

      toast.success('Data added successfully');
      setIsAddDataOpen(false);
      
      // Reload the data table
      if (pagination) {
        handlePaginationChange(0, pagination.pageSize);
      }
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  // Handle clearing all data
  const handleClearData = async () => {
    try {
      const response = await fetch(`/api/data/${modelId}/clear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to clear data');
      }

      toast.success('All data cleared successfully');
      
      // Reload the data table
      if (pagination) {
        handlePaginationChange(0, pagination.pageSize);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Handle opening record details
  const handleOpenRecord = (row: Record<string, any>) => {
    // Extract the record data
    const { _id, _created_at, _updated_at, _vector, ...recordData } = row;
    
    // Set the current record
    setCurrentRecord({
      _id,
      ...recordData
    });
    
    // Reset edit mode and open details drawer
    setIsEditMode(false);
    setIsDetailsOpen(true);
  };

  // Handle submitting edited data
  const handleSubmitEditedData = async (data: Record<string, any>) => {
    if (!currentRecord || !currentRecord._id) {
      toast.error('Record ID is missing');
      return;
    }
    
    try {
      const response = await fetch(`/api/data/${modelId}?id=${currentRecord._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields: data }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to update record');
      }

      toast.success('Record updated successfully');
      
      // Exit edit mode but keep drawer open
      setIsEditMode(false);
      
      // Update current record with new data
      setCurrentRecord({
        _id: currentRecord._id,
        ...data
      });
      
      // Reload the data table
      if (pagination) {
        handlePaginationChange(pagination.pageIndex, pagination.pageSize);
      }
    } catch (error: any) {
      console.error('Error updating record:', error);
      toast.error(error.message || 'Failed to update record');
    }
  };

  // Handle deleting a record
  const handleDeleteRow = async (row: Record<string, any>) => {
    if (!row._id) {
      toast.error('Record ID is missing');
      return;
    }
    
    // Confirm deletion
    if (!window.confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/data/${modelId}?id=${row._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to delete record');
      }

      toast.success('Record deleted successfully');
      
      // Reload the data table
      if (pagination) {
        handlePaginationChange(pagination.pageIndex, pagination.pageSize);
      }
    } catch (error: any) {
      console.error('Error deleting record:', error);
      toast.error(error.message || 'Failed to delete record');
    }
  };

  // Handle copying model details
  const handleCopyModelDetails = async () => {
    if (!modelId) return;
    
    setCopyingDetails(true);
    try {
      const response = await fetch(`/api/models/${modelId}/details`, {
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

  // Determine overall loading state
  const isLoading = isLoadingViews || (isInitialLoad && isLoadingData);
  const error = viewError || dataError;

  // Show loading state during initial load
  if (isLoading) {
    return <LoadingState message={isLoadingViews ? 'Loading views...' : 'Loading data...'} />;
  }

  // Ensure views is always defined
  const safeViews = views || [];

  // Show error state if either views or data failed to load
  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-65px)]">
      <ModelHeader
        modelId={modelId}
        modelName={modelName}
        currentView={currentView || null}
        editedName={editedName}
        isEditingName={isEditingName}
        setEditingName={setIsEditingName}
        onViewNameEdit={handleViewNameEdit}
        onCopyModelDetails={handleCopyModelDetails}
        onAddData={() => setIsAddDataOpen(true)}
        onClearData={handleClearData}
        copyingDetails={copyingDetails}
        views={safeViews}
        activeViewId={activeView}
        onViewSelect={handleViewSelect}
        onCreateView={handleCreateView}
        onDeleteView={handleDeleteView}
        setEditedName={setEditedName}
      />

      <DataContainer
        currentView={currentView || null}
        data={data}
        columns={currentView ? getColumns(currentView) : []}
        pagination={pagination}
        isLoadingData={isLoadingData}
        isInitialLoad={isInitialLoad}
        hasUnsavedChanges={hasUnsavedChanges}
        availableColumns={availableColumns}
        onPaginationChange={handlePaginationChange}
        onConfigChange={handleViewConfigChange}
        onSave={handleSaveCurrentView}
        onEditRow={handleOpenRecord}
        onDeleteRow={handleDeleteRow}
        onCreateView={handleCreateView}
      />

      {/* Add Data Drawer */}
      {modelDefinition && (
        <AddDataDrawer
          isOpen={isAddDataOpen}
          onClose={() => setIsAddDataOpen(false)}
          modelName={modelName}
          modelDefinition={modelDefinition}
          onSubmit={handleSubmitData}
        />
      )}
      
      {/* Record Details Drawer */}
      {modelDefinition && currentRecord && (
        <RecordDrawer
          isOpen={isDetailsOpen}
          onClose={() => {
            setIsDetailsOpen(false);
            setCurrentRecord(null);
            setIsEditMode(false);
          }}
          isEditMode={isEditMode}
          setEditMode={setIsEditMode}
          title={isEditMode ? "Edit Record" : "Record Details"}
          record={currentRecord}
          model={modelDefinition}
          onSubmit={handleSubmitEditedData}
        />
      )}
    </div>
  );
} 