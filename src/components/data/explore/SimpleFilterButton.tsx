import React from 'react';
import { IconButton, Tooltip, Box, useColorModeValue } from '@chakra-ui/react';
import { Filter } from 'lucide-react';

interface FilterItem {
  field: string;
  operator: string;
  value?: any;
  conjunction?: 'and' | 'or';
}

interface SimpleFilterButtonProps {
  onClick: () => void;
  filters?: FilterItem[];
}

export function SimpleFilterButton({ 
  onClick, 
  filters = [] 
}: SimpleFilterButtonProps) {
  // Check if there are any active filters
  const hasActiveFilters = filters.some(f => f.value !== undefined && f.value !== '');
  const dotColor = useColorModeValue('purple.500', 'purple.400');
  const dotBorderColor = useColorModeValue('white', 'gray.800');

  return (
    <Tooltip label="Filter data">
      <Box position="relative">
        <IconButton
          aria-label="Filter data"
          icon={<Filter size={18} />}
          onClick={onClick}
          variant="ghost"
          colorScheme={hasActiveFilters ? "purple" : "gray"}
          size="sm"
        />
        
        {hasActiveFilters && (
          <Box 
            position="absolute" 
            top="-1px" 
            right="-1px" 
            width="8px" 
            height="8px" 
            borderRadius="full" 
            bg={dotColor}
            borderWidth="1px"
            borderColor={dotBorderColor}
          />
        )}
      </Box>
    </Tooltip>
  );
} 