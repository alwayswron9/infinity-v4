import React from 'react';
import { ConfirmDialog } from '@saas-ui/react';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  cancelRef?: React.RefObject<HTMLButtonElement | null>;
}

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm
}: DeleteConfirmationDialogProps) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Record"
      confirmProps={{ colorScheme: 'red' }}
      onConfirm={onConfirm}
    >
      Are you sure you want to delete this record? This action cannot be undone.
    </ConfirmDialog>
  );
} 