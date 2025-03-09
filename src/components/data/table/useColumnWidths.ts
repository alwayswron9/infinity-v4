import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';

interface CustomColumnMeta {
  isAction?: boolean;
  visible?: boolean;
  ratio?: number; // Add support for custom column ratio
  [key: string]: any;
}

export function useColumnWidths(
  columns: ColumnDef<Record<string, any>, any>[],
  containerWidth: number,
  hasActions: boolean
) {
  return useMemo(() => {
    if (!columns || columns.length === 0 || containerWidth === 0) return {};
    
    // Constants for width calculations
    const MIN_COLUMN_WIDTH = 80;
    const ACTION_COLUMN_WIDTH = 120;
    
    // Account for table padding/borders (adjust if needed)
    const TABLE_PADDING = 2; // 1px border on each side
    const AVAILABLE_WIDTH = Math.max(0, containerWidth - TABLE_PADDING);
    
    // Find out which columns are visible
    const visibleColumns = columns.filter(col => {
      // Consider column visible if no meta is provided or it doesn't have visible: false
      return !col.meta || (col.meta as CustomColumnMeta).visible !== false;
    });
    
    // Identify action columns
    const actionColumns = visibleColumns.filter(col => 
      col.id === 'actions' || (col.meta as CustomColumnMeta)?.isAction
    );
    
    // Identify content columns (non-action columns)
    const contentColumns = visibleColumns.filter(col => 
      col.id !== 'actions' && !(col.meta as CustomColumnMeta)?.isAction
    );
    
    // Reserve space for action columns
    let reservedWidth = actionColumns.length * ACTION_COLUMN_WIDTH;
    
    // If we'll add an action column later, reserve space for it
    if (hasActions && actionColumns.length === 0) {
      reservedWidth += ACTION_COLUMN_WIDTH;
    }
    
    // Calculate remaining width for content columns
    const remainingWidth = Math.max(0, AVAILABLE_WIDTH - reservedWidth);
    
    // If no content columns, return empty object
    if (contentColumns.length === 0) return {};
    
    // Define column type weights - some columns should be wider than others
    const columnTypeWeights: {[key: string]: number} = {
      id: 0.7,        // ID columns (narrower)
      date: 1.2,       // Date columns 
      time: 1.2,       // Time columns
      created: 1.1,    // Created/updated dates
      status: 0.8,     // Status columns (usually short text)
      default: 1.5     // Default for text columns - give them reasonable space
    };
    
    // Assign weights to content columns, prioritizing custom ratios if available
    const columnWeights = contentColumns.map(col => {
      // Check if column has a custom ratio defined
      const customRatio = (col.meta as CustomColumnMeta)?.ratio;
      if (customRatio !== undefined) {
        return customRatio;
      }
      
      const columnId = String(col.id || '').toLowerCase();
      
      if (columnId.includes('id') || columnId.startsWith('_')) return columnTypeWeights.id;
      if (columnId.includes('date')) return columnTypeWeights.date;
      if (columnId.includes('time')) return columnTypeWeights.time;
      if (columnId.includes('created') || columnId.includes('updated')) return columnTypeWeights.created;
      if (columnId.includes('status') || columnId.includes('state')) return columnTypeWeights.status;
      
      return columnTypeWeights.default;
    });
    
    // Calculate total weight
    const totalWeight = columnWeights.reduce((sum, weight) => sum + weight, 0);
    
    // Calculate width per weight unit
    const widthPerWeightUnit = totalWeight > 0 ? remainingWidth / totalWeight : 0;
    
    // First pass: Calculate initial widths based on weights
    const initialWidths = columnWeights.map(weight => 
      Math.max(MIN_COLUMN_WIDTH, Math.floor(weight * widthPerWeightUnit))
    );
    
    // Calculate total allocated width
    const totalAllocatedWidth = initialWidths.reduce((sum, width) => sum + width, 0);
    
    // Calculate remaining width after first pass
    const widthDifference = remainingWidth - totalAllocatedWidth;
    
    // Second pass: Distribute remaining width proportionally
    let adjustedWidths = [...initialWidths];
    if (widthDifference !== 0 && totalAllocatedWidth > 0) {
      // Distribute remaining width proportionally to each column's current width
      adjustedWidths = initialWidths.map(width => 
        Math.max(MIN_COLUMN_WIDTH, Math.floor(width + (width / totalAllocatedWidth) * widthDifference))
      );
    }
    
    // Generate an object mapping column indices to widths
    const widths: {[key: number]: number} = {};
    
    // Map widths back to original column indices
    columns.forEach((column, index) => {
      // Set fixed width for action columns
      if (column.id === 'actions' || (column.meta as CustomColumnMeta)?.isAction) {
        widths[index] = ACTION_COLUMN_WIDTH;
        return;
      }
      
      // Skip hidden columns
      if (column.meta && (column.meta as CustomColumnMeta).visible === false) {
        widths[index] = 0;
        return;
      }
      
      // Find the corresponding content column index
      const contentIndex = contentColumns.findIndex(cc => cc.id === column.id);
      if (contentIndex >= 0) {
        widths[index] = adjustedWidths[contentIndex];
      } else {
        // Fallback for any columns not accounted for
        widths[index] = MIN_COLUMN_WIDTH;
      }
    });
    
    // Log the calculated widths for debugging
    console.log("Container width:", containerWidth);
    console.log("Available width:", AVAILABLE_WIDTH);
    console.log("Reserved width:", reservedWidth);
    console.log("Remaining width:", remainingWidth);
    console.log("Calculated column widths:", widths);
    console.log("Total allocated width:", Object.values(widths).reduce((sum, width) => sum + width, 0));
    
    return widths;
  }, [columns, containerWidth, hasActions]);
} 