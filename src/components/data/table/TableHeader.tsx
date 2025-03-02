import React from 'react';
import {
  Thead,
  Tr,
  Th,
  useColorModeValue
} from '@chakra-ui/react';
import type { ColumnDef } from '@tanstack/react-table';

interface TableHeaderProps {
  columns: ColumnDef<Record<string, any>, any>[];
}

export function TableHeader({ columns }: TableHeaderProps) {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const tableHeaderColor = useColorModeValue('gray.50', 'gray.700');

  return (
    <Thead bg={tableHeaderColor} position="sticky" top={0} zIndex={1}>
      <Tr>
        {columns.map((column, idx) => (
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
            maxW={column.size ? `${column.size}px` : undefined}
            title={typeof column.header === 'string' ? column.header : undefined}
          >
            {typeof column.header === 'function' 
              ? column.header({} as any) 
              : column.header as React.ReactNode}
          </Th>
        ))}
      </Tr>
    </Thead>
  );
} 