import { ModelDefinition } from '@/types/modelDefinition';

interface BasicInfoSectionProps {
  model: ModelDefinition;
  onChange: (updates: Partial<ModelDefinition>) => void;
}

export function BasicInfoSection({ model, onChange }: BasicInfoSectionProps) {
  return (
    <section className="bg-white rounded-xl p-6 shadow-sm border border-border/40">
      <h2 className="text-xl font-medium mb-6">Basic Information</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">Model Name</label>
          <input
            type="text"
            value={model.name}
            onChange={e => onChange({ name: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            placeholder="e.g., Customer, Product, Order"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">Description</label>
          <textarea
            value={model.description || ''}
            onChange={e => onChange({ description: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            placeholder="Describe the purpose and usage of this model..."
            rows={3}
          />
        </div>
      </div>
    </section>
  );
} 