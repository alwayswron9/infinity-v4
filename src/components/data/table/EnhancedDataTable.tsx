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
import { ArrowUpDown, Filter } from 'lucide-react';
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

  // Initialize sorting state with validation
  const [sorting, setSorting] = React.useState<SortingState>(
    viewConfig.sorting
      .filter((sort: { field: string }) => validColumnIds.has(sort.field))
      .map((sort: { field: string; direction: 'asc' | 'desc' }) => ({
        id: sort.field,
        desc: sort.direction === 'desc'
      }))
  );
  
  // Initialize filter state with validation
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    viewConfig.filters
      .filter((filter) => validColumnIds.has(filter.field))
      .map((filter) => ({
        id: filter.field,
        value: filter.value ?? '',
        operator: filter.operator
      }))
  );

  const [hasChanges, setHasChanges] = React.useState(false);
  const [activeFilter, setActiveFilter] = React.useState<string | null>(null);

  // Sync sorting changes back to view config
  React.useEffect(() => {
    const newSorting = sorting
      .filter(sort => validColumnIds.has(String(sort.id)))
      .map(sort => ({
        field: String(sort.id),
        direction: sort.desc ? ('desc' as const) : ('asc' as const)
      }));

    // Only update if sorting has actually changed
    if (JSON.stringify(newSorting) !== JSON.stringify(viewConfig.sorting)) {
      setHasChanges(true);
    }
  }, [sorting, viewConfig.sorting, validColumnIds]);

  // Sync filter changes back to view config
  React.useEffect(() => {
    const newFilters = columnFilters
      .filter(filter => validColumnIds.has(String(filter.id)))
      .map(filter => ({
        field: String(filter.id),
        operator: (filter as any).operator || 'contains' as const,
        value: filter.value ?? '',
        conjunction: 'and' as const
      }));

    // Only update if filters have actually changed
    if (JSON.stringify(newFilters) !== JSON.stringify(viewConfig.filters)) {
      setHasChanges(true);
    }
  }, [columnFilters, viewConfig.filters, validColumnIds]);

  const handleSaveChanges = React.useCallback(() => {
    if (onConfigChange) {
      const newConfig: Partial<ViewConfig> = {
        ...viewConfig,
        sorting: sorting
          .filter(sort => validColumnIds.has(String(sort.id)))
          .map(sort => ({
            field: String(sort.id),
            direction: sort.desc ? ('desc' as const) : ('asc' as const)
          })),
        filters: columnFilters
          .filter(filter => validColumnIds.has(String(filter.id)))
          .map(filter => ({
            field: String(filter.id),
            operator: (filter as any).operator || 'contains' as const,
            value: filter.value ?? '',
            conjunction: 'and' as const
          }))
      };

      // Only update if there are actual changes
      if (JSON.stringify(newConfig) !== JSON.stringify(viewConfig)) {
        onConfigChange(newConfig);
        setHasChanges(false);
      }
    }
  }, [sorting, columnFilters, validColumnIds, viewConfig, onConfigChange]);

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
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
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
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: Boolean(pagination),
    pageCount: pagination?.pageCount ?? -1,
  });

  const content = React.useMemo(() => {
    if (error) {
      return (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    return (
      <Card>
        <div className="mb-2 flex items-center justify-end">
          {hasChanges && (
            <button
              onClick={handleSaveChanges}
              className={cn(
                "flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-md",
                "bg-blue-600 text-white hover:bg-blue-700",
                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              )}
            >
              Save Changes
            </button>
          )}
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
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
                                  activeFilter === header.id && "bg-blue-50 text-blue-600",
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
                                onChange={(value, operator) => {
                                  header.column.setFilterValue(value);
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
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: pagination?.pageSize || 10 }).map((_, index) => (
                  <TableRow key={`loading-${index}`}>
                    {columns.map((_, colIndex) => (
                      <TableCell key={`loading-cell-${colIndex}`}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center">
                    No records found
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
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
  }, [
    error,
    hasChanges,
    handleSaveChanges,
    table,
    isLoading,
    data.length,
    columns,
    pagination,
    onPaginationChange,
    activeFilter
  ]);

  return content;
} 