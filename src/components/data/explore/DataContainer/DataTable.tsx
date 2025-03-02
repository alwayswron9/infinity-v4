import React from 'react';
import { Box } from '@chakra-ui/react';
import { EnhancedDataTable } from '@/components/data/table/EnhancedDataTable';
import { DataTableProps } from './types';

export function DataTable({ 
  data, 
  visibleColumns, 
  currentView, 
  isLoadingData, 
  onEditRow, 
  onDeleteRow 
}: DataTableProps) {
  return (
    <Box flex="1" overflow="hidden" position="relative" width="100%">
      <EnhancedDataTable
        data={data}
        columns={visibleColumns}
        isLoading={isLoadingData}
        onRowClick={onEditRow}
        onDeleteRow={onDeleteRow}
        emptyStateMessage="No data available. Add data to start exploring."
        key={`table-${currentView?.id}-${visibleColumns.length}`}
      />
    </Box>
  );
} 