import { InfoIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';
import { ModelDefinition, FieldType, CreatableFieldDefinition } from '@/types/modelDefinition';
import { toast } from 'react-hot-toast';

const FIELD_TYPES = {
  string: 'String',
  number: 'Number',
  boolean: 'Boolean',
  date: 'Date',
} as const;

type FieldTypes = keyof typeof FIELD_TYPES;

type Field = {
  id: string;
  name: string;
  type: FieldTypes;
  required: boolean;
  unique: boolean;
  description?: string;
};

interface FieldsSectionProps {
  model: ModelDefinition;
  onChange: (updates: Partial<ModelDefinition>) => void;
}

export function FieldsSection({ model, onChange }: FieldsSectionProps) {
  const [newField, setNewField] = useState<Field>({
    id: crypto.randomUUID(),
    name: '',
    type: 'string',
    required: false,
    unique: false,
  });

  const addField = () => {
    if (!newField.name.trim()) {
      toast.error('Field name is required');
      return;
    }

    if (model.fields[newField.name]) {
      toast.error('Field name must be unique');
      return;
    }

    onChange({
      fields: {
        ...model.fields,
        [newField.name]: {
          id: newField.id,
          type: newField.type,
          required: newField.required,
          unique: newField.unique,
          description: newField.description,
        }
      }
    });

    setNewField({
      id: crypto.randomUUID(),
      name: '',
      type: 'string',
      required: false,
      unique: false,
    });
  };

  const removeField = (fieldName: string) => {
    const fields = { ...model.fields };
    delete fields[fieldName];
    onChange({ fields });
  };

  const updateField = (oldName: string, newName: string, updates: Partial<CreatableFieldDefinition>) => {
    const fields = { ...model.fields };
    const field = fields[oldName];
    if (!field) return;

    delete fields[oldName];
    fields[newName] = { ...field, ...updates };
    onChange({ fields });
  };

  return (
    <section className="bg-white rounded-xl p-6 shadow-sm border border-border/40">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl font-medium">Fields</h2>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm">
          <InfoIcon className="w-4 h-4" />
          <span>Vector fields are handled automatically by the platform</span>
        </div>
      </div>
      
      {/* Existing Fields */}
      <div className="space-y-3 mb-6">
        {Object.entries(model.fields)
          .filter(([_, field]) => field.type !== 'vector')
          .map(([name, field]) => (
            <div
              key={field.id}
              className="grid grid-cols-12 gap-4 p-4 bg-surface/50 rounded-lg items-center hover:bg-surface transition-colors"
            >
              <div className="col-span-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => updateField(name, e.target.value, {})}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder="Field name"
                />
              </div>
              <div className="col-span-2">
                <select
                  value={field.type}
                  onChange={(e) => {
                    const type = e.target.value as FieldTypes;
                    updateField(name, name, { type });
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                >
                  {Object.entries(FIELD_TYPES).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-5 flex gap-4">
                <label className="flex items-center gap-2 px-2 py-1 rounded hover:bg-surface/80">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) => updateField(name, name, { required: e.target.checked })}
                    className="rounded border-border"
                  />
                  <span className="text-sm">Required</span>
                </label>
                <label className="flex items-center gap-2 px-2 py-1 rounded hover:bg-surface/80">
                  <input
                    type="checkbox"
                    checked={field.unique}
                    onChange={(e) => updateField(name, name, { unique: e.target.checked })}
                    className="rounded border-border"
                  />
                  <span className="text-sm">Unique</span>
                </label>
                <input
                  type="text"
                  value={field.description || ''}
                  onChange={(e) => updateField(name, name, { description: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg border border-border bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder="Description (optional)"
                />
              </div>
              <div className="col-span-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeField(name)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* Add Field Form */}
      <div className="grid grid-cols-12 gap-4 items-center bg-surface/30 p-4 rounded-lg border border-dashed border-border">
        <div className="col-span-3">
          <input
            type="text"
            value={newField.name}
            onChange={e => setNewField(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-border bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            placeholder="New field name"
          />
        </div>
        <div className="col-span-2">
          <select
            value={newField.type}
            onChange={e => setNewField(prev => ({ ...prev, type: e.target.value as FieldTypes }))}
            className="w-full px-3 py-2 rounded-lg border border-border bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          >
            {Object.entries(FIELD_TYPES).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div className="col-span-5 flex gap-4">
          <label className="flex items-center gap-2 px-2 py-1 rounded hover:bg-surface/80">
            <input
              type="checkbox"
              checked={newField.required}
              onChange={e => setNewField(prev => ({ ...prev, required: e.target.checked }))}
              className="rounded border-border"
            />
            <span className="text-sm">Required</span>
          </label>
          <label className="flex items-center gap-2 px-2 py-1 rounded hover:bg-surface/80">
            <input
              type="checkbox"
              checked={newField.unique}
              onChange={e => setNewField(prev => ({ ...prev, unique: e.target.checked }))}
              className="rounded border-border"
            />
            <span className="text-sm">Unique</span>
          </label>
          <input
            type="text"
            value={newField.description || ''}
            onChange={e => setNewField(prev => ({ ...prev, description: e.target.value }))}
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            placeholder="Description (optional)"
          />
        </div>
        <div className="col-span-2 flex justify-end">
          <button
            type="button"
            onClick={addField}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </section>
  );
} 