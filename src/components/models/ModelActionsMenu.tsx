import { MoreVertical, PencilIcon, ArchiveIcon, TrashIcon, DatabaseIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'sonner';
import { useState } from 'react';
import { ConfirmDialog } from '@saas-ui/react';

interface ModelActionsMenuProps {
  modelId: string;
  modelName: string;
  isArchived?: boolean;
  onArchiveToggle: () => void;
  onDelete: () => void;
  onClearData?: () => void;
}

export function ModelActionsMenu({
  modelId,
  modelName,
  isArchived = false,
  onArchiveToggle,
  onDelete,
  onClearData,
}: ModelActionsMenuProps) {
  // State for confirmation dialogs
  const [isClearDataDialogOpen, setIsClearDataDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "inline-flex items-center justify-center rounded-md text-sm",
              "transition-colors focus-visible:outline-none focus-visible:ring-1",
              "focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
              "hover:bg-accent hover:text-accent-foreground",
              "h-8 w-8"
            )}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/models/${modelId}`} className="flex items-center">
              <PencilIcon className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onArchiveToggle}
            className={isArchived ? "text-success" : "text-warning"}
          >
            <ArchiveIcon className={cn(
              "mr-2 h-4 w-4",
              isArchived && "rotate-180"
            )} />
            <span>{isArchived ? 'Restore' : 'Archive'}</span>
          </DropdownMenuItem>
          {onClearData && !isArchived && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setIsClearDataDialogOpen(true)}
                className="text-warning focus:text-warning"
              >
                <DatabaseIcon className="mr-2 h-4 w-4" />
                <span>Clear Data</span>
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <TrashIcon className="mr-2 h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clear Data Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isClearDataDialogOpen}
        onClose={() => setIsClearDataDialogOpen(false)}
        title={`Clear all data for ${modelName}`}
        confirmProps={{ colorScheme: 'red' }}
        onConfirm={() => {
          if (onClearData) {
            onClearData();
          }
          setIsClearDataDialogOpen(false);
        }}
      >
        Are you sure you want to clear all data for {modelName}? This action cannot be undone.
      </ConfirmDialog>

      {/* Delete Model Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title={`Delete ${modelName}`}
        confirmProps={{ colorScheme: 'red' }}
        onConfirm={() => {
          onDelete();
          setIsDeleteDialogOpen(false);
        }}
      >
        Are you sure you want to delete {modelName}? This action cannot be undone.
      </ConfirmDialog>
    </>
  );
} 