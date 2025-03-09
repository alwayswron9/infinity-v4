import React, { useEffect, useState, useRef } from 'react';
import { 
  Box, 
  Center, 
  Spinner,
  useColorModeValue,
  Table,
  Tbody,
  useDisclosure,
  Flex,
  Text,
  Fade,
  Tr,
  Td
} from '@chakra-ui/react';
import type { ColumnDef } from '@tanstack/react-table';

// Import our new components
import { EmptyStateMessage } from './EmptyStateMessage';
import { TableHeader } from './TableHeader';
import { TableRow } from './TableRow';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';
import { useColumnWidths } from './useColumnWidths';
import { useEnhancedColumns } from './useEnhancedColumns';

// Define custom meta type for columns
interface CustomColumnMeta {
  isAction?: boolean;
  [key: string]: any;
}

interface EnhancedDataTableProps {
  data: any[];
  columns: ColumnDef<Record<string, any>, any>[];
  isLoading?: boolean;
  onRowClick?: (row: Record<string, any>) => void;
  onDeleteRow?: (row: Record<string, any>) => void;
  onColumnRatioChange?: (columnRatios: Record<string, number>) => void;
  emptyStateMessage?: string;
  isHoverable?: boolean;
}

export function EnhancedDataTable({ 
  data = [], 
  columns, 
  isLoading = false,
  onRowClick,
  onDeleteRow,
  onColumnRatioChange,
  emptyStateMessage = "No data available",
  isHoverable = true
}: EnhancedDataTableProps) {
  // State for container dimensions
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  
  // First load flag
  const [firstLoad, setFirstLoad] = useState(true);
  // Previous data for smooth transitions
  const [previousData, setPreviousData] = useState<any[]>([]);
  
  // Delete confirmation dialog
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [recordToDelete, setRecordToDelete] = useState<Record<string, any> | null>(null);
  
  // Effect to measure container width and calculate column sizes
  useEffect(() => {
    if (containerRef) {
      // Measure the container width
      const measureContainer = () => {
        const newWidth = containerRef.getBoundingClientRect().width;
        if (newWidth !== containerWidth) {
          setContainerWidth(newWidth);
        }
      };

      // Initial measurement
      measureContainer();

      // Add resize listener
      const resizeObserver = new ResizeObserver(measureContainer);
      resizeObserver.observe(containerRef);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [containerRef, containerWidth]);

  // Effect to handle first load state
  useEffect(() => {
    if (!isLoading && firstLoad) {
      setFirstLoad(false);
    }
  }, [isLoading, firstLoad]);

  // Effect to store previous data for smooth transitions
  useEffect(() => {
    if (data.length > 0) {
      setPreviousData(data);
    }
  }, [data]);

  // Handle delete confirmation
  const handleDeleteClick = (record: Record<string, any>) => {
    setRecordToDelete(record);
    onOpen();
  };

  const handleConfirmDelete = () => {
    if (recordToDelete && onDeleteRow) {
      onDeleteRow(recordToDelete);
    }
    onClose();
    setRecordToDelete(null);
  };

  // Calculate column widths
  const columnWidths = useColumnWidths(
    columns, 
    containerWidth, 
    Boolean(onRowClick || onDeleteRow)
  );

  // Enhanced columns with responsive widths and actions
  const enhancedColumns = useEnhancedColumns(
    columns,
    columnWidths,
    containerWidth,
    onRowClick,
    handleDeleteClick
  );

  // Determine which data to display
  const displayData = isLoading && data.length === 0 && previousData.length > 0 
    ? previousData 
    : data;

  // Get colors for the loading indicator
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const loadingTextColor = useColorModeValue('gray.600', 'gray.300');
  const loadingRowBgColor = useColorModeValue('gray.50', 'gray.700');

  return (
    <Box 
      position="relative" 
      height="100%" 
      width="100%" 
      overflowY="auto"
      overflowX="hidden"
      ref={setContainerRef}
      minHeight="250px" // Ensure loading spinner has space
    >
      {isLoading && firstLoad ? (
        <Center height="100%" width="100%" py={10}>
          <Spinner 
            size="xl" 
            thickness="3px" 
            color="brand.500" 
            emptyColor="gray.200"
            speed="0.8s"
          />
        </Center>
      ) : displayData.length === 0 ? (
        <EmptyStateMessage message={emptyStateMessage} />
      ) : (
        <Box position="relative">
          <Table 
            width="100%" 
            layout="fixed" // Force table to respect column widths
            style={{ borderCollapse: 'separate', borderSpacing: 0 }}
            size="sm"
            variant="unstyled"
            borderRadius="md"
            overflow="hidden"
            boxShadow="none"
            borderWidth="1px"
            borderColor={borderColor}
            sx={{
              '& tbody tr:first-of-type': {
                borderTopWidth: '0',
                borderTopColor: borderColor,
              }
            }}
          >
            {/* Table Header */}
            <TableHeader columns={enhancedColumns} />
            
            {/* Table Body */}
            <Tbody>
              {displayData.map((row, rowIdx) => (
                <TableRow 
                  key={rowIdx}
                  row={row}
                  columns={enhancedColumns}
                  rowIndex={rowIdx}
                  onRowClick={onRowClick}
                />
              ))}
              
              {/* Loading indicator row at the bottom */}
              {isLoading && !firstLoad && (
                <Tr>
                  <Td 
                    colSpan={enhancedColumns.length} 
                    textAlign="center" 
                    py={5}
                    borderColor={borderColor}
                    borderBottomWidth="0"
                    bg={loadingRowBgColor}
                  >
                    <Flex 
                      justify="center" 
                      align="center" 
                      gap={2}
                    >
                      <Spinner 
                        size="sm" 
                        thickness="2px" 
                        color="brand.500" 
                        speed="0.8s"
                      />
                      <Text fontSize="sm" color={loadingTextColor} fontWeight="medium">
                        Loading more data...
                      </Text>
                    </Flex>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>
      )}
      
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
} 