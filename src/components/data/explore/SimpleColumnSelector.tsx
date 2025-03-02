import React, { useState, useCallback, useEffect } from 'react';
import {
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Checkbox,
  VStack,
  Text,
  useColorModeValue,
  Box,
  Flex
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
  console.log("SimpleColumnSelector rendering with columns:", columns);
  
  // Keep a local copy of column visibility state to ensure UI updates immediately
  const [localColumns, setLocalColumns] = useState<Column[]>(columns);
  
  // Update local columns when props change
  useEffect(() => {
    console.log("SimpleColumnSelector columns changed:", columns);
    setLocalColumns(columns);
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
    
    // Call the parent's toggle handler
    console.log(`SimpleColumnSelector: Calling parent onColumnToggle for ${columnKey}`);
    onColumnToggle(columnKey, isChecked);
  }, [onColumnToggle]);

  const menuBg = useColorModeValue('white', 'gray.800');
  const menuBorder = useColorModeValue('gray.200', 'gray.700');

  return (
    <Menu closeOnSelect={false}>
      <MenuButton 
        as={Button}
        leftIcon={<Columns size={18} />}
        variant="outline"
        colorScheme="gray"
        size="sm"
        onClick={() => console.log("SimpleColumnSelector: Button clicked")}
      >
        Columns
      </MenuButton>
      <MenuList 
        bg={menuBg} 
        borderColor={menuBorder}
        minWidth="240px"
        zIndex={1000}
      >
        <Box px={3} py={2}>
          {regularColumns.length > 0 && (
            <>
              <Text fontSize="xs" fontWeight="medium" color="gray.500" mb={2}>
                Model Fields
              </Text>
              <VStack align="start" spacing={1} mb={3}>
                {regularColumns.map((column) => (
                  <Flex key={column.key} width="100%" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      isChecked={column.visible}
                      onChange={(e) => {
                        e.stopPropagation();
                        console.log(`SimpleColumnSelector: Checkbox changed for ${column.key} to ${e.target.checked}`);
                        handleColumnToggle(column.key, e.target.checked);
                      }}
                      size="sm"
                      width="100%"
                    >
                      <Text fontSize="sm">{column.label}</Text>
                    </Checkbox>
                  </Flex>
                ))}
              </VStack>
            </>
          )}
          
          {systemColumns.length > 0 && regularColumns.length > 0 && (
            <MenuDivider />
          )}
          
          {systemColumns.length > 0 && (
            <>
              <Text fontSize="xs" fontWeight="medium" color="gray.500" mb={2}>
                System Fields
              </Text>
              <VStack align="start" spacing={1}>
                {systemColumns.map((column) => (
                  <Flex key={column.key} width="100%" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      isChecked={column.visible}
                      onChange={(e) => {
                        e.stopPropagation();
                        console.log(`SimpleColumnSelector: Checkbox changed for ${column.key} to ${e.target.checked}`);
                        handleColumnToggle(column.key, e.target.checked);
                      }}
                      size="sm"
                      width="100%"
                    >
                      <Text fontSize="sm">{column.label.replace(/^_/, '')}</Text>
                    </Checkbox>
                  </Flex>
                ))}
              </VStack>
            </>
          )}
          
          {localColumns.length === 0 && (
            <Box textAlign="center" py={4}>
              <Text color="gray.500">No columns available</Text>
            </Box>
          )}
        </Box>
      </MenuList>
    </Menu>
  );
} 