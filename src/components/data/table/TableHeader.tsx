import React from 'react';
import { flexRender, Header, HeaderGroup } from '@tanstack/react-table';
import { ArrowUpDown, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TableHead, TableRow } from './TableComponents';
import { TableFilterSelector } from './TableFilterSelector';
import type { ViewConfig } from '@/types/viewDefinition';

interface TableHeaderProps<T> {
  headerGroups: HeaderGroup<T>[];
  viewConfig: ViewConfig;
  onConfigChange?: (config: Partial<ViewConfig>) => void;
}

export function DataTableHeader<T>({
  headerGroups,
  viewConfig,
  onConfigChange,
}: TableHeaderProps<T>) {
  const [activeFilter, setActiveFilter] = React.useState<string | null>(null);

  // Helper function to check if a column has an active filter
  const hasActiveFilter = React.useCallback((columnId: string) => {
    return viewConfig.filters.some(f => 
      f.field === columnId && 
      f.value != null && 
      f.value !== ''
    );
  }, [viewConfig.filters]);

  return (
    <>
      {headerGroups.map((headerGroup) => (
        <TableRow key={headerGroup.id}>
          {headerGroup.headers.map((header) => (
            <TableHead key={header.id}>
              {header.isPlaceholder ? null : (
                <div className="relative">
                  <div className="flex items-center space-x-2 h-6">
                    <div
                      className={cn(
                        "flex items-center gap-1 flex-1 min-w-0",
                        header.column.getCanSort() && "cursor-pointer select-none",
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <span className="truncate">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </span>
                      {header.column.getCanSort() && (
                        <ArrowUpDown className="w-3 h-3 flex-shrink-0 text-gray-400" />
                      )}
                    </div>
                    {header.column.getCanFilter() && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveFilter(activeFilter === header.id ? null : header.id);
                        }}
                        className={cn(
                          "flex-shrink-0 w-6 h-6 inline-flex items-center justify-center rounded-md hover:bg-gray-100",
                          (activeFilter === header.id || hasActiveFilter(header.column.id)) && "bg-blue-50 text-blue-600",
                          "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
                        )}
                      >
                        <Filter className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  {activeFilter === header.id && header.column.getCanFilter() && (
                    <div className="absolute left-0 mt-2 z-10">
                      <TableFilterSelector
                        field={header.column.id}
                        value={(header.column.getFilterValue() as string) ?? ""}
                        operator={(viewConfig.filters.find(f => f.field === header.column.id))?.operator || 'contains'}
                        onChange={(value, operator) => {
                          header.column.setFilterValue(value);
                          if (onConfigChange) {
                            const newFilters = [...viewConfig.filters];
                            const existingFilterIndex = newFilters.findIndex(f => f.field === header.column.id);
                            if (existingFilterIndex >= 0) {
                              newFilters[existingFilterIndex] = {
                                ...newFilters[existingFilterIndex],
                                value,
                                operator
                              };
                            } else {
                              newFilters.push({
                                field: header.column.id,
                                value,
                                operator,
                                conjunction: 'and'
                              });
                            }
                            onConfigChange({
                              ...viewConfig,
                              filters: newFilters
                            });
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </TableHead>
          ))}
        </TableRow>
      ))}
    </>
  );
} 