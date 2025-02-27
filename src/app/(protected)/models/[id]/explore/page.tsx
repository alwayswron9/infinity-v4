"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { EnhancedDataTable } from '@/components/data/table/EnhancedDataTable';
import { ViewSelector } from '@/components/data/table/ViewSelector';
import type { ModelView, ViewConfig, ViewColumnConfig } from '@/types/viewDefinition';
import type { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { ChevronLeft, Save, DatabaseIcon, LayoutDashboardIcon, Plus } from 'lucide-react';
import { useModelData } from '@/hooks/useModelData';
import { useViewManagement } from '@/hooks/useViewManagement';
import useViewStore from '@/lib/stores/viewStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SideDrawer } from '@/components/layout/SideDrawer';
import { ModelDataForm } from '@/components/models/ModelDataForm';
import { toast } from 'sonner';

// Add EditableHeading component
function EditableHeading({ 
  value, 
  onChange, 
  isEditing, 
  onEditStart, 
  onEditEnd,
  className 
}: { 
  value: string;
  onChange: (value: string) => void;
  isEditing: boolean;
  onEditStart: () => void;
  onEditEnd: () => void;
  className?: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      onEditEnd();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      onEditEnd();
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onEditEnd}
        onKeyDown={handleKeyDown}
        className={cn(
          "bg-transparent border-none outline-none focus:ring-0",
          "text-base font-medium",
          className
        )}
      />
    );
  }

  return (
    <h2 
      onClick={onEditStart}
      className={cn(
        "text-base font-medium cursor-pointer hover:opacity-80",
        className
      )}
    >
      {value}
    </h2>
  );
}

export default function ExplorePage() {
  const params = useParams();
  const modelId = typeof params.id === 'string' ? params.id : '';
  
  // Track if initial data load has happened
  const [isInitialLoad, setIsInitialLoad] = React.useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);
  const [modelName, setModelName] = React.useState<string>('');
  const [modelDefinition, setModelDefinition] = React.useState<any>(null);
  
  // State for the add data drawer
  const [isAddDataOpen, setIsAddDataOpen] = React.useState(false);
  
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

  const {
    currentView,
    loading: isLoadingViews,
    error: viewError,
    handleViewSelect: baseHandleViewSelect,
    handleCreateView,
    handleSaveView,
    handleViewConfigChange: baseHandleViewConfigChange,
    handleDeleteView: baseHandleDeleteView,
  } = useViewManagement({ modelId });

  const { views, activeView } = useViewStore();

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

      await handleSaveView(viewToSave);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving view:', error);
    }
  }, [currentView, handleSaveView]);

  const getColumns = React.useCallback((view: ModelView): ColumnDef<Record<string, any>>[] => {
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
      }));
  }, [modelDefinition]);

  // Determine overall loading state
  const isLoading = isLoadingViews || (isInitialLoad && isLoadingData);
  const error = viewError || dataError;

  // Show loading state during initial load
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-muted-foreground flex flex-col items-center gap-4">
          <svg className="animate-spin h-8 w-8" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-lg">{isLoadingViews ? 'Loading views...' : 'Loading data...'}</span>
        </div>
      </div>
    );
  }

  // Ensure views is always defined
  const safeViews = views || [];

  // Show error state if either views or data failed to load
  if (error) {
    return (
      <div className="container py-8">
        <div className="p-6 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
          <div className="flex items-center gap-3">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold">Error Loading Data</h3>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

  return (
    <div className="flex flex-col h-[calc(100vh-65px)]">
      <div className="border-b border-border bg-background flex-shrink-0">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-4">
            <Link 
              href="/models" 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <DatabaseIcon className="h-5 w-5" />
              <div className="flex flex-col">
                <h1 className="text-lg font-semibold">{modelName}</h1>
              </div>
            </div>
            {currentView && (
              <div className="flex items-center gap-2 pl-4 border-l border-border">
                <LayoutDashboardIcon className="h-4 w-4 text-muted-foreground" />
                <EditableHeading
                  value={editedName}
                  onChange={setEditedName}
                  isEditing={isEditingName}
                  onEditStart={() => setIsEditingName(true)}
                  onEditEnd={() => {
                    setIsEditingName(false);
                    handleViewNameEdit(editedName);
                  }}
                  className="text-sm"
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsAddDataOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Data
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (window.confirm(`Are you sure you want to clear all data for ${modelName}? This action cannot be undone.`)) {
                  handleClearData();
                }
              }}
              className="gap-2 text-warning"
            >
              <DatabaseIcon className="h-4 w-4" />
              Clear Data
            </Button>
            <ViewSelector
              views={safeViews}
              activeViewId={activeView}
              onViewSelect={handleViewSelect}
              onCreateView={handleCreateView}
              onDeleteView={handleDeleteView}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 container py-4">
        {currentView ? (
          <div className="h-full">
            <EnhancedDataTable
              data={data}
              columns={getColumns(currentView)}
              viewConfig={currentView.config}
              pagination={pagination}
              onPaginationChange={handlePaginationChange}
              onConfigChange={handleViewConfigChange}
              isLoading={isLoadingData && !isInitialLoad}
              hasUnsavedChanges={hasUnsavedChanges}
              onSave={handleSaveCurrentView}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-card border border-border rounded-lg">
            <div className="text-muted-foreground mb-4">No view selected</div>
            <button
              onClick={handleCreateView}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
            >
              Create your first view
            </button>
          </div>
        )}
      </div>

      {/* Add Data Drawer */}
      {modelDefinition && (
        <SideDrawer
          isOpen={isAddDataOpen}
          onClose={() => setIsAddDataOpen(false)}
          title={`Add Data to ${modelName}`}
        >
          <ModelDataForm
            model={modelDefinition}
            onSubmit={handleSubmitData}
            onCancel={() => setIsAddDataOpen(false)}
          />
        </SideDrawer>
      )}
    </div>
  );
} 