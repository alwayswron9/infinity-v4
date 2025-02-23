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
import { ArrowUpDown, Filter, Columns } from 'lucide-react';
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
    <Card>
      <div className="rounded-md border">
        <div className="flex items-center justify-between gap-2 p-2 border-b">
          <div className="flex items-center gap-2">
            <ColumnSelector
              viewConfig={viewConfig}
              onConfigChange={onConfigChange}
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <DataTableHeader
              headerGroups={table.getHeaderGroups()}
              viewConfig={viewConfig}
              onConfigChange={onConfigChange}
            />
          </TableHeader>
          <TableBody>
            <DataTableBody
              data={data}
              rows={table.getRowModel().rows}
              columns={columns}
              isLoading={isLoading}
              pageSize={pagination?.pageSize}
            />
          </TableBody>
        </Table>
      </div>
      
      {pagination && (
        <div className="mt-4">
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