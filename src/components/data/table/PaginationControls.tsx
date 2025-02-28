import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function PaginationControls({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: PaginationControlsProps) {
  const pageSizeOptions = [10, 20, 50, 100];

  // Only calculate these values if we have data
  const startItem = totalItems > 0 ? (currentPage * pageSize) - (pageSize - 1) : 0;
  const endItem = totalItems > 0 ? Math.min(currentPage * pageSize, totalItems) : 0;
  
  // Log pagination props for debugging
  useEffect(() => {
    console.log('PaginationControls props:', { 
      currentPage, 
      totalPages, 
      pageSize, 
      totalItems,
      startItem,
      endItem
    });
  }, [currentPage, totalPages, pageSize, totalItems, startItem, endItem]);
  
  // Always render the controls, even with no data, just make them disabled
  // This helps ensure they're visible in the UI for debugging
  return (
    <div className="pagination-controls">
      <div className="pagination-info">
        {totalItems > 0 ? (
          `Showing ${startItem} to ${endItem} of ${totalItems} ${totalItems === 1 ? 'item' : 'items'}`
        ) : (
          'No items to display'
        )}
      </div>
      
      <div className="flex items-center gap-4">
        <select
          className="pagination-size-select mr-2"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          disabled={totalItems === 0}
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size} per page
            </option>
          ))}
        </select>

        <div className="pagination-actions">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1 || totalPages === 0}
            className="pagination-page-button"
          >
            <span className="sr-only">First page</span>
            <ChevronsLeft className="h-4 w-4" />
          </button>

          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || totalPages === 0}
            className="pagination-page-button"
          >
            <span className="sr-only">Previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </button>

          <span className="text-sm text-text-primary px-2">
            {totalPages > 0 ? `${currentPage} / ${totalPages}` : '0 / 0'}
          </span>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="pagination-page-button"
          >
            <span className="sr-only">Next page</span>
            <ChevronRight className="h-4 w-4" />
          </button>

          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="pagination-page-button"
          >
            <span className="sr-only">Last page</span>
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
} 