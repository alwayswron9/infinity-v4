import React from 'react';
import { flexRender, Row } from '@tanstack/react-table';
import { TableRow, TableCell, Skeleton } from './TableComponents';
import type { ColumnDef } from '@tanstack/react-table';

interface TableBodyProps<T> {
  data: T[];
  rows: Row<T>[];
  columns: ColumnDef<T>[];
  isLoading: boolean;
  pageSize?: number;
}

export function DataTableBody<T>({
  data,
  rows,
  columns,
  isLoading,
  pageSize = 10,
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
          </TableRow>
        ))}
      </>
    );
  }

  if (data.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={columns.length} className="text-center">
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
        </TableRow>
      ))}
    </>
  );
} 