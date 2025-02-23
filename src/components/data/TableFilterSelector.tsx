"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, X } from 'lucide-react';

type FilterType = {
  field: string;
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'between' | 'in';
  value: string;
};

interface TableFilterSelectorProps {
  field: string;
  value: string;
  onChange: (value: string, operator: FilterType['operator']) => void;
  className?: string;
}

const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "h-7 rounded-md border bg-white px-2 py-0 text-sm",
        "focus:outline-none focus:ring-1 focus:ring-blue-500",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = 'Select';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-7 rounded-md border px-2 py-0 text-sm",
        "focus:outline-none focus:ring-1 focus:ring-blue-500",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';

export function TableFilterSelector({
  field,
  value,
  onChange,
  className
}: TableFilterSelectorProps) {
  const [operator, setOperator] = React.useState<FilterType['operator']>('contains');
  const [inputValue, setInputValue] = React.useState(value);

  const handleOperatorChange = (newOperator: FilterType['operator']) => {
    setOperator(newOperator);
    onChange(inputValue, newOperator);
  };

  const handleValueChange = (newValue: string) => {
    setInputValue(newValue);
    onChange(newValue, operator);
  };

  const clearFilter = () => {
    setInputValue('');
    onChange('', operator);
  };

  return (
    <div className={cn("w-72 rounded-lg border bg-white shadow-lg", className)}>
      <div className="p-2 space-y-2">
        <div className="flex items-center gap-1.5">
          <Select
            value={operator}
            onChange={(e) => handleOperatorChange(e.target.value as FilterType['operator'])}
            className="w-24 flex-shrink-0"
          >
            <option value="contains">Contains</option>
            <option value="equals">Equals</option>
            <option value="gt">Greater Than</option>
            <option value="lt">Less Than</option>
            <option value="between">Between</option>
            <option value="in">In</option>
          </Select>

          <Input
            value={inputValue}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder="Filter value..."
            className="flex-1 min-w-0"
          />

          {inputValue && (
            <button
              onClick={clearFilter}
              className="w-6 h-6 inline-flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 