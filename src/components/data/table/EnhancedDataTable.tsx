"use client";

import React, { useEffect } from 'react';
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
import { ArrowUpDown, Filter, Columns, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Table,
  TableContainer,
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
  availableColumns?: string[];
}

interface TableFilter {
  id: string;
  value: any;
  operator: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'startsWith' | 'endsWith' | 'gt' | 'gte' | 'lt' | 'lte' | 'between' | 'in' | 'notIn' | 'isNull' | 'isNotNull';
}

const tableStyles = {
  width: '100%',
  tableLayout: 'fixed' as const,
};

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
  availableColumns = [],
}: EnhancedDataTableProps<T>) {
  // Log pagination data for debugging
  useEffect(() => {
    console.log('EnhancedDataTable pagination:', pagination);
  }, [pagination]);

  // Process columns to apply appropriate widths and classes
  const processedColumns = React.useMemo(() => {
    return columns.map(column => {
      const columnKey = 'accessorKey' in column ? String(column.accessorKey) : String(column.id);
      
      // Apply special classes for specific columns
      let className = '';
      if (columnKey === '_id') {
        className = 'id-column';
      } else if (columnKey.startsWith('_')) {
        className = 'meta-column';
      }
      
      // Combine with existing meta
      return {
        ...column,
        meta: {
          ...column.meta,
          className
        }
      };
    });
  }, [columns]);

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

  // Get all filterable fields from the model data and view config
  const filterableColumns = React.useMemo(() => {
    // Start with all available columns from the model
    let fieldsFromModel = [...availableColumns];
    
    // Add any additional fields defined in the view config
    if (viewConfig?.columns?.length) {
      const fieldsFromConfig = viewConfig.columns
        .filter(col => col.filterable)
        .map(col => col.field);
      
      // Combine and deduplicate
      fieldsFromModel = [...new Set([...fieldsFromModel, ...fieldsFromConfig])];
    }
    
    // If we have actual data, extract fields from the first data item
    if (data.length > 0) {
      const firstItem = data[0];
      const fieldsFromData = Object.keys(firstItem as Record<string, any>);
      
      // Add fields found in data but not in model definition or view config
      fieldsFromModel = [...new Set([...fieldsFromModel, ...fieldsFromData])];
    }
    
    return fieldsFromModel;
  }, [availableColumns, viewConfig.columns, data]);

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

  // Row click handler
  const handleRowClick = React.useCallback((row: T) => {
    if (onEditRow) {
      onEditRow(row);
    }
  }, [onEditRow]);

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

  return (
    <div className="enhanced-data-table">
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <Card className="h-full flex flex-col overflow-hidden" style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Table controls */}
          <DataTableHeader
            table={table}
            viewConfig={viewConfig}
            onConfigChange={onConfigChange}
            hasUnsavedChanges={hasUnsavedChanges}
            onSave={onSave}
            availableColumns={filterableColumns}
          />
          
          {/* Table content with new structure */}
          <Table>
            <TableContainer>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      // Apply column-specific classes
                      const columnMeta = header.column.columnDef.meta as { className?: string } | undefined;
                      const className = columnMeta?.className || '';
                      
                      return (
                        <TableHead key={header.id} className={className}>
                          {header.isPlaceholder ? null : (
                            <div>
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                            </div>
                          )}
                        </TableHead>
                      );
                    })}
                    {/* Add action column header if actions are enabled */}
                    {showRowActions && (
                      <TableHead className="action-column text-right">
                        Actions
                      </TableHead>
                    )}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      {Array.from({ length: columns.length }).map((_, cellIndex) => {
                        // Apply column-specific classes to skeleton cells
                        const columnMeta = columns[cellIndex] && 'meta' in columns[cellIndex] 
                          ? columns[cellIndex].meta as { className?: string } | undefined
                          : undefined;
                        const className = columnMeta?.className || '';
                        
                        return (
                          <TableCell key={`skeleton-cell-${cellIndex}`} className={className}>
                            <Skeleton className="h-6 w-full" />
                          </TableCell>
                        );
                      })}
                      {showRowActions && (
                        <TableCell className="action-column">
                          <Skeleton className="h-6 w-full" />
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow 
                      key={row.id} 
                      onClick={() => handleRowClick(row.original)}
                      className="cursor-pointer"
                    >
                      {row.getVisibleCells().map((cell) => {
                        // Apply column-specific classes
                        const columnMeta = cell.column.columnDef.meta as { className?: string } | undefined;
                        const className = columnMeta?.className || '';
                        
                        return (
                          <TableCell key={cell.id} className={className}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        );
                      })}
                      {showRowActions && (
                        <TableCell className="action-column text-right" onClick={(e) => e.stopPropagation()}>
                          {onDeleteRow && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="delete-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteRow(row.original);
                              }}
                            >
                              Delete
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell 
                      colSpan={columns.length + (showRowActions ? 1 : 0)} 
                      className="text-center py-8"
                    >
                      No results found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </TableContainer>
          </Table>
          
          {/* Pagination */}
          <div className="mt-auto">
            <PaginationControls
              currentPage={pagination ? pagination.pageIndex + 1 : 1}
              totalPages={pagination ? pagination.pageCount : 0}
              pageSize={pagination ? pagination.pageSize : 10}
              totalItems={pagination ? pagination.total : 0}
              onPageChange={(page) => {
                if (onPaginationChange && pagination) {
                  onPaginationChange(page - 1, pagination.pageSize);
                }
              }}
              onPageSizeChange={(size) => {
                if (onPaginationChange && pagination) {
                  onPaginationChange(0, size);
                }
              }}
            />
          </div>
        </Card>
      )}
    </div>
  );
} 