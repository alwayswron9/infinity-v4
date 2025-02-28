import React from 'react';
import { flexRender, Table as TableType, Column, Header } from '@tanstack/react-table';
import { TableRow, TableHead } from './TableComponents';
import { Button } from '@/components/ui/button';
import { ArrowDownIcon, ArrowUpIcon, ArrowUpDown, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ViewConfig, ViewFilterConfig } from '@/types/viewDefinition';
import { ColumnSelector } from './ColumnSelector';
import { FilterButton } from '@/components/data/explore/FilterButton';
import { FilterDrawer } from '@/components/data/explore/FilterDrawer';
import { createPortal } from 'react-dom';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

interface DataTableHeaderProps<T> {
  table: TableType<T>;
  viewConfig: ViewConfig;
  onConfigChange?: (config: Partial<ViewConfig>) => void;
  hasUnsavedChanges?: boolean;
  onSave?: () => void;
  availableColumns: string[];
}

export function DataTableHeader<T>({ 
  table, 
  viewConfig, 
  onConfigChange, 
  hasUnsavedChanges = false, 
  onSave,
  availableColumns
}: DataTableHeaderProps<T>) {
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = React.useState(false);

  // Group columns into system and regular fields
  const { systemFields, regularFields } = React.useMemo(() => {
    return viewConfig.columns.reduce<{
      systemFields: typeof viewConfig.columns;
      regularFields: typeof viewConfig.columns;
    }>(
      (acc, column) => {
        if (column.field.startsWith('_')) {
          acc.systemFields.push(column);
        } else {
          acc.regularFields.push(column);
        }
        return acc;
      },
      { systemFields: [], regularFields: [] }
    );
  }, [viewConfig.columns]);
  
  // Check if there are any active filters
  const hasActiveFilters = React.useMemo(() => {
    return viewConfig.filters.some(filter => 
      filter.value !== undefined && 
      filter.value !== '' && 
      filter.value !== null
    );
  }, [viewConfig.filters]);

  const toggleFilterDrawer = () => {
    setIsFilterDrawerOpen(!isFilterDrawerOpen);
  };

  const applyFilters = (filters: ViewFilterConfig[]) => {
    if (onConfigChange) {
      onConfigChange({
        ...viewConfig,
        filters
      });
    }
    setIsFilterDrawerOpen(false);
  };

  // Handle column visibility toggle
  const handleColumnToggle = (field: string, checked: boolean) => {
    if (onConfigChange) {
      const newColumns = [...viewConfig.columns];
      const index = newColumns.findIndex(col => col.field === field);
      if (index !== -1) {
        newColumns[index] = {
          ...newColumns[index],
          visible: checked
        };
        onConfigChange({
          ...viewConfig,
          columns: newColumns
        });
      }
    }
  };

  // Filter available columns to only show ones relevant for filtering
  const filterFields = React.useMemo(() => {
    // Sort alphabetically and filter out system fields unless they're explicitly included in the model
    return [...availableColumns].sort((a, b) => {
      // First, non-system fields
      const aIsSystem = a.startsWith('_');
      const bIsSystem = b.startsWith('_');
      
      if (aIsSystem && !bIsSystem) return 1;
      if (!aIsSystem && bIsSystem) return -1;
      
      // Then alphabetically
      return a.localeCompare(b);
    });
  }, [availableColumns]);

  // Function to render filter drawer using portal, ensuring it's outside the table DOM
  const renderFilterDrawer = () => {
    if (typeof window === 'undefined') return null;
    
    return createPortal(
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        currentFilters={viewConfig.filters}
        availableFields={filterFields}
        onApply={applyFilters}
      />,
      document.body
    );
  };

  return (
    <>
      <div className="table-controls">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="whitespace-nowrap"
              >
                <ArrowUpDown className="mr-2 h-4 w-4" />
                Columns
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[240px]">
              {regularFields.length > 0 && (
                <>
                  <div className="px-2 py-1.5 text-xs font-medium text-text-secondary/70">
                    Model Fields
                  </div>
                  {regularFields.map((column) => (
                    <DropdownMenuItem
                      key={column.field}
                      className="flex items-center gap-2 px-2 py-1.5 cursor-pointer"
                      onSelect={(e) => {
                        e.preventDefault();
                        handleColumnToggle(column.field, !column.visible);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 flex items-center justify-center">
                          {column.visible && <Check className="h-4 w-4" />}
                        </div>
                        <span>{column.field}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </>
              )}

              {systemFields.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1.5 text-xs font-medium text-text-secondary/70">
                    System Fields
                  </div>
                  {systemFields.map((column) => (
                    <DropdownMenuItem
                      key={column.field}
                      className="flex items-center gap-2 px-2 py-1.5 cursor-pointer"
                      onSelect={(e) => {
                        e.preventDefault();
                        handleColumnToggle(column.field, !column.visible);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 flex items-center justify-center">
                          {column.visible && <Check className="h-4 w-4" />}
                        </div>
                        <span>{column.field.startsWith('_') ? column.field.slice(1) : column.field}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            variant={hasActiveFilters ? "default" : "outline"}
            size="sm"
            onClick={toggleFilterDrawer}
            className={cn(
              "whitespace-nowrap",
              hasActiveFilters && "bg-brand-primary text-white"
            )}
          >
            <FilterButton active={hasActiveFilters} />
            Filters {hasActiveFilters && `(${viewConfig.filters.length})`}
          </Button>
          
          {hasUnsavedChanges && onSave && (
            <Button
              size="sm"
              onClick={onSave}
            >
              Save Changes
            </Button>
          )}
        </div>
      </div>

      {/* Render filter drawer using portal */}
      {isFilterDrawerOpen && renderFilterDrawer()}
    </>
  );
}

// Helper to render the appropriate sort indicator
function renderSortIndicator<T>(header: Header<T, unknown>) {
  if (!header.column.getCanSort()) {
    return null;
  }
  
  const sorted = header.column.getIsSorted();
  
  if (sorted === 'asc') {
    return <ArrowUpIcon className="h-4 w-4" />;
  } else if (sorted === 'desc') {
    return <ArrowDownIcon className="h-4 w-4" />;
  } else {
    return <ArrowUpDown className="h-4 w-4 opacity-50" />;
  }
} 