import React, { useEffect } from 'react';
import { EnhancedDataTable } from '@/components/data/table/EnhancedDataTable';
import type { ModelView as ModelViewType } from '@/types/viewDefinition';
import type { ColumnDef } from '@tanstack/react-table';

interface DataContainerProps {
  currentView: ModelViewType | null;
  data: any[];
  columns: ColumnDef<Record<string, any>>[];
  pagination: { pageIndex: number; pageSize: number; pageCount: number; total: number } | null;
  isLoadingData: boolean;
  isInitialLoad: boolean;
  hasUnsavedChanges: boolean;
  availableColumns: string[];
  onPaginationChange: (pageIndex: number, pageSize: number) => void;
  onConfigChange: (config: any) => void;
  onSave: () => void;
  onEditRow: (row: Record<string, any>) => void;
  onDeleteRow: (row: Record<string, any>) => void;
  onCreateView: () => void;
}

export function DataContainer({
  currentView,
  data,
  columns,
  pagination,
  isLoadingData,
  isInitialLoad,
  hasUnsavedChanges,
  availableColumns,
  onPaginationChange,
  onConfigChange,
  onSave,
  onEditRow,
  onDeleteRow,
  onCreateView
}: DataContainerProps) {
  // Process columns to make ID and meta columns have fixed width
  const processedColumns = React.useMemo(() => {
    if (!columns) return [];
    
    return columns.map(column => {
      // Get column key to determine if it's a special column (ID or system field)
      let columnKey = '';
      
      // Extract column key from the different possible structures
      if ('accessorKey' in column && column.accessorKey) {
        columnKey = String(column.accessorKey);
      } else if ('id' in column && column.id) {
        columnKey = String(column.id);
      }
                        
      // Apply appropriate width class based on column type
      let className = '';
      
      if (columnKey === '_id') {
        className = 'id-column';
      } else if (columnKey.startsWith('_')) {
        className = 'meta-column';
      }
      
      // Return column with meta info including class name
      return {
        ...column,
        meta: {
          ...(column.meta || {}),
          className
        }
      };
    });
  }, [columns]);
  
  // Create a default pagination object if none is provided
  const defaultPagination = {
    pageIndex: 0,
    pageSize: 10,
    pageCount: 1,
    total: data.length
  };
  
  return (
    <div className="data-container">
      {currentView ? (
        <EnhancedDataTable
          data={data}
          columns={processedColumns}
          viewConfig={currentView.config}
          pagination={pagination || defaultPagination}
          onPaginationChange={onPaginationChange}
          onConfigChange={onConfigChange}
          isLoading={isLoadingData && !isInitialLoad}
          hasUnsavedChanges={hasUnsavedChanges}
          availableColumns={availableColumns}
          onSave={onSave}
          showRowActions={true}
          onEditRow={onEditRow}
          onDeleteRow={onDeleteRow}
        />
      ) : (
        <div className="no-views-container">
          <div className="no-views-message">No view selected</div>
          <button
            onClick={onCreateView}
            className="create-view-button"
          >
            Create your first view
          </button>
        </div>
      )}
    </div>
  );
} 