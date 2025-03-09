import React from 'react';
import { LoadMorePagination } from '../LoadMorePagination';
import { DataFooterProps } from './types';

export function DataFooter({ 
  pagination, 
  onPaginationChange,
  isLoadingData = false
}: DataFooterProps) {
  if (!pagination) return null;
  
  return (
    <LoadMorePagination
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      isLoading={isLoadingData}
    />
  );
} 