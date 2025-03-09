import React from 'react';
import { HStack, IconButton } from '@chakra-ui/react';
import { Eye, Trash } from 'lucide-react';

interface ActionButtonsProps {
  row: Record<string, any>;
  onView?: (row: Record<string, any>) => void;
  onDelete?: (row: Record<string, any>) => void;
}

export function ActionButtons({ row, onView, onDelete }: ActionButtonsProps) {
  // Handle click events with stopPropagation to prevent row click
  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onView) {
      onView(row);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(row);
    }
  };

  return (
    <HStack spacing={2} justifyContent="center" onClick={(e) => e.stopPropagation()}>
      {onView && (
        <IconButton
          icon={<Eye size={16} />}
          aria-label="View"
          size="xs"
          colorScheme="brand"
          variant="ghost"
          onClick={handleViewClick}
        />
      )}
      {onDelete && (
        <IconButton
          icon={<Trash size={16} />}
          aria-label="Delete"
          size="xs"
          colorScheme="red"
          variant="ghost"
          onClick={handleDeleteClick}
        />
      )}
    </HStack>
  );
} 