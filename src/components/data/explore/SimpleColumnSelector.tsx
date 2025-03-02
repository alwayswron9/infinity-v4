import React, { useState, useCallback } from 'react';
import {
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Checkbox,
  VStack,
  Tooltip,
  Text,
  useColorModeValue,
  Divider,
  Box,
  useDisclosure
} from '@chakra-ui/react';
import { Columns } from 'lucide-react';

interface Column {
  key: string;
  label: string;
  visible: boolean;
}

interface SimpleColumnSelectorProps {
  columns: Column[];
  onColumnToggle: (columnKey: string, isVisible: boolean) => void;
}

export function SimpleColumnSelector({ columns, onColumnToggle }: SimpleColumnSelectorProps) {
  const popoverBg = useColorModeValue('white', 'gray.800');
  const headerBg = useColorModeValue('gray.50', 'gray.700');
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Keep a local copy of column visibility state to ensure UI updates immediately
  const [localColumns, setLocalColumns] = useState<Column[]>(columns);
  
  // Update local columns when props change
  React.useEffect(() => {
    setLocalColumns(columns);
    console.log("SimpleColumnSelector received columns:", columns);
  }, [columns]);
  
  // Group columns into system fields (starting with _) and regular fields
  const regularColumns = localColumns.filter(col => !col.key.startsWith('_'));
  const systemColumns = localColumns.filter(col => col.key.startsWith('_'));

  const handleColumnToggle = useCallback((columnKey: string, isChecked: boolean) => {
    console.log(`SimpleColumnSelector: Toggling column ${columnKey} to ${isChecked}`);
    
    // Update local state immediately for better UX
    setLocalColumns(prev => 
      prev.map(col => 
        col.key === columnKey ? { ...col, visible: isChecked } : col
      )
    );
    
    // Call the parent's toggle handler and log when it's done
    onColumnToggle(columnKey, isChecked);
    console.log(`SimpleColumnSelector: Called parent onColumnToggle for ${columnKey}`);
  }, [onColumnToggle]);

  return (
    <Popover 
      placement="bottom-end" 
      closeOnBlur={true} 
      gutter={4} 
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onClose}
      autoFocus={false}
    >
      <PopoverTrigger>
        <Tooltip label="Select columns">
          <IconButton
            aria-label="Select columns"
            icon={<Columns size={18} />}
            variant="outline"
            colorScheme="gray"
            size="sm"
          />
        </Tooltip>
      </PopoverTrigger>
      <PopoverContent 
        width="250px" 
        bg={popoverBg} 
        shadow="lg" 
        zIndex={9999}
        borderColor={useColorModeValue('gray.200', 'gray.700')}
      >
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader bg={headerBg} borderTopRadius="md">
          <Text fontWeight="medium">Toggle Columns</Text>
        </PopoverHeader>
        <PopoverBody maxH="300px" overflowY="auto" p={3}>
          {regularColumns.length > 0 && (
            <>
              <Text fontSize="xs" fontWeight="medium" color="gray.500" mb={2}>
                Model Fields
              </Text>
              <VStack align="start" spacing={1} mb={3}>
                {regularColumns.map((column) => (
                  <Checkbox
                    key={column.key}
                    isChecked={column.visible}
                    onChange={(e) => handleColumnToggle(column.key, e.target.checked)}
                    size="sm"
                    width="100%"
                  >
                    <Text fontSize="sm">{column.label}</Text>
                  </Checkbox>
                ))}
              </VStack>
            </>
          )}
          
          {systemColumns.length > 0 && (
            <>
              {regularColumns.length > 0 && <Divider my={2} />}
              <Text fontSize="xs" fontWeight="medium" color="gray.500" mb={2}>
                System Fields
              </Text>
              <VStack align="start" spacing={1}>
                {systemColumns.map((column) => (
                  <Checkbox
                    key={column.key}
                    isChecked={column.visible}
                    onChange={(e) => handleColumnToggle(column.key, e.target.checked)}
                    size="sm"
                    width="100%"
                  >
                    <Text fontSize="sm">{column.label.replace(/^_/, '')}</Text>
                  </Checkbox>
                ))}
              </VStack>
            </>
          )}
          
          {localColumns.length === 0 && (
            <Box textAlign="center" py={4}>
              <Text color="gray.500">No columns available</Text>
            </Box>
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
} 