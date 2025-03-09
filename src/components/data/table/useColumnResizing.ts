import { useState, useCallback, useEffect } from 'react';
import type { ColumnDef } from '@tanstack/react-table';

interface UseColumnResizingProps {
  columns: ColumnDef<Record<string, any>, any>[];
  containerWidth: number;
  onColumnRatioChange?: (columnRatios: Record<string, number>) => void;
}

export function useColumnResizing({
  columns,
  containerWidth,
  onColumnRatioChange
}: UseColumnResizingProps) {
  // State to track column widths
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  
  // Initialize column widths based on ratios or default values
  useEffect(() => {
    if (!columns || columns.length === 0 || containerWidth === 0) return;
    
    const initialWidths: Record<string, number> = {};
    const totalRatio = columns.reduce((sum, col) => {
      const ratio = (col.meta as any)?.ratio || 1;
      return sum + ratio;
    }, 0);
    
    columns.forEach(col => {
      const columnId = String(col.id || '');
      if (!columnId) return;
      
      const ratio = (col.meta as any)?.ratio || 1;
      const width = Math.floor((ratio / totalRatio) * containerWidth);
      initialWidths[columnId] = width;
    });
    
    setColumnWidths(initialWidths);
  }, [columns, containerWidth]);
  
  // Handle column resize
  const handleColumnResize = useCallback((columnId: string, newWidth: number) => {
    setColumnWidths(prev => ({
      ...prev,
      [columnId]: newWidth
    }));
  }, []);
  
  // Save column ratios when resizing is complete
  const handleResizeComplete = useCallback(() => {
    if (!onColumnRatioChange || !columns || columns.length === 0 || containerWidth === 0) return;
    
    const columnRatios: Record<string, number> = {};
    const totalWidth = Object.values(columnWidths).reduce((sum, width) => sum + width, 0);
    
    Object.entries(columnWidths).forEach(([columnId, width]) => {
      // Calculate ratio based on width relative to total width
      const ratio = width / totalWidth;
      columnRatios[columnId] = ratio;
    });
    
    onColumnRatioChange(columnRatios);
  }, [columnWidths, columns, containerWidth, onColumnRatioChange]);
  
  return {
    columnWidths,
    handleColumnResize,
    handleResizeComplete
  };
} 