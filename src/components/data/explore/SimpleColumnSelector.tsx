import React from 'react';
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
  Box
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
  
  // Group columns into system fields (starting with _) and regular fields
  const regularColumns = columns.filter(col => !col.key.startsWith('_'));
  const systemColumns = columns.filter(col => col.key.startsWith('_'));

  return (
    <Popover placement="bottom-end">
      <PopoverTrigger>
        <Tooltip label="Select columns">
          <IconButton
            aria-label="Select columns"
            icon={<Columns size={18} />}
            variant="ghost"
            colorScheme="gray"
            size="sm"
          />
        </Tooltip>
      </PopoverTrigger>
      <PopoverContent width="250px" bg={popoverBg} shadow="lg">
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
                    onChange={(e) => onColumnToggle(column.key, e.target.checked)}
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
                    onChange={(e) => onColumnToggle(column.key, e.target.checked)}
                    size="sm"
                    width="100%"
                  >
                    <Text fontSize="sm">{column.label.replace(/^_/, '')}</Text>
                  </Checkbox>
                ))}
              </VStack>
            </>
          )}
          
          {columns.length === 0 && (
            <Box textAlign="center" py={4}>
              <Text color="gray.500">No columns available</Text>
            </Box>
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
} 