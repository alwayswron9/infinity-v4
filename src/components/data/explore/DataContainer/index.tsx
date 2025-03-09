import React, { useState, useMemo } from 'react';
import { 
  Box, 
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react';
import type { ModelView as ModelViewType } from '@/types/viewDefinition';
import { DataHeader } from './DataHeader';
import { DataTable } from './DataTable';
import { DataFooter } from './DataFooter';
import { DataDrawers } from './DataDrawers';
import { EmptyStateView } from './EmptyStateView';
import { useColumnVisibility } from './hooks/useColumnVisibility';
import { DataContainerProps } from './types';

export function DataContainer({
  currentView,
  data,
  columns,
  pagination,
  isLoadingData,
  isInitialLoad,
  hasUnsavedChanges,
  availableColumns,
  views,
  activeViewId,
  modelName,
  onPaginationChange,
  onConfigChange,
  onSave,
  onEditRow,
  onDeleteRow,
  onCreateView,
  onViewSelect,
  onDeleteView,
  onAddData,
  onCopyModelDetails,
  onClearData,
  onViewNameEdit,
  onRefreshData,
  copyingDetails = false,
  editedName,
  isEditingName,
  setEditingName,
  setEditedName
}: DataContainerProps) {
  // Move all hooks to the top level to fix the hooks order error
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Drawer disclosures
  const { isOpen: isFilterDrawerOpen, onOpen: onOpenFilterDrawer, onClose: onCloseFilterDrawer } = useDisclosure();
  const { isOpen: isClearDataDialogOpen, onOpen: onOpenClearDataDialog, onClose: onCloseClearDataDialog } = useDisclosure();
  
  // Local state if external state not provided
  const [localEditedName, setLocalEditedName] = useState<string>(currentView?.name || 'New View');
  const [localIsEditing, setLocalIsEditing] = useState<boolean>(false);
  
  // Use either provided props or local state
  const viewName = editedName || localEditedName;
  const editing = isEditingName !== undefined ? isEditingName : localIsEditing;
  const setEditing = setEditingName || setLocalIsEditing;
  
  // Use the column visibility hook
  const { 
    allAvailableColumns, 
    visibleColumns, 
    handleColumnToggle,
    handleColumnRatioChange
  } = useColumnVisibility({
    currentView,
    columns,
    onConfigChange
  });

  console.log("DataContainer: handleColumnToggle is a function:", typeof handleColumnToggle === 'function');
  console.log("DataContainer: allAvailableColumns:", allAvailableColumns);

  // Get current filters from view config
  const currentFilters = useMemo(() => {
    if (!currentView || !currentView.config || !currentView.config.filters) return [];
    return currentView.config.filters;
  }, [currentView]);

  return (
    <Box 
      height="100%"
      minHeight="400px"
      display="flex"
      flexDirection="column"
      width="100%"
    >
      {currentView ? (
        <>
          <DataHeader 
            currentView={currentView}
            hasUnsavedChanges={hasUnsavedChanges}
            activeViewId={activeViewId}
            views={views}
            onSave={onSave}
            onCreateView={onCreateView}
            onViewSelect={onViewSelect}
            onDeleteView={onDeleteView}
            onCopyModelDetails={onCopyModelDetails}
            copyingDetails={copyingDetails}
            viewName={viewName}
            editing={editing}
            setEditing={setEditing}
            onViewNameEdit={onViewNameEdit}
            onOpenFilterDrawer={onOpenFilterDrawer}
            allAvailableColumns={allAvailableColumns}
            handleColumnToggle={handleColumnToggle}
            currentFilters={currentFilters}
            onOpenClearDataDialog={onOpenClearDataDialog}
            onRefreshData={onRefreshData}
            isLoadingData={isLoadingData}
          />
          
          <Box flex="1" overflow="hidden" position="relative">
            <DataTable 
              data={data} 
              visibleColumns={visibleColumns} 
              currentView={currentView}
              isLoadingData={isLoadingData}
              onEditRow={onEditRow}
              onDeleteRow={onDeleteRow}
              onColumnRatioChange={handleColumnRatioChange}
            />
          </Box>
          
          {/* Data Footer with Pagination */}
          {pagination && (
            <DataFooter 
              pagination={pagination} 
              onPaginationChange={onPaginationChange}
              isLoadingData={isLoadingData}
            />
          )}
          
          <DataDrawers 
            currentView={currentView}
            isFilterDrawerOpen={isFilterDrawerOpen}
            onCloseFilterDrawer={onCloseFilterDrawer}
            isClearDataDialogOpen={isClearDataDialogOpen}
            onCloseClearDataDialog={onCloseClearDataDialog}
            onClearData={onClearData}
            onConfigChange={onConfigChange}
            onRefreshData={onRefreshData}
          />
        </>
      ) : (
        <EmptyStateView onCreateView={onCreateView} />
      )}
    </Box>
  );
} 