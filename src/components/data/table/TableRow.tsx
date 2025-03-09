import React from 'react';
import {
  Tr,
  Td,
  Text,
  useColorModeValue,
  Flex
} from '@chakra-ui/react';
import type { ColumnDef, CellContext } from '@tanstack/react-table';

interface TableRowProps {
  row: Record<string, any>;
  columns: ColumnDef<Record<string, any>, any>[];
  rowIndex: number;
  onRowClick?: (row: Record<string, any>) => void;
}

// Define custom meta type for columns
interface CustomColumnMeta {
  isAction?: boolean;
  [key: string]: any;
}

export function TableRow({ row, columns, rowIndex, onRowClick }: TableRowProps) {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const tableBackgroundColor = useColorModeValue('white', 'gray.800');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const secondaryTextColor = useColorModeValue('gray.500', 'gray.400');

  // Handle row click
  const handleRowClick = () => {
    if (onRowClick) {
      onRowClick(row);
    }
  };

  return (
    <Tr 
      key={rowIndex}
      bg={tableBackgroundColor}
      _hover={{
        bg: hoverBgColor,
        cursor: onRowClick ? 'pointer' : 'default'
      }}
      transition="background-color 0.2s"
      onClick={handleRowClick}
      borderBottomWidth="1px"
      borderColor={borderColor}
      _last={{
        borderBottomWidth: "0"
      }}
      _even={{
        bg: useColorModeValue('gray.50', 'gray.750')
      }}
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
          cellContent = <Text color={secondaryTextColor}>-</Text>;
        } else if (typeof value === 'object') {
          const stringValue = JSON.stringify(value);
          cellContent = stringValue;
          cellTitle = stringValue;
        } else {
          cellContent = String(value);
          cellTitle = String(value);
        }
        
        // Check if this is an action column
        const isActionColumn = (column.meta as CustomColumnMeta)?.isAction;
        
        return (
          <Td 
            key={colIdx}
            p="16px"
            py="14px"
            borderBottomWidth="0"
            fontSize="sm"
            color={textColor}
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            width={column.size ? `${column.size}px` : undefined}
            maxW={column.size ? `${column.size}px` : undefined}
            title={typeof cellContent === 'string' ? cellContent : cellTitle}
            isTruncated
            onClick={isActionColumn ? (e) => e.stopPropagation() : undefined}
            _first={{ pl: "20px" }}
            _last={{ pr: "20px" }}
          >
            {typeof cellContent === 'string' ? (
              <Text fontWeight="normal">{cellContent}</Text>
            ) : (
              cellContent
            )}
          </Td>
        );
      })}
    </Tr>
  );
} 