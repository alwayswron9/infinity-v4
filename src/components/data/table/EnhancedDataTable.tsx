import React, { useMemo, useEffect, useState } from 'react';
import { 
  Box, 
  Center, 
  Spinner,
  useColorModeValue,
  Text,
  VStack,
  Icon
} from '@chakra-ui/react';
import { DataTable } from '@saas-ui/react';
import type { ColumnDef, CellContext } from '@tanstack/react-table';
import { FileText } from 'lucide-react';

// Define custom meta type for columns
interface CustomColumnMeta {
  isAction?: boolean;
  [key: string]: any;
}

interface EmptyStateMessageProps {
  message: string;
}

function EmptyStateMessage({ message }: EmptyStateMessageProps) {
  return (
    <Center 
      position="absolute" 
      top="0" 
      left="0" 
      right="0" 
      bottom="0"
      pointerEvents="none"
    >
      <VStack spacing={3}>
        <Icon as={FileText} boxSize={10} color="gray.400" />
        <Text color="gray.500" fontSize="sm" fontWeight="medium">{message}</Text>
      </VStack>
    </Center>
  );
}

interface EnhancedDataTableProps {
  data: any[];
  columns: ColumnDef<Record<string, any>, any>[];
  isLoading?: boolean;
  onRowClick?: (row: Record<string, any>) => void;
  emptyStateMessage?: string;
  isHoverable?: boolean;
}

export function EnhancedDataTable({ 
  data, 
  columns, 
  isLoading = false,
  onRowClick,
  emptyStateMessage = "No data to display",
  isHoverable = true
}: EnhancedDataTableProps) {
  const [containerWidth, setContainerWidth] = useState<number>(0);
  
  // Set up a resize observer to update column widths when the container resizes
  useEffect(() => {
    const tableContainer = document.querySelector('[data-enhanced-table-container]');
    if (!tableContainer) return;
    
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    
    resizeObserver.observe(tableContainer);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Calculate dynamic column widths to fit container width
  const getColumnWidths = useMemo(() => {
    if (!columns || columns.length === 0 || containerWidth === 0) return {};
    
    // Define column type weights - some columns should be wider than others
    const columnTypeWeights: {[key: string]: number} = {
      id: 1,           // ID columns (usually narrow)
      date: 1.2,       // Date columns 
      time: 1.2,       // Time columns
      created: 1.1,    // Created/updated dates
      status: 0.8,     // Status columns (usually short text)
      actions: 0.6,    // Action columns (usually buttons)
      default: 2       // Default for text columns - give them more space
    };
    
    // Assign weights to columns based on their type or id
    const columnWeights = columns.map(col => {
      // Check for special column types by ID or accessor
      const columnId = String(col.id || '').toLowerCase();
      
      if (columnId.includes('id') || columnId.startsWith('_')) return columnTypeWeights.id;
      if (columnId.includes('date')) return columnTypeWeights.date;
      if (columnId.includes('time')) return columnTypeWeights.time;
      if (columnId.includes('created') || columnId.includes('updated')) return columnTypeWeights.created;
      if (columnId.includes('status') || columnId.includes('state')) return columnTypeWeights.status;
      if (columnId === 'actions' || (col.meta as CustomColumnMeta)?.isAction) return columnTypeWeights.actions;
      
      return columnTypeWeights.default;
    });
    
    // Calculate total weight
    const totalWeight = columnWeights.reduce((sum, weight) => sum + weight, 0);
    
    // Calculate width per weight unit
    const widthPerWeightUnit = containerWidth / totalWeight;
    
    // Generate an object mapping column indices to widths
    const widths: {[key: number]: number} = {};
    columnWeights.forEach((weight, index) => {
      widths[index] = Math.floor(weight * widthPerWeightUnit);
    });
    
    return widths;
  }, [columns, containerWidth]);

  // Enhanced columns with clickable rows and responsive widths
  const enhancedColumns = useMemo(() => {
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
    
    // Make data columns clickable and adjust widths
    const processedColumns = columns.map((column, index) => {
      // Create a new column definition with an enhanced cell renderer
      const newColumn = { ...column };
      
      // Format column header if it's not already defined
      if (!newColumn.header && newColumn.id) {
        newColumn.header = formatColumnHeader(newColumn.id);
      }
      
      // Set width based on our calculated proportions
      if (containerWidth > 0 && getColumnWidths[index]) {
        newColumn.size = getColumnWidths[index];
      }
      
      // Add cell renderer to make cells clickable if onRowClick provided
      if (onRowClick) {
        const cellRenderer = (info: CellContext<Record<string, any>, unknown>) => {
          // Get the original cell content
          let displayContent;
          
          if (typeof column.cell === 'function') {
            // Use the original cell renderer if it exists
            displayContent = column.cell(info);
          } else {
            // Otherwise just get the value directly
            const value = info.getValue();
            
            // For empty values, show a dash
            if (value === null || value === undefined || value === '') {
              return <Text color="gray.400">-</Text>;
            }
            
            displayContent = String(value);
          }
          
          return (
            <Box 
              onClick={() => onRowClick(info.row.original)}
              cursor="pointer"
              _hover={{ color: "blue.500" }}
              textOverflow="ellipsis"
              overflow="hidden"
              whiteSpace="nowrap"
              maxW="100%"
              title={typeof displayContent === 'string' ? displayContent : undefined}
            >
              {displayContent}
            </Box>
          );
        };
        
        // Assign the cell renderer
        newColumn.cell = cellRenderer;
      }
      
      return newColumn;
    });
    
    // Add an actions column if it doesn't exist and onRowClick is provided
    if (onRowClick && !columns.some(col => col.id === 'actions')) {
      const actionColumn: ColumnDef<Record<string, any>> = {
        id: 'actions',
        header: 'Actions',
        size: 80, // Fixed size for actions column
        cell: (info: CellContext<Record<string, any>, unknown>) => (
          <Box 
            textAlign="center" 
            color="blue.500" 
            cursor="pointer"
            onClick={(e) => {
              e.stopPropagation();
              onRowClick(info.row.original);
            }}
          >
            View
          </Box>
        ),
        meta: {
          isAction: true
        } as CustomColumnMeta
      };
      
      return [...processedColumns, actionColumn];
    }
    
    return processedColumns;
  }, [columns, onRowClick, containerWidth, getColumnWidths]);
  
  const tableBackgroundColor = useColorModeValue('white', 'gray.800');
  const tableHeaderColor = useColorModeValue('gray.50', 'gray.700');

  return (
    <Box 
      position="relative" 
      width="100%" 
      height="100%"
      overflow="hidden"
      data-enhanced-table-container
    >
      {isLoading && (
        <Center 
          position="absolute" 
          top="0" 
          left="0" 
          right="0" 
          bottom="0" 
          bg="blackAlpha.300" 
          zIndex="1"
        >
          <Spinner size="xl" color="purple.500" />
        </Center>
      )}
      
      <Box 
        width="100%" 
        height="100%"
        overflow="auto"
        css={{
          // Scrollbar styling
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: useColorModeValue('gray.100', 'gray.800'),
          },
          '&::-webkit-scrollbar-thumb': {
            background: useColorModeValue('gray.300', 'gray.600'),
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: useColorModeValue('gray.400', 'gray.500'),
          },
          // Sticky headers
          'thead tr th': {
            position: 'sticky',
            top: 0,
            zIndex: 10,
            background: tableHeaderColor,
            fontWeight: 'medium',
            fontSize: 'sm',
            textTransform: 'none'
          }
        }}
      >
        <DataTable
          columns={enhancedColumns}
          data={data}
          isSortable={true}
          isSelectable={false}
          size="md"
          variant="default"
          sx={{ 
            width: '100%',
            tableLayout: 'fixed',
            '& tbody tr': {
              backgroundColor: tableBackgroundColor,
              transition: 'background-color 0.2s',
              '&:hover': {
                backgroundColor: useColorModeValue('gray.50', 'gray.700'),
              }
            },
            '& th, & td': {
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              padding: '12px 16px',
              lineHeight: '1.2',
              borderColor: useColorModeValue('gray.200', 'gray.700')
            },
            '& th': {
              color: useColorModeValue('gray.700', 'gray.200'),
            },
            '& td': {
              color: useColorModeValue('gray.800', 'gray.300'),
              fontSize: 'sm'
            }
          }}
        />
      </Box>
      
      {data.length === 0 && !isLoading && (
        <EmptyStateMessage message={emptyStateMessage} />
      )}
    </Box>
  );
} 