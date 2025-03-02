import React from 'react';
import { SimplePagination } from '../SimplePagination';
import { DataFooterProps } from './types';

export function DataFooter({ 
  pagination, 
  pageSizeOptions, 
  onPaginationChange 
}: DataFooterProps) {
  if (!pagination) return null;
  
  return (
    <SimplePagination
      pagination={pagination}
      pageSizeOptions={pageSizeOptions}
      onPaginationChange={onPaginationChange}
    />
  );
} 