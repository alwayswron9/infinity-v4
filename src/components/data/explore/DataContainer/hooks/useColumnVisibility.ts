import { useMemo, useCallback } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { ModelView as ModelViewType } from '@/types/viewDefinition';

interface UseColumnVisibilityProps {
  currentView: ModelViewType | null;
  columns: ColumnDef<Record<string, any>>[];
  onConfigChange: (config: any) => void;
}

interface CustomColumnMeta {
  isAction?: boolean;
  visible?: boolean;
  ratio?: number;
  [key: string]: any;
}

export function useColumnVisibility({ 
  currentView, 
  columns, 
  onConfigChange 
}: UseColumnVisibilityProps) {
  // Get all available columns including those that might be hidden
  const allAvailableColumns = useMemo(() => {
    if (!currentView || !currentView.config || !currentView.config.columns) {
      console.log("useColumnVisibility: No current view or columns config");
      return [];
    }
    
    // Format labels nicely
    const formattedColumns = currentView.config.columns.map(col => ({
      key: col.field,
      label: col.field.replace(/^_/, '').replace(/_/g, ' ').split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' '),
      visible: col.visible,
      ratio: col.ratio // Include ratio if available
    }));
    
    console.log("useColumnVisibility: Available columns:", formattedColumns);
    return formattedColumns;
  }, [currentView]);

  // Get visible columns based on the current view configuration
  const visibleColumns = useMemo(() => {
    if (!currentView || !currentView.config || !currentView.config.columns) return columns;
    
    // Create a map for faster lookups
    const columnConfigMap = new Map(
      currentView.config.columns.map(col => [col.field, col])
    );
    
    // Create a Set for faster lookups of visible columns
    const visibleColumnKeys = new Set(
      currentView.config.columns
        .filter(col => col.visible)
        .map(col => col.field)
    );
    
    console.log("useColumnVisibility: Visible column keys:", Array.from(visibleColumnKeys));
    
    // Check if we have all necessary columns in our columns array
    const columnIds = new Set(columns.map(col => String(col.id || (col as any).accessorKey)));
    
    // Find visible columns that are missing from the columns array
    const missingVisibleColumns = Array.from(visibleColumnKeys).filter(key => !columnIds.has(key));
    
    if (missingVisibleColumns.length > 0) {
      console.log("useColumnVisibility: Missing visible columns:", missingVisibleColumns);
      
      // Create column definitions for missing columns (especially system fields)
      const additionalColumns = missingVisibleColumns.map(field => {
        const colConfig = columnConfigMap.get(field);
        return {
          id: field,
          accessorKey: field,
          header: field.replace(/^_/, '').replace(/_/g, ' ').split(' ')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' '),
          meta: {
            ratio: colConfig?.ratio // Add ratio to column meta if available
          } as CustomColumnMeta
        };
      }) as ColumnDef<Record<string, any>>[];
      
      // Combine with existing columns
      const enhancedColumns = [...columns, ...additionalColumns];
      
      // Now filter to only include visible columns and add ratio to meta
      return enhancedColumns.filter(col => {
        const columnId = String(col.id || (col as any).accessorKey);
        const isVisible = visibleColumnKeys.has(columnId);
        
        // Add ratio to column meta if available
        if (isVisible) {
          const colConfig = columnConfigMap.get(columnId);
          if (colConfig?.ratio !== undefined) {
            col.meta = {
              ...(col.meta || {}),
              ratio: colConfig.ratio
            };
          }
        }
        
        return isVisible;
      });
    }
      
    // Return only visible columns with ratio added to meta
    return columns.filter(col => {
      // Handle different column definition types safely
      const columnId = String(col.id || (col as any).accessorKey);
      const isVisible = visibleColumnKeys.has(columnId);
      
      // Add ratio to column meta if available
      if (isVisible) {
        const colConfig = columnConfigMap.get(columnId);
        if (colConfig?.ratio !== undefined) {
          col.meta = {
            ...(col.meta || {}),
            ratio: colConfig.ratio
          };
        }
      }
      
      return isVisible;
    });
  }, [currentView, columns]);

  // Handle toggling column visibility
  const handleColumnToggle = useCallback((columnKey: string, isVisible: boolean) => {
    if (!currentView || !currentView.config) return;
    
    // Create a copy of the current columns configuration
    const updatedColumns = [...(currentView.config.columns || [])];
    
    // Find the column to update
    const columnIndex = updatedColumns.findIndex(col => col.field === columnKey);
    
    if (columnIndex >= 0) {
      // Update the visibility of the existing column
      updatedColumns[columnIndex] = {
        ...updatedColumns[columnIndex],
        visible: isVisible
      };
    } else {
      // Add a new column configuration if it doesn't exist
      updatedColumns.push({
        field: columnKey,
        visible: isVisible,
        width: 150, // Default width
        format: { type: 'text' },
        sortable: true,
        filterable: true
      });
    }
    
    // Update the configuration
    onConfigChange({
      ...currentView.config,
      columns: updatedColumns
    });
  }, [currentView, onConfigChange]);

  // Handle saving column ratios
  const handleColumnRatioChange = useCallback((columnRatios: Record<string, number>) => {
    if (!currentView || !currentView.config) return;
    
    // Create a copy of the current columns configuration
    const updatedColumns = [...(currentView.config.columns || [])];
    
    // Update ratios for each column
    Object.entries(columnRatios).forEach(([columnKey, ratio]) => {
      const columnIndex = updatedColumns.findIndex(col => col.field === columnKey);
      
      if (columnIndex >= 0) {
        // Update the ratio of the existing column
        updatedColumns[columnIndex] = {
          ...updatedColumns[columnIndex],
          ratio
        };
      }
    });
    
    // Update the configuration
    onConfigChange({
      ...currentView.config,
      columns: updatedColumns
    });
  }, [currentView, onConfigChange]);

  return {
    allAvailableColumns,
    visibleColumns,
    handleColumnToggle,
    handleColumnRatioChange
  };
} 