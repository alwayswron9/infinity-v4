import React from 'react';
import {
  Thead,
  Tr,
  Th,
  useColorModeValue,
  Box,
  Flex,
  Text
} from '@chakra-ui/react';
import type { ColumnDef } from '@tanstack/react-table';

interface TableHeaderProps {
  columns: ColumnDef<Record<string, any>, any>[];
}

export function TableHeader({ columns }: TableHeaderProps) {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const tableHeaderBg = useColorModeValue('gray.50', 'gray.800');
  const headerTextColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <Thead 
      bg={tableHeaderBg} 
      position="sticky" 
      top={0} 
      zIndex={1}
      borderBottomWidth="2px"
      borderColor={borderColor}
      boxShadow="none"
    >
      <Tr>
        {columns.map((column, idx) => (
          <Th 
            key={idx}
            width={column.size ? `${column.size}px` : undefined}
            textTransform="none"
            fontSize="sm"
            fontWeight="medium"
            color={headerTextColor}
            borderBottomWidth="0"
            p="16px"
            py="18px"
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
            letterSpacing="normal"
            maxW={column.size ? `${column.size}px` : undefined}
            title={typeof column.header === 'string' ? column.header : undefined}
            _first={{ pl: "20px" }}
            _last={{ pr: "20px" }}
          >
            <Flex align="center" gap={1}>
              {typeof column.header === 'function' 
                ? column.header({} as any) 
                : (
                  <Text fontWeight="semibold">
                    {column.header as React.ReactNode}
                  </Text>
                )
              }
            </Flex>
          </Th>
        ))}
      </Tr>
    </Thead>
  );
} 