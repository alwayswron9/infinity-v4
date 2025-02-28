import React from 'react';
import { flexRender, Table as TableType, Row } from '@tanstack/react-table';
import { TableRow, TableCell } from './TableComponents';
import { cn } from '@/lib/utils';
import { Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DataTableBodyProps<T> {
  table: TableType<T>;
  isLoading?: boolean;
  showRowActions?: boolean;
  onEditRow?: (row: T) => void;
  onDeleteRow?: (row: T) => void;
}

export function DataTableBody<T>({ 
  table, 
  isLoading = false,
  showRowActions = false,
  onEditRow,
  onDeleteRow
}: DataTableBodyProps<T>) {
  const rows = table.getRowModel().rows;
  
  if (rows.length === 0) {
    return (
      <TableRow>
        <TableCell
          colSpan={table.getAllColumns().length + (showRowActions ? 1 : 0)}
          className="h-24 text-center"
        >
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-primary"></div>
            </div>
          ) : (
            <div className="text-text-secondary">No results found</div>
          )}
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {rows.map((row) => (
        <TableRow key={row.id}>
          {row.getVisibleCells().map((cell) => (
            <TableCell 
              key={cell.id}
              className={cn(
                cell.column.id === '_actions' && "w-[100px]",
                "max-w-[300px]"
              )}
            >
              <div className="cell-content">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </div>
            </TableCell>
          ))}
          
          {showRowActions && (
            <TableCell className="w-[100px] text-right">
              <div className="flex items-center justify-end space-x-1">
                {onEditRow && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-text-secondary hover:text-text-primary"
                    onClick={() => onEditRow(row.original)}
                  >
                    <Edit2 className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                )}
                
                {onDeleteRow && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-text-secondary hover:text-status-error"
                    onClick={() => {
                      onDeleteRow(row.original);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                )}
              </div>
            </TableCell>
          )}
        </TableRow>
      ))}
    </>
  );
} 