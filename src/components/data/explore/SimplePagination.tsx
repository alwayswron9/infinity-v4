import React from 'react';
import {
  Flex,
  Text,
  Select,
  HStack,
  IconButton,
  ButtonGroup,
  useColorModeValue,
  Box,
  Tooltip
} from '@chakra-ui/react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  pagination: {
    pageIndex: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
  pageSizeOptions: number[];
  onPaginationChange: (pageIndex: number, pageSize: number) => void;
}

export function SimplePagination({
  pagination,
  pageSizeOptions,
  onPaginationChange,
}: PaginationProps) {
  const { pageIndex, pageSize, pageCount, total } = pagination;
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.500', 'gray.400');
  
  // Calculate the range of items being displayed
  const firstItem = total > 0 ? pageIndex * pageSize + 1 : 0;
  const lastItem = Math.min((pageIndex + 1) * pageSize, total);

  // Handle page size change
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = parseInt(e.target.value, 10);
    onPaginationChange(0, newPageSize); // Reset to first page when changing page size
  };

  // Navigation handlers
  const goToFirstPage = () => onPaginationChange(0, pageSize);
  const goToPrevPage = () => onPaginationChange(Math.max(0, pageIndex - 1), pageSize);
  const goToNextPage = () => onPaginationChange(Math.min(pageCount - 1, pageIndex + 1), pageSize);
  const goToLastPage = () => onPaginationChange(Math.max(0, pageCount - 1), pageSize);

  return (
    <Flex 
      justify="space-between" 
      align="center" 
      py={2} 
      px={4} 
      borderTopWidth="1px" 
      borderColor={borderColor}
      bg={bgColor}
    >
      <Flex align="center" gap={2}>
        <Text fontSize="xs" color={textColor}>
          Rows per page:
        </Text>
        <Select 
          size="xs" 
          value={pageSize} 
          onChange={handlePageSizeChange}
          width="65px"
          borderRadius="md"
        >
          {pageSizeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </Flex>

      <HStack spacing={4}>
        <Text fontSize="xs" color={textColor}>
          {total > 0 ? `${firstItem}-${lastItem} of ${total}` : 'No items'}
        </Text>
        
        <ButtonGroup size="xs" variant="ghost" spacing={1}>
          <Tooltip label="First page">
            <IconButton
              aria-label="First Page"
              icon={<ChevronsLeft size={14} />}
              onClick={goToFirstPage}
              isDisabled={pageIndex === 0 || total === 0}
              colorScheme="gray"
            />
          </Tooltip>
          <Tooltip label="Previous page">
            <IconButton
              aria-label="Previous Page"
              icon={<ChevronLeft size={14} />}
              onClick={goToPrevPage}
              isDisabled={pageIndex === 0 || total === 0}
              colorScheme="gray"
            />
          </Tooltip>
          <Tooltip label="Next page">
            <IconButton
              aria-label="Next Page"
              icon={<ChevronRight size={14} />}
              onClick={goToNextPage}
              isDisabled={pageIndex >= pageCount - 1 || total === 0}
              colorScheme="gray"
            />
          </Tooltip>
          <Tooltip label="Last page">
            <IconButton
              aria-label="Last Page"
              icon={<ChevronsRight size={14} />}
              onClick={goToLastPage}
              isDisabled={pageIndex >= pageCount - 1 || total === 0}
              colorScheme="gray"
            />
          </Tooltip>
        </ButtonGroup>
      </HStack>
    </Flex>
  );
} 