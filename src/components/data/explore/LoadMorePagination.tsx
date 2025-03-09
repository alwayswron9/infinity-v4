import React, { useState } from 'react';
import {
  Flex,
  Text,
  Button,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useColorModeValue,
  HStack,
  Box,
  Badge
} from '@chakra-ui/react';
import { ChevronDown, Loader } from 'lucide-react';

interface LoadMorePaginationProps {
  pagination: {
    pageIndex: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
  onPaginationChange: (pageIndex: number, pageSize: number) => void;
  isLoading?: boolean;
}

export function LoadMorePagination({
  pagination,
  onPaginationChange,
  isLoading = false
}: LoadMorePaginationProps) {
  const { pageIndex, pageSize, pageCount, total } = pagination;
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.500', 'gray.400');
  const accentColor = useColorModeValue('brand.500', 'brand.300');
  
  // State for the load more input
  const [loadMoreCount, setLoadMoreCount] = useState<number>(20);
  
  // Calculate the range of items being displayed
  const firstItem = total > 0 ? 1 : 0;
  const currentlyShowing = Math.min((pageIndex + 1) * pageSize, total);
  const hasMoreItems = currentlyShowing < total;
  const remainingItems = total - currentlyShowing;

  // Handle load more
  const handleLoadMore = () => {
    const newPageSize = Math.min(pageSize + loadMoreCount, 100);
    onPaginationChange(0, newPageSize); // Keep at first page but increase page size
  };

  return (
    <Flex 
      justify="space-between" 
      align="center" 
      py={3} 
      px={4} 
      borderTopWidth="1px" 
      borderColor={borderColor}
      bg={bgColor}
    >
      <Flex align="center" gap={2}>
        <Text fontSize="sm" color={textColor} fontWeight="medium">
          {total > 0 ? `Showing ${firstItem}-${currentlyShowing} of ${total}` : 'No items'}
        </Text>
        {hasMoreItems && !isLoading && (
          <Badge colorScheme="brand" variant="subtle" fontSize="xs">
            {remainingItems} more
          </Badge>
        )}
      </Flex>

      {hasMoreItems && (
        <HStack spacing={3}>
          <Text fontSize="sm" color={textColor} fontWeight="medium">Load</Text>
          <NumberInput 
            size="sm"
            maxW={20}
            min={1}
            max={100 - pageSize > 0 ? 100 - pageSize : 1}
            value={loadMoreCount}
            onChange={(_, value) => setLoadMoreCount(value)}
            defaultValue={20}
            isDisabled={isLoading}
          >
            <NumberInputField borderColor={borderColor} />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <Button 
            size="sm" 
            rightIcon={isLoading ? <Loader size={14} className="animate-spin" /> : <ChevronDown size={14} />}
            onClick={handleLoadMore}
            colorScheme="brand"
            isDisabled={pageSize >= 100 || isLoading}
            isLoading={isLoading}
            loadingText="Loading"
            variant="solid"
            px={4}
          >
            {isLoading ? "Loading..." : "Load More"}
          </Button>
        </HStack>
      )}
    </Flex>
  );
} 