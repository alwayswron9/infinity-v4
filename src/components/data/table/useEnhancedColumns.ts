import { useMemo } from 'react';
import type { ColumnDef, CellContext } from '@tanstack/react-table';
import { ActionButtons } from './ActionButtons';

interface CustomColumnMeta {
  isAction?: boolean;
  [key: string]: any;
}

export function useEnhancedColumns(
  columns: ColumnDef<Record<string, any>, any>[],
  columnWidths: { [key: number]: number },
  containerWidth: number,
  onRowClick?: (row: Record<string, any>) => void,
  onDeleteClick?: (row: Record<string, any>) => void
) {
  return useMemo(() => {
    if (!columns) return [];
    
    // Format column headers to look nicer
    const formatColumnHeader = (columnId: string): string => {
      // Remove prefixes like '_' and make more readable
      let header = columnId.replace(/^_/, '');
      
      // Replace underscores with spaces
      header = header.replace(/_/g, ' ');
      
      // Capitalize first letter of each word
      return header
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };
    
    // Process columns but don't make all cells clickable
    const processedColumns = columns.map((column, index) => {
      // Create a new column definition
      const newColumn = { ...column };
      
      // Format column header if it's not already defined
      if (!newColumn.header && newColumn.id) {
        newColumn.header = formatColumnHeader(newColumn.id);
      }
      
      // Set width based on our calculated proportions
      if (containerWidth > 0 && columnWidths[index]) {
        newColumn.size = columnWidths[index];
      }
      
      return newColumn;
    });
    
    // Add an actions column if needed
    if ((onRowClick || onDeleteClick) && !columns.some(col => col.id === 'actions')) {
      const actionColumn: ColumnDef<Record<string, any>> = {
        id: 'actions',
        header: 'Actions',
        size: 120,
        cell: (info: CellContext<Record<string, any>, unknown>) => {
          return ActionButtons({
            row: info.row.original,
            onView: onRowClick,
            onDelete: onDeleteClick
          });
        },
        meta: {
          isAction: true
        } as CustomColumnMeta
      };
      
      return [...processedColumns, actionColumn];
    }
    
    return processedColumns;
  }, [columns, columnWidths, containerWidth, onRowClick, onDeleteClick]);
} 