import React from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
import { EnhancedDataTable } from '@/components/data/table/EnhancedDataTable';
import { DataTableProps } from './types';

export function DataTable({ 
  data, 
  visibleColumns, 
  currentView, 
  isLoadingData, 
  onEditRow, 
  onDeleteRow,
  onColumnRatioChange
}: DataTableProps) {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Box 
      flex="1" 
      overflow="hidden" 
      position="relative" 
      width="100%"
      borderRadius="md"
    >
      <EnhancedDataTable
        data={data}
        columns={visibleColumns}
        isLoading={isLoadingData}
        onRowClick={onEditRow}
        onDeleteRow={onDeleteRow}
        onColumnRatioChange={onColumnRatioChange}
        emptyStateMessage="No data available. Add data to start exploring."
        key={`table-${currentView?.id}-${visibleColumns.length}`}
      />
    </Box>
  );
} 