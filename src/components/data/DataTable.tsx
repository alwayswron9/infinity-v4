import { ModelDefinition, FieldDefinition } from '@/types/modelDefinition';
import { DataRecord } from '@/types/dataRecord';
import { format } from 'date-fns';
import { PencilIcon, TrashIcon } from 'lucide-react';

interface DataTableProps {
  model: ModelDefinition;
  records: DataRecord[];
  onEdit?: (record: DataRecord) => void;
  onDelete?: (record: DataRecord) => void;
}

export function DataTable({ model, records, onEdit, onDelete }: DataTableProps) {
  // Get visible fields (excluding vector fields since they're not displayable)
  const entries = Object.entries(model.fields) as [string, FieldDefinition][];
  const visibleFields = entries.filter(([_, field]) => field.type !== 'vector');

  const formatValue = (value: any, type: string) => {
    if (value === null || value === undefined) return '-';
    
    switch (type) {
      case 'date':
        return format(new Date(value), 'MMM d, yyyy');
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'vector':
        return `[${value.length} dimensions]`;
      default:
        return String(value);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-surface border-y border-border">
            {visibleFields.map(([name, field]) => (
              <th
                key={name}
                className="px-4 py-3 text-left text-sm font-medium text-text-secondary"
              >
                {field.description || name}
              </th>
            ))}
            <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">
              Created
            </th>
            {(onEdit || onDelete) && (
              <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {records.map((record) => (
            <tr key={record._id.toString()} className="hover:bg-surface/50">
              {visibleFields.map(([name, field]) => (
                <td key={name} className="px-4 py-3 text-sm text-text">
                  {formatValue(record[name], field.type)}
                </td>
              ))}
              <td className="px-4 py-3 text-sm text-text-secondary">
                {format(new Date(record._created_at), 'MMM d, yyyy')}
              </td>
              {(onEdit || onDelete) && (
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-3">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(record)}
                        className="text-blue-600 hover:text-blue-700"
                        title="Edit"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(record)}
                        className="text-red-600 hover:text-red-700"
                        title="Delete"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 