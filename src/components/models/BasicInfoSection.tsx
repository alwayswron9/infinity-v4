import { ModelDefinition } from '@/types/modelDefinition';
import { Section } from '@/components/layout/Section';

interface BasicInfoSectionProps {
  model: ModelDefinition;
  onChange: (updates: Partial<ModelDefinition>) => void;
}

export function BasicInfoSection({ model, onChange }: BasicInfoSectionProps) {
  return (
    <Section title="Basic Information">
      <div className="space-y-4 px-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-text-primary">Model Name</label>
          <input
            type="text"
            value={model.name}
            onChange={e => onChange({ name: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            placeholder="e.g., Customer, Product, Order"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-text-primary">Description</label>
          <textarea
            value={model.description || ''}
            onChange={e => onChange({ description: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-border bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            placeholder="Describe the purpose and usage of this model..."
            rows={3}
          />
        </div>
      </div>
    </Section>
  );
} 