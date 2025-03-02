import React from 'react';
import { HStack, IconButton } from '@chakra-ui/react';
import { Eye, Trash } from 'lucide-react';

interface ActionButtonsProps {
  row: Record<string, any>;
  onView?: (row: Record<string, any>) => void;
  onDelete?: (row: Record<string, any>) => void;
}

export function ActionButtons({ row, onView, onDelete }: ActionButtonsProps) {
  return (
    <HStack spacing={2} justifyContent="center">
      {onView && (
        <IconButton
          icon={<Eye size={16} />}
          aria-label="View"
          size="xs"
          colorScheme="blue"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onView(row);
          }}
        />
      )}
      {onDelete && (
        <IconButton
          icon={<Trash size={16} />}
          aria-label="Delete"
          size="xs"
          colorScheme="red"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(row);
          }}
        />
      )}
    </HStack>
  );
} 