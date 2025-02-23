import React from 'react';
import { Input } from './TableComponents';
import { cn } from '@/lib/utils';
import type { ViewFilterConfig } from '@/types/viewDefinition';

interface TableFilterSelectorProps {
  field: string;
  value: string;
  operator?: ViewFilterConfig['operator'];
  onChange: (value: string, operator: ViewFilterConfig['operator']) => void;
}

const FILTER_OPERATORS: { value: ViewFilterConfig['operator']; label: string }[] = [
  { value: 'contains', label: 'Contains' },
  { value: 'equals', label: 'Equals' },
  { value: 'notEquals', label: 'Not Equals' },
  { value: 'startsWith', label: 'Starts With' },
  { value: 'endsWith', label: 'Ends With' },
  { value: 'gt', label: 'Greater Than' },
  { value: 'gte', label: 'Greater Than or Equal' },
  { value: 'lt', label: 'Less Than' },
  { value: 'lte', label: 'Less Than or Equal' },
  { value: 'isNull', label: 'Is Empty' },
  { value: 'isNotNull', label: 'Is Not Empty' }
];

export function TableFilterSelector({ 
  field, 
  value, 
  operator = 'contains',
  onChange 
}: TableFilterSelectorProps) {
  const [currentOperator, setCurrentOperator] = React.useState<ViewFilterConfig['operator']>(operator);
  const [currentValue, setCurrentValue] = React.useState(value);

  const handleOperatorChange = (newOperator: ViewFilterConfig['operator']) => {
    setCurrentOperator(newOperator);
    onChange(currentValue, newOperator);
  };

  const handleValueChange = (newValue: string) => {
    setCurrentValue(newValue);
    onChange(newValue, currentOperator);
  };

  return (
    <div className={cn(
      "bg-white rounded-md shadow-lg border p-2 min-w-[200px]",
      "flex flex-col gap-2"
    )}>
      <select
        value={currentOperator}
        onChange={(e) => handleOperatorChange(e.target.value as ViewFilterConfig['operator'])}
        className={cn(
          "h-8 rounded-md border px-2 text-sm",
          "focus:outline-none focus:ring-1 focus:ring-blue-500"
        )}
      >
        {FILTER_OPERATORS.map(op => (
          <option key={op.value} value={op.value}>
            {op.label}
          </option>
        ))}
      </select>

      {currentOperator !== 'isNull' && currentOperator !== 'isNotNull' && (
        <Input
          type="text"
          placeholder={`Filter ${field}...`}
          value={currentValue}
          onChange={(e) => handleValueChange(e.target.value)}
          autoFocus
        />
      )}
    </div>
  );
} 