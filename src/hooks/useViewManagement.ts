import { useState, useEffect } from 'react';
import { viewService } from '@/lib/services/viewService';
import type { ModelView, ViewConfig } from '@/types/viewDefinition';
import useViewStore from '@/lib/stores/viewStore';
import { toast } from 'sonner';

// Helper to check if a field is a system field
const isSystemField = (field: string) => field.startsWith('_');

// Helper to determine field format type
const getFieldFormatType = (field: string): ColumnFormatType => {
  if (field.endsWith('_at')) return 'date';
  return 'text';
};

// Column format types
type ColumnFormatType = 'text' | 'number' | 'boolean' | 'date' | 'custom';

interface UseViewManagementOptions {
  modelId: string;
}

interface UseViewManagementReturn {
  isEditing: boolean;
  editingView: ModelView | undefined;
  currentView: ModelView | undefined;
  loading: boolean;
  error: string | null;
  handleViewSelect: (viewId: string) => void;
  handleCreateView: () => void;
  handleEditView: (viewId: string) => void;
  handleDeleteView: (viewId: string) => Promise<void>;
  handleSaveView: (formData: Partial<ModelView>) => Promise<void>;
  handleViewConfigChange: (config: Partial<ViewConfig>) => Promise<void>;
  setIsEditing: (isEditing: boolean) => void;
}

export function useViewManagement({ modelId }: UseViewManagementOptions): UseViewManagementReturn {
  const [isEditing, setIsEditing] = useState(false);
  const [editingView, setEditingView] = useState<ModelView | undefined>();
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  const {
    views,
    activeView,
    loading: storeLoading,
    error: storeError,
    setViews,
    setActiveView,
    addView,
    updateView,
    deleteView: removeView,
    setLoading,
    setError,
  } = useViewStore();

  // Ensure views is always defined
  const safeViews = views || [];

  // Calculate current view safely
  const currentView = safeViews.find((v) => v.id === activeView);

  useEffect(() => {
    if (!modelId) return;
    
    const loadViewsData = async () => {
      if (hasInitialLoad) return;
      
      const loadingToast = toast.loading('Loading views...');
      
      try {
        setLoading(true);
        setError(null);
        
        // First try to get all views
        const modelViews = await viewService.listViews(modelId);
        
        if (Array.isArray(modelViews) && modelViews.length > 0) {
          setViews(modelViews);
          
          // If there's a default view, use it
          const defaultView = modelViews.find(v => v.is_default);
          if (defaultView) {
            setActiveView(defaultView.id);
          } else {
            // If no default view but we have views, use the first one
            setActiveView(modelViews[0].id);
          }
          
          toast.dismiss(loadingToast);
          toast.success('Views loaded successfully');
        } else {
          // No views exist, create a default view
          try {
            // Get model fields to create default columns
            const modelResponse = await fetch(`/api/models?id=${modelId}`);
            if (!modelResponse.ok) {
              throw new Error('Failed to get model fields');
            }
            const { data: model } = await modelResponse.json();
            if (!model?.fields) {
              throw new Error('Model fields not found');
            }

            // Get all available fields including system fields from a sample record
            const sampleDataResponse = await fetch(`/api/data/${modelId}?limit=1`);
            if (!sampleDataResponse.ok) {
              throw new Error('Failed to get sample data');
            }
            const sampleData = await sampleDataResponse.json();
            const sampleRecord = sampleData.data?.[0] || {};

            // Create default config
            const defaultConfig: ViewConfig = {
              columns: [
                // Add user-defined fields (visible by default)
                ...Object.keys(model.fields).map(field => ({
                  field,
                  visible: true,
                  sortable: true,
                  filterable: true,
                  width: 150,
                  format: {
                    type: 'text' as ColumnFormatType
                  }
                })),
                // Add system fields (hidden by default)
                ...Object.keys(sampleRecord)
                  .filter(field => isSystemField(field))
                  .map(field => ({
                    field,
                    visible: false,
                    sortable: true,
                    filterable: true,
                    width: 150,
                    format: {
                      type: getFieldFormatType(field)
                    }
                  }))
              ],
              sorting: [{
                field: '_created_at',
                direction: 'desc'
              }],
              filters: [],
              layout: {
                density: 'normal',
                theme: 'system'
              }
            };

            // Create the default view
            const defaultView = await viewService.createView(
              modelId,
              'Default View',
              defaultConfig,
              'Auto-generated default view',
              true, // Make it default
              false // Not public
            );

            setViews([defaultView]);
            setActiveView(defaultView.id);
            toast.dismiss(loadingToast);
            toast.success('Default view created');
          } catch (error) {
            console.error('Error creating default view:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to create default view';
            setError(errorMessage);
            setViews([]);
            toast.dismiss(loadingToast);
            toast.error(errorMessage);
          }
        }
      } catch (error) {
        console.error('Error loading views:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load views';
        setError(errorMessage);
        setViews([]);
        toast.dismiss(loadingToast);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
        setHasInitialLoad(true);
      }
    };

    loadViewsData();
  }, [modelId]);

  const handleViewSelect = (viewId: string) => {
    setActiveView(viewId);
  };

  // Helper to generate a unique view name
  const generateUniqueName = (baseName: string, existingViews: ModelView[]): string => {
    const names = new Set(existingViews.map(v => v.name));
    let counter = 1;
    let newName = baseName;
    
    while (names.has(newName)) {
      counter++;
      newName = `${baseName} ${counter}`;
    }
    
    return newName;
  };

  const handleCreateView = async () => {
    // Set loading state immediately
    setLoading(true);
    setError(null);
    const loadingToast = toast.loading('Creating new view...');

    try {
      // Get the current user
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        throw new Error('Failed to get user session');
      }
      const { user } = await response.json();
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Get model fields to create default columns
      const modelResponse = await fetch(`/api/models?id=${modelId}`);
      if (!modelResponse.ok) {
        throw new Error('Failed to get model fields');
      }
      const { data: model } = await modelResponse.json();
      if (!model?.fields) {
        throw new Error('Model fields not found');
      }

      // Get all available fields including system fields from a sample record
      const sampleDataResponse = await fetch(`/api/data/${modelId}?limit=1`);
      if (!sampleDataResponse.ok) {
        throw new Error('Failed to get sample data');
      }
      const sampleData = await sampleDataResponse.json();
      const sampleRecord = sampleData.data?.[0] || {};

      // Create default config with all user fields visible and system fields hidden
      const defaultConfig: ViewConfig = {
        columns: [
          // Add user-defined fields (visible by default)
          ...Object.keys(model.fields).map(field => ({
            field,
            visible: true,
            sortable: true,
            filterable: true,
            width: 150,
            format: {
              type: 'text' as ColumnFormatType
            }
          })),
          // Add system fields (hidden by default)
          ...Object.keys(sampleRecord)
            .filter(field => isSystemField(field))
            .map(field => ({
              field,
              visible: false,
              sortable: true,
              filterable: true,
              width: 150,
              format: {
                type: getFieldFormatType(field)
              }
            }))
        ],
        sorting: [{
          field: '_created_at',
          direction: 'desc'
        }],
        filters: [],
        layout: {
          density: 'normal',
          theme: 'system'
        }
      };

      // Generate a unique name for the new view
      const viewName = generateUniqueName('New View', safeViews);

      // Create the view
      const newView = await viewService.createView(
        modelId,
        viewName,
        defaultConfig,
        '',
        safeViews.length === 0, // Make it default if it's the first view
        false // Not public by default
      );

      // Add to store and set as active
      addView(newView);
      setActiveView(newView.id);

      // Set up for editing the name
      setEditingView(newView);
      setIsEditing(true);

      toast.dismiss(loadingToast);
      toast.success('New view created successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create view';
      setError(errorMessage);
      console.error('Error creating view:', error);
      toast.dismiss(loadingToast);
      toast.error(errorMessage);
      
      // Reset editing state on error
      setEditingView(undefined);
      setIsEditing(false);
    } finally {
      setLoading(false); // Always ensure loading state is cleared
    }
  };

  const handleEditView = (viewId: string) => {
    const view = safeViews.find((v) => v.id === viewId);
    if (view) {
      setEditingView(view);
      setIsEditing(true);
    }
  };

  const handleDeleteView = async (viewId: string) => {
    const loadingToast = toast.loading('Deleting view...');
    try {
      setLoading(true);
      await viewService.deleteView(modelId, viewId);
      removeView(viewId);
      
      // If we deleted the active view, switch to another view
      if (activeView === viewId && safeViews.length > 0) {
        const remainingViews = safeViews.filter(v => v.id !== viewId);
        if (remainingViews.length > 0) {
          const defaultView = remainingViews.find(v => v.is_default);
          const newActiveId = defaultView?.id || remainingViews[0]?.id;
          setActiveView(newActiveId);
        } else {
          setActiveView(null);
        }
      }
      toast.dismiss(loadingToast);
      toast.success('View deleted successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      toast.dismiss(loadingToast);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveView = async (formData: Partial<ModelView>) => {
    if (!formData.name || !formData.config) {
      const errorMessage = 'Name and configuration are required';
      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    const loadingToast = toast.loading('Saving view...');
    try {
      setLoading(true);
      let savedView: ModelView;
      
      // Check if a view with this name already exists
      const existingView = safeViews.find(v => v.name === formData.name);
      
      if (editingView?.id || existingView?.id) {
        // Update existing view
        const viewId = editingView?.id || existingView?.id;
        if (!viewId) throw new Error('View ID not found');
        
        savedView = await viewService.updateView(
          modelId,
          viewId,
          {
            name: formData.name,
            description: formData.description || undefined,
            config: formData.config,
            is_default: formData.is_default === true,
            is_public: formData.is_public === true,
          }
        );
        updateView(viewId, savedView);
        setActiveView(savedView.id);
        toast.dismiss(loadingToast);
        toast.success('View updated successfully');
      } else {
        // Create new view
        savedView = await viewService.createView(
          modelId,
          formData.name,
          formData.config,
          formData.description || '',
          formData.is_default === true,
          formData.is_public === true
        );
        addView(savedView);
        if (savedView.id) {
          setActiveView(savedView.id);
        }
        toast.dismiss(loadingToast);
        toast.success('View created successfully');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save view';
      setError(errorMessage);
      toast.dismiss(loadingToast);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setIsEditing(false);
      setEditingView(undefined);
    }
  };

  const handleViewConfigChange = async (configUpdate: Partial<ViewConfig>) => {
    if (!currentView?.id || !currentView.config) return;
    
    try {
      const baseConfig = currentView.config;
      const updatedConfig: ViewConfig = {
        columns: Array.isArray(configUpdate.columns) ? configUpdate.columns : baseConfig.columns,
        sorting: Array.isArray(configUpdate.sorting) ? configUpdate.sorting : baseConfig.sorting,
        filters: Array.isArray(configUpdate.filters) ? configUpdate.filters : baseConfig.filters,
        layout: {
          ...baseConfig.layout,
          ...(configUpdate.layout || {}),
          density: configUpdate.layout?.density || baseConfig.layout.density,
        },
        grouping: configUpdate.grouping || baseConfig.grouping,
        realtime: configUpdate.realtime || baseConfig.realtime,
      };

      // Only update the view in the store
      const updatedView = {
        ...currentView,
        config: updatedConfig,
      };
      updateView(currentView.id, updatedView);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update view configuration');
      throw error;
    }
  };

  return {
    isEditing,
    editingView,
    currentView,
    loading: storeLoading,
    error: storeError,
    handleViewSelect,
    handleCreateView,
    handleEditView,
    handleDeleteView,
    handleSaveView,
    handleViewConfigChange,
    setIsEditing,
  };
} 