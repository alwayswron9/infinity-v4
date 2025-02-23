import React from 'react';
import { flexRender, Header, HeaderGroup } from '@tanstack/react-table';
import { ArrowUpDown, Filter, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TableHead, TableRow } from './TableComponents';
import { TableFilterSelector } from './TableFilterSelector';
import { ColumnSelector } from './ColumnSelector';
import { Button } from '@/components/ui/button';
import type { ViewConfig } from '@/types/viewDefinition';

interface TableHeaderProps<T> {
  headerGroups: HeaderGroup<T>[];
  viewConfig: ViewConfig;
  onConfigChange?: (config: Partial<ViewConfig>) => void;
  hasUnsavedChanges?: boolean;
  onSave?: () => void;
}

export function DataTableHeader<T>({
  headerGroups,
  viewConfig,
  onConfigChange,
  hasUnsavedChanges = false,
  onSave,
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
      {/* Controls Row */}
      <TableRow>
        <TableHead colSpan={headerGroups[0]?.headers.length || 1} className="bg-background border-b">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <ColumnSelector
                viewConfig={viewConfig}
                onConfigChange={onConfigChange}
              />
            </div>
            <Button
              onClick={onSave}
              variant={hasUnsavedChanges ? "default" : "secondary"}
              size="sm"
              disabled={!hasUnsavedChanges}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </Button>
          </div>
        </TableHead>
      </TableRow>

      {/* Column Headers Row */}
      <TableRow>
        {headerGroups[0]?.headers.map((header) => (
          <TableHead key={header.id}>
            {header.isPlaceholder ? null : (
              <div className="relative py-2">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex items-center gap-1.5 flex-1 min-w-0",
                      header.column.getCanSort() && "cursor-pointer select-none",
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <span className="truncate font-medium">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </span>
                    {header.column.getCanSort() && (
                      <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </div>
                  {header.column.getCanFilter() && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveFilter(activeFilter === header.id ? null : header.id);
                      }}
                      className={cn(
                        "flex-shrink-0 h-6 w-6 inline-flex items-center justify-center rounded-md",
                        "hover:bg-background transition-colors",
                        (activeFilter === header.id || hasActiveFilter(header.column.id)) && 
                          "bg-primary text-primary-foreground hover:bg-primary/90",
                        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                      )}
                    >
                      <Filter className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                {activeFilter === header.id && header.column.getCanFilter() && (
                  <div className="absolute left-0 mt-1 z-50">
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
    </>
  );
} 