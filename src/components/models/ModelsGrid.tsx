import { ModelCard } from '@/components/models/ModelCard';
import { EmptyState } from '@/components/models/EmptyState';
import { type ModelDefinition } from '@/types/modelDefinition';

// Extend the ModelDefinition type to include recordCount
interface ModelWithStats extends ModelDefinition {
  recordCount: number;
}

interface ModelsGridProps {
  models: ModelWithStats[];
  loading: boolean;
  error: string | null;
  onAddData: (modelId: string) => void;
  onArchiveToggle: (modelId: string, currentStatus: string) => Promise<void>;
  onClearData: (modelId: string, modelName: string) => Promise<void>;
  onDelete: (modelId: string) => Promise<void>;
}

export function ModelsGrid({
  models,
  loading,
  error,
  onAddData,
  onArchiveToggle,
  onClearData,
  onDelete
}: ModelsGridProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-t-transparent mb-4" 
               style={{ borderColor: 'var(--brand-primary)', borderTopColor: 'transparent' }}></div>
          <p style={{ color: 'var(--text-secondary)' }} className="text-sm">Loading models...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="p-4 rounded-md max-w-md" style={{ backgroundColor: 'var(--status-error-subtle)' }}>
          <p style={{ color: 'var(--status-error)' }} className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (models.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="model-grid mt-6">
      {models.map((model) => (
        <ModelCard
          key={model.id}
          model={model}
          onAddData={onAddData}
          onArchiveToggle={onArchiveToggle}
          onClearData={onClearData}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
} 