'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useModels } from '@/hooks/useModels';
import { Search, Database, Plus, ArrowUpDown, Compass, FileInput } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModelActionsMenu } from '@/components/models/ModelActionsMenu';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SideDrawer } from '@/components/layout/SideDrawer';
import { ModelDataForm } from '@/components/models/ModelDataForm';
import { toast } from 'sonner';

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
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Models</h1>
          <p className="text-sm text-text-secondary mt-1">
            Create and manage your data models
          </p>
        </div>
        <Link
          href="/models/new"
          className={cn(
            "inline-flex items-center justify-center rounded-md text-sm font-medium",
            "transition-colors focus-visible:outline-none focus-visible:ring-1",
            "focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
            "bg-primary text-primary-foreground shadow hover:bg-primary/90",
            "h-9 px-4 py-2"
          )}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Model
        </Link>
      </div>

      <div className="flex items-center justify-between space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Search models..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full rounded-md border border-border-primary bg-surface pl-9 pr-4 py-2",
              "text-sm placeholder:text-text-secondary",
              "focus:outline-none focus:ring-1 focus:ring-primary",
              "transition-shadow"
            )}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="show-archived"
            checked={showArchived}
            onCheckedChange={setShowArchived}
          />
          <Label htmlFor="show-archived">Show archived</Label>
        </div>
      </div>

      <div className="rounded-md border border-border-primary">
        <div className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface border-b border-border-primary">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-medium text-text-secondary">
                  <div className="flex items-center space-x-1">
                    <span>Name</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-text-secondary">Description</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-text-secondary">Fields</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-text-secondary">Vector Search</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-text-secondary">Status</th>
                <th className="w-[120px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-primary">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-secondary">
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <span>Loading models...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-error">
                    {error}
                  </td>
                </tr>
              ) : filteredModels.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-secondary">
                    No models found
                  </td>
                </tr>
              ) : (
                filteredModels.map((model) => (
                  <tr key={model.id} className="hover:bg-surface-hover">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Database className="h-4 w-4 text-text-secondary" />
                        <span className="font-medium">{model.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-text-secondary">
                      {model.description || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center rounded-full bg-surface px-2 py-1 text-xs">
                        {Object.keys(model.fields).length} fields
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {model.embedding?.enabled ? (
                        <span className="inline-flex items-center rounded-full bg-success/10 text-success px-2 py-1 text-xs">
                          Enabled
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-surface px-2 py-1 text-xs">
                          Disabled
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={model.status === 'archived' ? 'secondary' : 'default'}
                        className="text-xs"
                      >
                        {model.status || 'active'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleAddData(model.id)}
                          disabled={model.status === 'archived'}
                          className="h-8 w-8"
                        >
                          <FileInput className="h-4 w-4" />
                        </Button>
                        <Link
                          href={`/models/${model.id}/explore`}
                          className={cn(
                            "inline-flex items-center justify-center rounded-md text-sm",
                            "transition-colors focus-visible:outline-none focus-visible:ring-1",
                            "focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                            "hover:bg-surface-hover",
                            "h-8 w-8"
                          )}
                        >
                          <Compass className="h-4 w-4" />
                        </Link>
                        <ModelActionsMenu
                          modelId={model.id}
                          modelName={model.name}
                          isArchived={model.status === 'archived'}
                          onArchiveToggle={() => handleArchiveToggle(model.id)}
                          onDelete={() => handleDeleteModel(model.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Data Drawer */}
      {selectedModelDef && (
        <SideDrawer
          isOpen={isAddDataOpen}
          onClose={() => {
            setIsAddDataOpen(false);
            setSelectedModel(null);
          }}
          title={`Add Data to ${selectedModelDef.name}`}
        >
          <ModelDataForm
            model={selectedModelDef}
            onSubmit={handleSubmitData}
            onCancel={() => {
              setIsAddDataOpen(false);
              setSelectedModel(null);
            }}
          />
        </SideDrawer>
      )}
    </div>
  );
} 