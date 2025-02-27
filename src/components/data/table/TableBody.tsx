import React from 'react';
import { flexRender, Row } from '@tanstack/react-table';
import { TableRow, TableCell, Skeleton } from './TableComponents';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface TableBodyProps<T> {
  data: T[];
  rows: Row<T>[];
  columns: ColumnDef<T>[];
  isLoading: boolean;
  pageSize?: number;
  showRowActions?: boolean;
  onEditRow?: (row: T) => void;
  onDeleteRow?: (row: T) => void;
}

export function DataTableBody<T>({
  data,
  rows,
  columns,
  isLoading,
  pageSize = 10,
  showRowActions = false,
  onEditRow,
  onDeleteRow,
}: TableBodyProps<T>) {
  if (isLoading) {
    return (
      <>
        {Array.from({ length: pageSize }).map((_, index) => (
          <TableRow key={`loading-${index}`}>
            {columns.map((_, colIndex) => (
              <TableCell key={`loading-cell-${colIndex}`}>
                <Skeleton className="h-4 w-full" />
              </TableCell>
            ))}
            {showRowActions && (
              <TableCell key="loading-actions">
                <Skeleton className="h-4 w-20" />
              </TableCell>
            )}
          </TableRow>
        ))}
      </>
    );
  }

  if (data.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={showRowActions ? columns.length + 1 : columns.length} className="text-center">
          No records found
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {rows.map((row) => (
        <TableRow key={row.id}>
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id}>
              {flexRender(
                cell.column.columnDef.cell,
                cell.getContext()
              )}
            </TableCell>
          ))}
          {showRowActions && (
            <TableCell key={`${row.id}-actions`} className="flex items-center space-x-2 justify-end">
              {onEditRow && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onEditRow(row.original)}
                  className="h-8 w-8"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDeleteRow && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onDeleteRow(row.original)}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </TableCell>
          )}
        </TableRow>
      ))}
    </>
  );
} 