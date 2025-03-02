import React, { useMemo, useEffect, useState } from 'react';
import { 
  Box, 
  Center, 
  Spinner,
  useColorModeValue,
  Text,
  VStack,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  HStack,
  Button,
  IconButton,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay
} from '@chakra-ui/react';
import { DataTable } from '@saas-ui/react';
import type { ColumnDef, CellContext } from '@tanstack/react-table';
import { FileText, Trash, Eye } from 'lucide-react';

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
  // Table styling
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const tableBackgroundColor = useColorModeValue('white', 'gray.800');
  const tableHeaderColor = useColorModeValue('gray.50', 'gray.700');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');
  const headerTextColor = useColorModeValue('gray.600', 'gray.300');

  // State for container dimensions
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [columnWidths, setColumnWidths] = useState<number[]>([]);

  // First load flag
  const [firstLoad, setFirstLoad] = useState(true);
  
  // Delete confirmation dialog
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);
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

  // Calculate dynamic column widths to fit container width
  const getColumnWidths = useMemo(() => {
    if (!columns || columns.length === 0 || containerWidth === 0) return {};
    
    // Constants for width calculations
    const MIN_COLUMN_WIDTH = 80;
    const ACTION_COLUMN_WIDTH = 120;
    let availableWidth = containerWidth;
    let numberOfContentColumns = columns.length;
    let reservedWidth = 0;
    
    // First, reserve space for the action column (if it exists or will be created)
    const hasOrWillHaveActionsColumn = (onRowClick || onDeleteRow) || columns.some(col => col.id === 'actions');
    
    if (hasOrWillHaveActionsColumn) {
      reservedWidth += ACTION_COLUMN_WIDTH;
      availableWidth -= ACTION_COLUMN_WIDTH;
      numberOfContentColumns--; // Reduce by one as we've accounted for the actions column
    }
    
    // Find out which columns are visible
    const visibleColumns = columns.filter(col => {
      // Consider column visible if no meta is provided or it doesn't have visible: false
      return !col.meta || (col.meta as any).visible !== false;
    });
    
    // Count only visible content columns
    numberOfContentColumns = visibleColumns.filter(col => 
      col.id !== 'actions' && 
      (!(col.meta as CustomColumnMeta)?.isAction)
    ).length;
    
    // Define column type weights - some columns should be wider than others
    const columnTypeWeights: {[key: string]: number} = {
      id: 0.7,        // ID columns (narrower)
      date: 1.2,       // Date columns 
      time: 1.2,       // Time columns
      created: 1.1,    // Created/updated dates
      status: 0.8,     // Status columns (usually short text)
      default: 1.5     // Default for text columns - give them reasonable space
    };
    
    // Assign weights to columns based on their type or id
    const columnWeights = visibleColumns.map(col => {
      // Skip action columns as we've already accounted for them
      if (col.id === 'actions' || (col.meta as CustomColumnMeta)?.isAction) {
        return 0; // Zero weight, since we already reserved space
      }
      
      // Check for special column types by ID or accessor
      const columnId = String(col.id || '').toLowerCase();
      
      if (columnId.includes('id') || columnId.startsWith('_')) return columnTypeWeights.id;
      if (columnId.includes('date')) return columnTypeWeights.date;
      if (columnId.includes('time')) return columnTypeWeights.time;
      if (columnId.includes('created') || columnId.includes('updated')) return columnTypeWeights.created;
      if (columnId.includes('status') || columnId.includes('state')) return columnTypeWeights.status;
      
      return columnTypeWeights.default;
    });
    
    // Calculate total weight, only considering content columns
    const totalWeight = columnWeights.reduce((sum, weight) => sum + weight, 0);
    
    // Calculate width per weight unit
    const widthPerWeightUnit = totalWeight > 0 ? availableWidth / totalWeight : 0;
    
    // Generate an object mapping column indices to widths
    const widths: {[key: number]: number} = {};
    
    columns.forEach((column, index) => {
      // Set fixed width for action columns
      if (column.id === 'actions' || (column.meta as CustomColumnMeta)?.isAction) {
        widths[index] = ACTION_COLUMN_WIDTH;
        return;
      }
      
      // Skip hidden columns
      if (column.meta && (column.meta as any).visible === false) {
        widths[index] = 0; // Zero width for hidden columns
        return;
      }
      
      // For visible content columns, calculate based on weight
      const weight = columnWeights[visibleColumns.findIndex(vc => vc.id === column.id)] || columnTypeWeights.default;
      const calculatedWidth = Math.max(MIN_COLUMN_WIDTH, Math.floor(weight * widthPerWeightUnit));
      widths[index] = calculatedWidth;
    });
    
    console.log("Calculated column widths:", widths);
    return widths;
  }, [columns, containerWidth, onRowClick, onDeleteRow]);

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
    
    // Process columns but don't make all cells clickable
    const processedColumns = columns.map((column, index) => {
      // Create a new column definition
      const newColumn = { ...column };
      
      // Format column header if it's not already defined
      if (!newColumn.header && newColumn.id) {
        newColumn.header = formatColumnHeader(newColumn.id);
      }
      
      // Set width based on our calculated proportions
      if (containerWidth > 0 && getColumnWidths[index]) {
        newColumn.size = getColumnWidths[index];
      }
      
      // We're removing the cell click renderer since we don't want the whole cell to be clickable
      
      return newColumn;
    });
    
    // Add an actions column if needed
    if ((onRowClick || onDeleteRow) && !columns.some(col => col.id === 'actions')) {
      const actionColumn: ColumnDef<Record<string, any>> = {
        id: 'actions',
        header: 'Actions',
        size: 120,
        cell: (info: CellContext<Record<string, any>, unknown>) => (
          <HStack spacing={2} justifyContent="center">
            {onRowClick && (
              <IconButton
                icon={<Eye size={16} />}
                aria-label="View"
                size="xs"
                colorScheme="blue"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onRowClick(info.row.original);
                }}
              />
            )}
            {onDeleteRow && (
              <IconButton
                icon={<Trash size={16} />}
                aria-label="Delete"
                size="xs"
                colorScheme="red"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(info.row.original);
                }}
              />
            )}
          </HStack>
        ),
        meta: {
          isAction: true
        } as CustomColumnMeta
      };
      
      return [...processedColumns, actionColumn];
    }
    
    return processedColumns;
  }, [columns, onRowClick, onDeleteRow, containerWidth, getColumnWidths]);

  return (
    <Box 
      position="relative" 
      height="100%" 
      width="100%" 
      overflow="auto"
      ref={setContainerRef}
      minHeight="250px" // Ensure loading spinner has space
    >
      {isLoading ? (
        <Center height="100%" width="100%" py={10}>
          <Spinner 
            size="xl" 
            thickness="3px" 
            color="purple.500" 
            emptyColor="gray.200"
            speed="0.8s"
          />
        </Center>
      ) : data.length === 0 ? (
        <EmptyStateMessage message={emptyStateMessage} />
      ) : (
        <Table 
          width="100%" 
          style={{ borderCollapse: 'separate', borderSpacing: 0 }}
          size="sm"
        >
          {/* Fixed header - Updated styling to match SaaS UI standards */}
          <Thead bg={tableHeaderColor} position="sticky" top={0} zIndex={1}>
            <Tr>
              {enhancedColumns.map((column, idx) => (
                <Th 
                  key={idx}
                  width={column.size ? `${column.size}px` : undefined}
                  textTransform="none"
                  fontSize="xs"
                  fontWeight="medium"
                  color="gray.500"
                  borderBottomWidth="1px"
                  borderColor={borderColor}
                  p="10px 16px"
                  whiteSpace="nowrap"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  letterSpacing="0.5px"
                >
                  {typeof column.header === 'function' 
                    ? column.header({} as any) 
                    : column.header as React.ReactNode}
                </Th>
              ))}
            </Tr>
          </Thead>
          
          {/* Scrollable body area - Remove row click handler */}
          <Tbody>
            {data.map((row, rowIdx) => (
              <Tr 
                key={rowIdx}
                // Removed cursor pointer and onClick for the entire row
                bg={tableBackgroundColor}
                _hover={{
                  bg: hoverBgColor,
                }}
                transition="background-color 0.2s"
              >
                {enhancedColumns.map((column, colIdx) => {
                  // Get the value using the column id
                  let value = null;
                  
                  if (column.id) {
                    value = row[column.id];
                  } else if ('accessorKey' in column) {
                    value = row[(column as any).accessorKey];
                  }
                  
                  // Format the cell content
                  let cellContent;
                  if (typeof column.cell === 'function') {
                    const info = {
                      getValue: () => value,
                      row: { original: row },
                      column: column
                    } as CellContext<Record<string, any>, unknown>;
                    cellContent = column.cell(info);
                  } else if (value === null || value === undefined || value === '') {
                    cellContent = <Text color="gray.400">-</Text>;
                  } else if (typeof value === 'object') {
                    cellContent = JSON.stringify(value);
                  } else {
                    cellContent = String(value);
                  }
                  
                  return (
                    <Td 
                      key={colIdx}
                      p="12px 16px"
                      borderColor={borderColor}
                      fontSize="sm"
                      overflow="hidden"
                      textOverflow="ellipsis"
                      whiteSpace="nowrap"
                      width={column.size ? `${column.size}px` : undefined}
                      title={typeof cellContent === 'string' ? cellContent : undefined}
                    >
                      {cellContent}
                    </Td>
                  );
                })}
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Record
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this record? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleConfirmDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
} 