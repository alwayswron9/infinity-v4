import React, { useEffect, useState, useRef } from 'react';
import { 
  Box, 
  Center, 
  Spinner,
  useColorModeValue,
  Table,
  Tbody,
  useDisclosure
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
  emptyStateMessage?: string;
  isHoverable?: boolean;
}

export function EnhancedDataTable({ 
  data = [], 
  columns, 
  isLoading = false,
  onRowClick,
  onDeleteRow,
  emptyStateMessage = "No data available",
  isHoverable = true
}: EnhancedDataTableProps) {
  // State for container dimensions
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  
  // First load flag
  const [firstLoad, setFirstLoad] = useState(true);
  
  // Delete confirmation dialog
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
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
      {isLoading ? (
        <Center height="100%" width="100%" py={10}>
          <Spinner 
            size="xl" 
            thickness="3px" 
            color="brand.500" 
            emptyColor="gray.200"
            speed="0.8s"
          />
        </Center>
      ) : data.length === 0 ? (
        <EmptyStateMessage message={emptyStateMessage} />
      ) : (
        <Table 
          width="100%" 
          layout="fixed" // Force table to respect column widths
          style={{ borderCollapse: 'separate', borderSpacing: 0 }}
          size="sm"
        >
          {/* Table Header */}
          <TableHeader columns={enhancedColumns} />
          
          {/* Table Body */}
          <Tbody>
            {data.map((row, rowIdx) => (
              <TableRow 
                key={rowIdx}
                row={row}
                columns={enhancedColumns}
                rowIndex={rowIdx}
              />
            ))}
          </Tbody>
        </Table>
      )}
      
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleConfirmDelete}
        cancelRef={cancelRef}
      />
    </Box>
  );
} 