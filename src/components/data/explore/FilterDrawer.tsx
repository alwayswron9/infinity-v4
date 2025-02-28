import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ViewFilterConfig } from '@/types/viewDefinition';
import { cn } from '@/lib/utils';

interface FilterGroup {
  filters: ViewFilterConfig[];
  conjunction: 'and' | 'or';
}

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  availableFields: string[];
  currentFilters: ViewFilterConfig[];
  onApplyFilters: (filters: ViewFilterConfig[]) => void;
}

const FILTER_OPERATORS: { value: ViewFilterConfig['operator']; label: string }[] = [
  { value: 'equals', label: 'Equals' },
  { value: 'notEquals', label: 'Not Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'notContains', label: 'Not Contains' },
  { value: 'startsWith', label: 'Starts With' },
  { value: 'endsWith', label: 'Ends With' },
  { value: 'gt', label: 'Greater Than' },
  { value: 'gte', label: 'Greater Than or Equal' },
  { value: 'lt', label: 'Less Than' },
  { value: 'lte', label: 'Less Than or Equal' },
  { value: 'isNull', label: 'Is Empty' },
  { value: 'isNotNull', label: 'Is Not Empty' }
];

// Operators that don't require a value input
const NO_VALUE_OPERATORS = ['isNull', 'isNotNull'];

export function FilterDrawer({ 
  isOpen, 
  onClose, 
  availableFields, 
  currentFilters,
  onApplyFilters 
}: FilterDrawerProps) {
  const [filters, setFilters] = useState<ViewFilterConfig[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Sort available fields for better UX
  const sortedAvailableFields = React.useMemo(() => {
    // Filter out any empty field names and sort alphabetically
    return [...availableFields]
      .filter(field => field && field.trim() !== '')
      .sort((a, b) => {
        // Sort system fields (starting with _) to the end
        if (a.startsWith('_') && !b.startsWith('_')) return 1;
        if (!a.startsWith('_') && b.startsWith('_')) return -1;
        return a.localeCompare(b);
      });
  }, [availableFields]);

  // Initialize filters from props
  useEffect(() => {
    if (currentFilters && currentFilters.length > 0) {
      setFilters([...currentFilters]);
    } else {
      // Initialize with one empty filter if none exist
      setFilters([createEmptyFilter()]);
    }
    setHasChanges(false);
  }, [currentFilters, sortedAvailableFields]);

  // Create an empty filter object
  const createEmptyFilter = (): ViewFilterConfig => ({
    field: sortedAvailableFields.length > 0 ? sortedAvailableFields[0] : '',
    operator: 'contains',
    value: '',
    conjunction: 'and'
  });

  // Add a new filter
  const handleAddFilter = () => {
    setFilters([...filters, createEmptyFilter()]);
    setHasChanges(true);
  };

  // Remove a filter
  const handleRemoveFilter = (index: number) => {
    const newFilters = [...filters];
    newFilters.splice(index, 1);
    setFilters(newFilters);
    setHasChanges(true);
  };

  // Update a filter property
  const handleFilterChange = (index: number, property: keyof ViewFilterConfig, value: any) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], [property]: value };
    
    // Reset value when changing to operators that don't need values
    if (property === 'operator' && NO_VALUE_OPERATORS.includes(value)) {
      newFilters[index].value = '';
    }
    
    setFilters(newFilters);
    setHasChanges(true);
  };

  // Apply filters and close drawer
  const handleApplyFilters = () => {
    // Remove any incomplete filters
    const validFilters = filters.filter(
      filter => filter.field && filter.operator && 
        (NO_VALUE_OPERATORS.includes(filter.operator) || filter.value !== undefined)
    );
    
    onApplyFilters(validFilters);
    onClose();
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters([createEmptyFilter()]);
    setHasChanges(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-surface-0 w-full max-w-md h-full overflow-auto">
        {/* Drawer Header */}
        <div className="border-b border-border p-4 flex items-center justify-between bg-surface-1">
          <h2 className="text-lg font-medium text-text-primary">Filter Data</h2>
          <button 
            onClick={onClose}
            className="rounded-full p-1 hover:bg-surface-2 text-text-secondary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-4">
          {/* Filter Builder */}
          <div className="space-y-4">
            {filters.length === 0 || sortedAvailableFields.length === 0 ? (
              <div className="text-center py-6 text-text-secondary">
                <Info className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>
                  {sortedAvailableFields.length === 0 
                    ? "No filterable fields available." 
                    : "No filters created yet. Add a filter to start."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filters.map((filter, index) => (
                  <div 
                    key={index} 
                    className="bg-surface-1 p-3 rounded-md border border-border"
                  >
                    {/* Conjunction - only show for filters after the first one */}
                    {index > 0 && (
                      <div className="mb-3 flex items-center">
                        <span className="text-sm font-medium mr-2 text-text-secondary">Join with:</span>
                        <div className="flex rounded-md overflow-hidden border border-border">
                          <button
                            type="button"
                            onClick={() => handleFilterChange(index, 'conjunction', 'and')}
                            className={cn(
                              "px-3 py-1 text-sm",
                              filter.conjunction === 'and' 
                                ? "bg-brand-primary text-white"
                                : "bg-surface-2 text-text-primary hover:bg-surface-3"
                            )}
                          >
                            AND
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFilterChange(index, 'conjunction', 'or')}
                            className={cn(
                              "px-3 py-1 text-sm",
                              filter.conjunction === 'or' 
                                ? "bg-brand-primary text-white"
                                : "bg-surface-2 text-text-primary hover:bg-surface-3"
                            )}
                          >
                            OR
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Filter Field, Operator and Value */}
                    <div className="space-y-3">
                      {/* Field selection */}
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                          Field
                        </label>
                        <select
                          value={filter.field}
                          onChange={(e) => handleFilterChange(index, 'field', e.target.value)}
                          className="w-full h-9 rounded-md px-3 text-sm bg-surface-2 text-text-primary border-border
                                     focus:outline-none focus:ring-1 focus:ring-brand-primary"
                        >
                          {sortedAvailableFields.map((field) => (
                            <option key={field} value={field}>
                              {field}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Operator selection */}
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                          Operator
                        </label>
                        <select
                          value={filter.operator}
                          onChange={(e) => handleFilterChange(
                            index, 
                            'operator', 
                            e.target.value as ViewFilterConfig['operator']
                          )}
                          className="w-full h-9 rounded-md px-3 text-sm bg-surface-2 text-text-primary border-border
                                     focus:outline-none focus:ring-1 focus:ring-brand-primary"
                        >
                          {FILTER_OPERATORS.map((op) => (
                            <option key={op.value} value={op.value}>
                              {op.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Value input - only show for operators that need values */}
                      {!NO_VALUE_OPERATORS.includes(filter.operator) && (
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-1">
                            Value
                          </label>
                          <input
                            type="text"
                            value={filter.value || ''}
                            onChange={(e) => handleFilterChange(index, 'value', e.target.value)}
                            className="w-full h-9 rounded-md px-3 text-sm bg-surface-2 text-text-primary border-border
                                     focus:outline-none focus:ring-1 focus:ring-brand-primary"
                            placeholder={`Value for ${filter.field}...`}
                          />
                        </div>
                      )}
                    </div>

                    {/* Remove filter button */}
                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveFilter(index)}
                        className="inline-flex items-center text-text-secondary hover:text-status-error
                                  text-xs rounded px-2 py-1 hover:bg-surface-2"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {sortedAvailableFields.length > 0 && (
              <button
                type="button"
                onClick={handleAddFilter}
                className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed
                          border-border rounded-md text-text-secondary hover:text-text-primary
                          hover:bg-surface-1 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Filter</span>
              </button>
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="border-t border-border p-4 bg-surface-1 sticky bottom-0">
          <div className="flex justify-between gap-3">
            <Button 
              variant="tertiary" 
              onClick={handleClearFilters}
              className="flex-1"
              disabled={sortedAvailableFields.length === 0}
            >
              Clear All
            </Button>
            <Button 
              variant="primary" 
              onClick={handleApplyFilters}
              className="flex-1"
              disabled={
                (!hasChanges && filters.length <= 1 && !filters[0]?.field) || 
                sortedAvailableFields.length === 0
              }
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 