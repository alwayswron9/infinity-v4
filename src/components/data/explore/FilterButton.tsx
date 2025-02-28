import React from 'react';
import { FilterIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ViewFilterConfig } from '@/types/viewDefinition';

interface FilterButtonProps {
  filters: ViewFilterConfig[];
  onClick: () => void;
  className?: string;
}

export function FilterButton({ filters, onClick, className }: FilterButtonProps) {
  // Check if there are any active filters
  const hasActiveFilters = filters && filters.length > 0 && filters.some(f => f.value !== undefined && f.value !== '');
  
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={onClick}
      className={cn(
        "gap-1.5 relative",
        hasActiveFilters && "border-brand-primary",
        className
      )}
    >
      <FilterIcon className={cn(
        "h-4 w-4",
        hasActiveFilters && "text-brand-primary"
      )} />
      <span>Filters</span>
      
      {hasActiveFilters && (
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-brand-primary rounded-full border border-surface-1"></span>
      )}
    </Button>
  );
} 