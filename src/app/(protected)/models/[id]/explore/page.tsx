"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { EnhancedDataTable } from '@/components/data/EnhancedDataTable';
import { ViewSelector } from '@/components/data/ViewSelector';
import { ViewEditor } from '@/components/data/ViewEditor';
import type { ModelView, ViewConfig, ViewColumnConfig } from '@/types/viewDefinition';
import type { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { ChevronLeft, Save } from 'lucide-react';
import { useModelData } from '@/hooks/useModelData';
import { useViewManagement } from '@/hooks/useViewManagement';
import useViewStore from '@/lib/stores/viewStore';
import { cn } from '@/lib/utils';

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

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onEditEnd}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onEditEnd();
          if (e.key === 'Escape') onEditEnd();
        }}
        className={cn(
          "bg-transparent border-none outline-none focus:ring-0",
          "text-2xl font-semibold",
          className
        )}
      />
    );
  }

  return (
    <h2 
      onClick={onEditStart}
      className={cn(
        "text-2xl font-semibold cursor-pointer hover:opacity-80",
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
  } = useViewManagement({ modelId });

  const { views, activeView } = useViewStore();

  // Add state for view name editing
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [editedName, setEditedName] = React.useState('');

  // Handle view name edit
  const handleViewNameEdit = React.useCallback((newName: string) => {
    if (!currentView || newName === currentView.name) return;
    setHasUnsavedChanges(true);
    handleSaveView({
      ...currentView,
      name: newName
    });
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

  // Handle view selection
  const handleViewSelect = React.useCallback((viewId: string) => {
    baseHandleViewSelect(viewId);
    setIsInitialLoad(true); // Reset initial load flag to trigger data reload
    setHasUnsavedChanges(false);
  }, [baseHandleViewSelect]);

  // Handle pagination changes
  const handlePaginationChange = React.useCallback((pageIndex: number, pageSize: number) => {
    if (!currentView) return;
    loadModelData(pageIndex + 1, pageSize);
  }, [currentView, loadModelData]);

  // Handle view config changes (filters, sorting, etc.)
  const handleViewConfigChange = React.useCallback(async (configUpdate: Partial<ViewConfig>) => {
    try {
      await baseHandleViewConfigChange(configUpdate);
      setHasUnsavedChanges(true);
      
      if (pagination) {
        handlePaginationChange(0, pagination.pageSize);
      }
    } catch (error) {
      console.error('Error updating view config:', error);
    }
  }, [baseHandleViewConfigChange, pagination, handlePaginationChange]);

  // Handle saving the current view
  const handleSaveCurrentView = React.useCallback(async () => {
    if (!currentView) return;
    
    try {
      await handleSaveView(currentView);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving view:', error);
    }
  }, [currentView, handleSaveView]);

  const getColumns = React.useCallback((view: ModelView): ColumnDef<Record<string, any>>[] => {
    if (!view?.config?.columns) return [];
    
    return view.config.columns
      .filter((col: ViewColumnConfig) => col.visible)
      .map((col: ViewColumnConfig) => ({
        accessorKey: col.field,
        header: col.field,
        size: col.width,
        enableSorting: col.sortable ?? true,
        enableColumnFilter: col.filterable ?? true,
      }));
  }, []);

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

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Link 
              href="/models" 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-lg font-semibold">Explore Data</h1>
          </div>
          
          {currentView && hasUnsavedChanges && (
            <button
              onClick={handleSaveCurrentView}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
            >
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </button>
          )}
        </div>
      </div>

      <div className="container space-y-6">
        <div className="flex items-center justify-between">
          <ViewSelector
            views={safeViews}
            activeViewId={activeView}
            onViewSelect={handleViewSelect}
            onCreateView={handleCreateView}
            isLoading={isLoadingViews}
          />
          {currentView && (
            <EditableHeading
              value={editedName}
              onChange={setEditedName}
              isEditing={isEditingName}
              onEditStart={() => setIsEditingName(true)}
              onEditEnd={() => {
                setIsEditingName(false);
                handleViewNameEdit(editedName);
              }}
            />
          )}
        </div>

        {currentView ? (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <EnhancedDataTable
              data={data}
              columns={getColumns(currentView)}
              viewConfig={currentView.config}
              pagination={pagination}
              onPaginationChange={handlePaginationChange}
              onConfigChange={handleViewConfigChange}
              isLoading={isLoadingData && !isInitialLoad}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 bg-card border border-border rounded-lg">
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
    </div>
  );
} 