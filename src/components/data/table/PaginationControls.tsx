import React from 'react';
import { cn } from '@/lib/utils';

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

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">
          Showing {startItem}-{endItem} of {totalItems} items
        </span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className={cn(
            "h-8 rounded-md border px-2 text-sm",
            "focus:outline-none focus:ring-1 focus:ring-blue-500"
          )}
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size} per page
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={cn(
            "h-8 w-8 rounded-md border flex items-center justify-center",
            "focus:outline-none focus:ring-1 focus:ring-blue-500",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <span className="sr-only">First page</span>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            "h-8 w-8 rounded-md border flex items-center justify-center",
            "focus:outline-none focus:ring-1 focus:ring-blue-500",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <span className="sr-only">Previous page</span>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            "h-8 w-8 rounded-md border flex items-center justify-center",
            "focus:outline-none focus:ring-1 focus:ring-blue-500",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <span className="sr-only">Next page</span>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={cn(
            "h-8 w-8 rounded-md border flex items-center justify-center",
            "focus:outline-none focus:ring-1 focus:ring-blue-500",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <span className="sr-only">Last page</span>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
} 