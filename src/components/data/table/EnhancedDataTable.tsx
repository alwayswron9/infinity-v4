"use client";

import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  flexRender,
} from '@tanstack/react-table';
import type { ViewConfig } from '@/types/viewDefinition';
import { PaginationControls } from './PaginationControls';
import { TableFilterSelector } from './TableFilterSelector';
import { ArrowUpDown, Filter, Columns, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Card,
  Skeleton,
  Alert,
  AlertDescription,
} from './TableComponents';
import { Button } from '@/components/ui/button';
import { ColumnSelector } from './ColumnSelector';
import { DataTableHeader } from './TableHeader';
import { DataTableBody } from './TableBody';

interface EnhancedDataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  viewConfig: ViewConfig;
  onConfigChange?: (config: Partial<ViewConfig>) => void;
  pagination?: {
    pageIndex: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
  onPaginationChange?: (pageIndex: number, pageSize: number) => void;
  isLoading?: boolean;
  error?: string | null;
  hasUnsavedChanges?: boolean;
  onSave?: () => void;
  showRowActions?: boolean;
  onEditRow?: (row: T) => void;
  onDeleteRow?: (row: T) => void;
}

interface TableFilter {
  id: string;
  value: any;
  operator: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'startsWith' | 'endsWith' | 'gt' | 'gte' | 'lt' | 'lte' | 'between' | 'in' | 'notIn' | 'isNull' | 'isNotNull';
}

export function EnhancedDataTable<T>({
  data,
  columns,
  viewConfig,
  onConfigChange,
  pagination,
  onPaginationChange,
  isLoading = false,
  error = null,
  hasUnsavedChanges = false,
  onSave,
  showRowActions = false,
  onEditRow,
  onDeleteRow,
}: EnhancedDataTableProps<T>) {
  // Get valid column IDs
  const validColumnIds = React.useMemo(() => 
    new Set(columns.map(col => {
      if ('accessorKey' in col) {
        return String(col.accessorKey);
      }
      return String(col.id);
    })), 
    [columns]
  );

  // Convert view filters to table filters
  const viewFiltersToTableFilters = React.useCallback((filters: typeof viewConfig.filters): TableFilter[] => {
    return filters
      .filter((filter) => validColumnIds.has(filter.field))
      .map((filter) => ({
        id: filter.field,
        value: filter.value ?? '',
        operator: filter.operator
      }));
  }, [validColumnIds]);

  // Convert view sorting to table sorting
  const viewSortingToTableSorting = React.useCallback((sorting: typeof viewConfig.sorting) => {
    return sorting
      .filter((sort) => validColumnIds.has(sort.field))
      .map((sort) => ({
        id: sort.field,
        desc: sort.direction === 'desc'
      }));
  }, [validColumnIds]);

  // Initialize states from view config
  const [columnFilters, setColumnFilters] = React.useState<TableFilter[]>(() => 
    viewFiltersToTableFilters(viewConfig.filters)
  );
  
  const [sorting, setSorting] = React.useState(() => 
    viewSortingToTableSorting(viewConfig.sorting)
  );

  const [activeFilter, setActiveFilter] = React.useState<string | null>(null);
  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = React.useState(false);
  const columnSelectorRef = React.useRef<HTMLDivElement>(null);

  // Helper function to check if a column has an active filter
  const hasActiveFilter = React.useCallback((columnId: string) => {
    return viewConfig.filters.some(f => 
      f.field === columnId && 
      f.value != null && 
      f.value !== ''
    );
  }, [viewConfig.filters]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      pagination: pagination ? {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      } : undefined,
    },
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
      setSorting(newSorting);
      
      if (onConfigChange) {
        const viewSorting = newSorting.map(sort => ({
          field: String(sort.id),
          direction: sort.desc ? ('desc' as const) : ('asc' as const)
        }));
        
        onConfigChange({
          ...viewConfig,
          sorting: viewSorting
        });
      }
    },
    onColumnFiltersChange: async (updater) => {
      const newFilters = typeof updater === 'function' ? updater(columnFilters) : updater;
      const tableFilters = newFilters.map(filter => ({
        id: filter.id,
        value: filter.value,
        operator: (filter as any).operator || 'contains'
      })) as TableFilter[];
      
      setColumnFilters(tableFilters);
      
      if (onConfigChange) {
        const viewFilters = tableFilters.map(filter => ({
          field: String(filter.id),
          operator: filter.operator,
          value: filter.value ?? '',
          conjunction: 'and' as const
        }));

        // Update view config with new filters
        await onConfigChange({
          ...viewConfig,
          filters: viewFilters
        });
        
        // Reset to first page when filters change
        if (onPaginationChange && pagination) {
          onPaginationChange(0, pagination.pageSize);
        }
      }
    },
    onPaginationChange: onPaginationChange ? 
      (updater) => {
        if (typeof updater === 'function') {
          const state = updater({ pageIndex: 0, pageSize: 10 });
          onPaginationChange(state.pageIndex, state.pageSize);
        } else {
          onPaginationChange(updater.pageIndex, updater.pageSize);
        }
      } : undefined,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualFiltering: true,
    manualPagination: Boolean(pagination),
    pageCount: pagination?.pageCount ?? -1,
  });

  // Sync view config changes to table state
  React.useEffect(() => {
    const tableFilters = viewFiltersToTableFilters(viewConfig.filters);
    const tableSorting = viewSortingToTableSorting(viewConfig.sorting);
    
    setColumnFilters(tableFilters);
    setSorting(tableSorting);
  }, [viewConfig, viewFiltersToTableFilters, viewSortingToTableSorting]);

  // Handle click outside for column selector
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (columnSelectorRef.current && !columnSelectorRef.current.contains(event.target as Node)) {
        setIsColumnSelectorOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="flex flex-col h-full">
      {/* Controls Header */}
      <div className="px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <ColumnSelector
            viewConfig={viewConfig}
            onConfigChange={onConfigChange}
          />
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
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0">
        <Table>
          <TableHeader>
            <TableRow>
              {table.getFlatHeaders().map((header) => (
                <TableHead key={header.id} style={{ width: header.getSize() }}>
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "flex items-center gap-1.5 flex-1 min-w-0",
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
                        <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
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
                          "hover:bg-muted transition-colors",
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
                    <div className="absolute left-0 mt-2 z-50">
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
                </TableHead>
              ))}
              {/* Add header cell for actions column if actions are enabled */}
              {showRowActions && (
                <TableHead key="actions" className="w-[100px]">
                  <span className="sr-only">Actions</span>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            <DataTableBody
              data={data}
              rows={table.getRowModel().rows}
              columns={columns}
              isLoading={isLoading}
              pageSize={pagination?.pageSize}
              showRowActions={showRowActions}
              onEditRow={onEditRow}
              onDeleteRow={onDeleteRow}
            />
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      {pagination && (
        <div className="px-4 py-3 border-t">
          <PaginationControls
            currentPage={Math.max(1, (pagination.pageIndex || 0) + 1)}
            totalPages={Math.max(1, pagination.pageCount)}
            pageSize={pagination.pageSize}
            totalItems={pagination.total}
            onPageChange={(page) => onPaginationChange?.(page - 1, pagination.pageSize)}
            onPageSizeChange={(size) => onPaginationChange?.(0, size)}
          />
        </div>
      )}
    </Card>
  );
} 