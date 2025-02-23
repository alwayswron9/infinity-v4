import { InfoIcon } from 'lucide-react';
import { ModelDefinition, FieldDefinition } from '@/types/modelDefinition';

interface VectorSearchSectionProps {
  model: ModelDefinition;
  onChange: (updates: Partial<ModelDefinition>) => void;
}

export function VectorSearchSection({ model, onChange }: VectorSearchSectionProps) {
  const toggleVectorSearch = (enabled: boolean) => {
    onChange({
      embedding: {
        enabled,
        source_fields: enabled ? (model.embedding?.source_fields || []) : []
      }
    });
  };

  const toggleSourceField = (fieldName: string) => {
    const currentSourceFields = model.embedding?.source_fields || [];
    const newSourceFields = currentSourceFields.includes(fieldName)
      ? currentSourceFields.filter((f: string) => f !== fieldName)
      : [...currentSourceFields, fieldName];

    onChange({
      embedding: {
        enabled: model.embedding?.enabled ?? false,
        source_fields: newSourceFields
      }
    });
  };

  return (
    <section className="bg-white rounded-xl p-6 shadow-sm border border-border/40">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl font-medium">Vector Search</h2>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm">
          <InfoIcon className="w-4 h-4" />
          <span>Enable semantic search using OpenAI embeddings</span>
        </div>
      </div>

      <div className="space-y-6">
        <label className="flex items-center gap-3 p-3 bg-surface/50 rounded-lg hover:bg-surface transition-colors">
          <input
            type="checkbox"
            checked={model.embedding?.enabled}
            onChange={e => toggleVectorSearch(e.target.checked)}
            className="rounded border-border"
          />
          <span className="font-medium">Enable vector search for this model</span>
        </label>

        {model.embedding?.enabled && (
          <div className="space-y-4 p-4 bg-surface/30 rounded-lg border border-dashed border-border">
            <div>
              <label className="block text-sm font-medium mb-2">Source Fields for Embeddings</label>
              <p className="text-sm text-text-secondary mb-4">
                Select the string fields that should be used to generate embeddings for semantic search
              </p>
            </div>
            <div className="space-y-2">
              {(Object.entries(model.fields) as [string, FieldDefinition][])
                .filter(([_, field]) => field.type === 'string')
                .map(([name]) => (
                  <label key={name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface/80 transition-colors">
                    <input
                      type="checkbox"
                      checked={model.embedding?.source_fields.includes(name)}
                      onChange={() => toggleSourceField(name)}
                      className="rounded border-border"
                    />
                    <span>{name}</span>
                  </label>
                ))}
            </div>
            {(Object.entries(model.fields) as [string, FieldDefinition][])
              .filter(([_, field]) => field.type === 'string').length === 0 && (
              <div className="text-sm text-text-secondary italic p-4 bg-surface/50 rounded-lg">
                Add string fields to enable vector search
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
} 