import { useMemo, useCallback } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { ModelView as ModelViewType } from '@/types/viewDefinition';

interface UseColumnVisibilityProps {
  currentView: ModelViewType | null;
  columns: ColumnDef<Record<string, any>>[];
  onConfigChange: (config: any) => void;
}

interface ColumnInfo {
  key: string;
  label: string;
  visible: boolean;
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
      visible: col.visible
    }));
    
    console.log("useColumnVisibility: Available columns:", formattedColumns);
    return formattedColumns;
  }, [currentView]);

  // Get visible columns based on the current view configuration
  const visibleColumns = useMemo(() => {
    if (!currentView || !currentView.config || !currentView.config.columns) return columns;
    
    // Create a Set for faster lookups
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
      const additionalColumns = missingVisibleColumns.map(field => ({
        id: field,
        accessorKey: field,
        header: field.replace(/^_/, '').replace(/_/g, ' ').split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')
      })) as ColumnDef<Record<string, any>>[];
      
      // Combine with existing columns
      const enhancedColumns = [...columns, ...additionalColumns];
      
      // Now filter to only include visible columns
      return enhancedColumns.filter(col => {
        const columnId = String(col.id || (col as any).accessorKey);
        return visibleColumnKeys.has(columnId);
      });
    }
      
    // Return only visible columns
    return columns.filter(col => {
      // Handle different column definition types safely
      const columnId = String(col.id || (col as any).accessorKey);
      const isVisible = visibleColumnKeys.has(columnId);
      return isVisible;
    });
  }, [currentView, columns]);

  // Handle column visibility toggle
  const handleColumnToggle = useCallback((columnKey: string, isVisible: boolean) => {
    console.log(`useColumnVisibility: Toggling column ${columnKey} to ${isVisible}`);
    
    if (!currentView || !currentView.config) {
      console.error("useColumnVisibility: Cannot toggle column - no current view or config");
      return;
    }

    // Get current columns config
    const currentColumns = [...currentView.config.columns];
    
    // Find and update the column's visibility
    const updatedColumns = currentColumns.map(col => {
      if (col.field === columnKey) {
        console.log(`useColumnVisibility: Updating column ${col.field} visibility to ${isVisible}`);
        return { ...col, visible: isVisible };
      }
      return col;
    });

    // Create a new config object (to ensure reactivity)
    const newConfig = {
      ...currentView.config,
      columns: updatedColumns,
      // Add a timestamp to force detection of changes
      lastUpdated: new Date().toISOString()
    };

    console.log("useColumnVisibility: Calling onConfigChange with new config");
    
    // Notify parent component of the change
    onConfigChange(newConfig);
  }, [currentView, onConfigChange]);

  return {
    allAvailableColumns,
    visibleColumns,
    handleColumnToggle
  };
} 