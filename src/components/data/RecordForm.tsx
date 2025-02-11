import { useState } from 'react';
import { ModelDefinition } from '@/types/modelDefinition';
import { DataRecord } from '@/types/dataRecord';

interface RecordFormProps {
  model: ModelDefinition;
  initialData?: DataRecord;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  onCancel: () => void;
}

export function RecordForm({ model, initialData, onSubmit, onCancel }: RecordFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>(
    initialData?.fields || {}
  );
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const renderField = (name: string, field: ModelDefinition['fields'][string]) => {
    const value = formData[name] ?? field.default ?? '';

    switch (field.type) {
      case 'string':
        if (field.enum) {
          return (
            <select
              value={value}
              onChange={e => handleChange(name, e.target.value)}
              required={field.required}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select {field.description || name}</option>
              {field.enum.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          );
        }
        return (
          <input
            type="text"
            value={value}
            onChange={e => handleChange(name, e.target.value)}
            required={field.required}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={e => handleChange(name, Number(e.target.value))}
            required={field.required}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        );

      case 'boolean':
        return (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value}
              onChange={e => handleChange(name, e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary/20"
            />
            <span className="text-sm text-text-secondary">
              {field.description || name}
            </span>
          </label>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value ? new Date(value).toISOString().split('T')[0] : ''}
            onChange={e => handleChange(name, new Date(e.target.value))}
            required={field.required}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {Object.entries(model.fields)
        .filter(([_, field]) => field.type !== 'vector') // Exclude vector fields
        .map(([name, field]) => (
          <div key={name}>
            <label className="block mb-1 text-sm font-medium">
              {field.description || name}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {renderField(name, field)}
            {field.description && (
              <p className="mt-1 text-xs text-text-tertiary">{field.description}</p>
            )}
          </div>
        ))}

      <div className="flex justify-end gap-3 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-text-secondary hover:text-text"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          {submitting ? 'Saving...' : initialData ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
} 