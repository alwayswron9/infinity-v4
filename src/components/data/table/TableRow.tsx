import React from 'react';
import {
  Tr,
  Td,
  Text,
  useColorModeValue
} from '@chakra-ui/react';
import type { ColumnDef, CellContext } from '@tanstack/react-table';

interface TableRowProps {
  row: Record<string, any>;
  columns: ColumnDef<Record<string, any>, any>[];
  rowIndex: number;
}

export function TableRow({ row, columns, rowIndex }: TableRowProps) {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const tableBackgroundColor = useColorModeValue('white', 'gray.800');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');

  return (
    <Tr 
      key={rowIndex}
      bg={tableBackgroundColor}
      _hover={{
        bg: hoverBgColor,
      }}
      transition="background-color 0.2s"
    >
      {columns.map((column, colIdx) => {
        // Get the value using the column id
        let value = null;
        
        if (column.id) {
          value = row[column.id];
        } else if ('accessorKey' in column) {
          value = row[(column as any).accessorKey];
        }
        
        // Format the cell content
        let cellContent;
        let cellTitle = '';
        
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
          const stringValue = JSON.stringify(value);
          cellContent = stringValue;
          cellTitle = stringValue;
        } else {
          cellContent = String(value);
          cellTitle = String(value);
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
            maxW={column.size ? `${column.size}px` : undefined}
            title={typeof cellContent === 'string' ? cellContent : cellTitle}
            isTruncated
          >
            {cellContent}
          </Td>
        );
      })}
    </Tr>
  );
} 