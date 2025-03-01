'use client';

import { useEffect, useState } from 'react';
import { useModels } from '@/hooks/useModels';
import { SideDrawer } from '@/components/layout/SideDrawer';
import { ModelDataForm } from '@/components/models/ModelDataForm';
import { ModelsHeader } from '@/components/models/ModelsHeader';
import { ModelsGrid } from '@/components/models/ModelsGrid';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function ModelsPage() {
  const {
    filteredModels,
    loading,
    error,
    searchQuery,
    showArchived,
    setSearchQuery,
    setShowArchived,
    loadModels,
    handleArchiveToggle,
    handleDeleteModel,
  } = useModels();

  // State for the add data drawer
  const [isAddDataOpen, setIsAddDataOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  // Handle adding data to a model
  const handleAddData = async (modelId: string) => {
    setSelectedModel(modelId);
    setIsAddDataOpen(true);
  };

  // Handle clearing all data for a model
  const handleClearData = async (modelId: string, modelName: string) => {
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

      toast.success(`All data for ${modelName} cleared successfully`);
      loadModels(); // Refresh the models list to update record counts
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Handle form submission
  const handleSubmitData = async (data: Record<string, any>) => {
    if (!selectedModel) return;

    try {
      const response = await fetch(`/api/data/${selectedModel}`, {
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
      loadModels(); // Refresh the models list to update record counts
      setIsAddDataOpen(false);
    } catch (error: any) {
      toast.error(error.message);
      throw error; // Re-throw to be handled by the form
    }
  };

  // Get the selected model definition
  const selectedModelDef = selectedModel 
    ? filteredModels.find(m => m.id === selectedModel)
    : null;

  return (
    <div className="page-container">
      <ModelsHeader 
        searchQuery={searchQuery}
        showArchived={showArchived}
        onSearchChange={setSearchQuery}
        onShowArchivedChange={setShowArchived}
      />
      
      <div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-primary border-t-transparent mb-4"></div>
              <p className="text-text-secondary">Loading models...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-16">
            <div className="bg-status-error-subtle p-4 rounded-lg max-w-md text-center">
              <p className="text-status-error">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadModels} 
                className="mt-4 border-status-error text-status-error hover:bg-status-error-subtle"
              >
                Retry
              </Button>
            </div>
          </div>
        ) : filteredModels.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="bg-surface-2 rounded-full p-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-brand-secondary">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-text-primary">No models found</h3>
            <p className="text-text-secondary max-w-md text-center">
              There are no models matching your current filters. Try changing your search or create a new model.
            </p>
            <Link href="/models/new">
              <Button className="action-button-primary mt-2 py-2 px-4">
                <Plus className="h-4 w-4 mr-2" />
                Create new model
              </Button>
            </Link>
          </div>
        ) : (
        <ModelsGrid 
          models={filteredModels}
          loading={loading}
          error={error}
          onAddData={handleAddData}
          onArchiveToggle={handleArchiveToggle}
          onClearData={handleClearData}
          onDelete={handleDeleteModel}
        />
        )}
      </div>
      
      {/* Add Data Drawer */}
      {selectedModelDef && (
        <SideDrawer
          isOpen={isAddDataOpen}
          onClose={() => setIsAddDataOpen(false)}
          title={`Add Data to ${selectedModelDef.name}`}
        >
          <ModelDataForm
            model={selectedModelDef}
            onSubmit={handleSubmitData}
            onCancel={() => setIsAddDataOpen(false)}
          />
        </SideDrawer>
      )}
    </div>
  );
} 