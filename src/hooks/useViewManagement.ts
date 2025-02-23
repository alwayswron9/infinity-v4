import { useState, useEffect } from 'react';
import { viewService } from '@/lib/services/viewService';
import type { ModelView, ViewConfig } from '@/types/viewDefinition';
import useViewStore from '@/lib/stores/viewStore';

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
      
      try {
        setLoading(true);
        setError(null);
        console.log('Loading views for model:', modelId); // Debug log
        
        const modelViews = await viewService.listViews(modelId);
        console.log('Received views:', modelViews); // Debug log
        
        if (Array.isArray(modelViews) && modelViews.length > 0) {
          setViews(modelViews);
          
          // Set active view if none is selected
          if (!activeView) {
            const defaultView = modelViews.find(v => v.is_default);
            setActiveView(defaultView?.id || modelViews[0].id);
          }
        } else {
          console.log('No views found or invalid response'); // Debug log
          setViews([]);
        }
      } catch (error) {
        console.error('Error loading views:', error); // Debug log
        setError(error instanceof Error ? error.message : 'Failed to load views');
        setViews([]);
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

  const handleCreateView = () => {
    setEditingView(undefined);
    setIsEditing(true);
  };

  const handleEditView = (viewId: string) => {
    const view = safeViews.find((v) => v.id === viewId);
    if (view) {
      setEditingView(view);
      setIsEditing(true);
    }
  };

  const handleDeleteView = async (viewId: string) => {
    try {
      setLoading(true);
      await viewService.deleteView(viewId);
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
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveView = async (formData: Partial<ModelView>) => {
    if (!formData.name || !formData.config) {
      setError('Name and configuration are required');
      return;
    }

    try {
      setLoading(true);
      let savedView: ModelView;
      
      if (editingView?.id) {
        // Update existing view
        savedView = await viewService.updateView(editingView.id, {
          name: formData.name,
          description: formData.description || undefined,
          config: formData.config,
          is_default: formData.is_default === true,
          is_public: formData.is_public === true,
        });
        updateView(editingView.id, savedView);
        setActiveView(savedView.id);
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
      }
      setIsEditing(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
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

      const updatedView = await viewService.updateView(currentView.id, {
        config: updatedConfig,
      });
      updateView(currentView.id, updatedView);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update view configuration');
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