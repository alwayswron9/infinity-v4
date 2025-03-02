import React, { useState, useMemo } from 'react';
import { 
  Box, 
  useColorModeValue, 
  VStack,
  Center,
  Text,
  Button,
  Flex,
  HStack,
  Menu,
  MenuButton,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react';
import type { ModelView as ModelViewType } from '@/types/viewDefinition';
import type { ColumnDef } from '@tanstack/react-table';
import { LayoutDashboard, Trash } from 'lucide-react';
import { ConfirmDialog } from '@saas-ui/react';

// Import the components we're keeping
import { EnhancedDataTable } from '@/components/data/table/EnhancedDataTable';
import { SimplePagination } from './SimplePagination';
import { SimpleFilterButton } from './SimpleFilterButton';
import { SimpleColumnSelector } from './SimpleColumnSelector';
import { ViewSelector } from '../table/ViewSelector';
import { EditableHeading } from './EditableHeading';
import { FilterDrawer } from './FilterDrawer';

interface DataContainerProps {
  currentView: ModelViewType | null;
  data: any[];
  columns: ColumnDef<Record<string, any>>[];
  pagination: { pageIndex: number; pageSize: number; pageCount: number; total: number } | null;
  isLoadingData: boolean;
  isInitialLoad: boolean;
  hasUnsavedChanges: boolean;
  availableColumns: string[];
  views: ModelViewType[];
  activeViewId: string | null;
  modelName: string;
  onPaginationChange: (pageIndex: number, pageSize: number) => void;
  onConfigChange: (config: any) => void;
  onSave: () => void;
  onEditRow: (row: Record<string, any>) => void;
  onDeleteRow: (row: Record<string, any>) => void;
  onCreateView: () => void;
  onViewSelect: (viewId: string) => void;
  onDeleteView: (viewId: string) => Promise<void>;
  onAddData: () => void;
  onCopyModelDetails: () => void;
  onClearData: () => void;
  onViewNameEdit?: (newName: string) => void;
  copyingDetails?: boolean;
  editedName?: string;
  isEditingName?: boolean;
  setEditingName?: (isEditing: boolean) => void;
  setEditedName?: (name: string) => void;
}

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
  copyingDetails = false,
  editedName,
  isEditingName,
  setEditingName,
  setEditedName
}: DataContainerProps) {
  // Move all hooks to the top level to fix the hooks order error
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headerBgColor = useColorModeValue('gray.50', 'gray.800');
  // Extract inline useColorModeValue hooks to fix the hook order issue
  const viewBgColor = useColorModeValue("gray.100", "gray.700");
  const iconColor = useColorModeValue("gray.500", "gray.300");

  // Local state if external state not provided
  const [localEditedName, setLocalEditedName] = useState<string>(currentView?.name || 'New View');
  const [localIsEditing, setLocalIsEditing] = useState<boolean>(false);
  
  // Drawer disclosures
  const { isOpen: isFilterDrawerOpen, onOpen: onOpenFilterDrawer, onClose: onCloseFilterDrawer } = useDisclosure();
  const { isOpen: isClearDataDialogOpen, onOpen: onOpenClearDataDialog, onClose: onCloseClearDataDialog } = useDisclosure();
  
  // Use either provided props or local state
  const viewName = editedName || localEditedName;
  const editing = isEditingName !== undefined ? isEditingName : localIsEditing;
  const setEditing = setEditingName || setLocalIsEditing;
  const setName = setEditedName || setLocalEditedName;
  
  const pageSizeOptions = [10, 20, 50, 100];
  
  // Handle view name edit
  const handleViewNameEdit = () => {
    // Don't automatically reset editing state here
    // Let the parent component control the editing state
    if (onViewNameEdit && currentView) {
      onViewNameEdit(viewName);
    }
  };
  
  // Get all available columns including those that might be hidden
  const allAvailableColumns = useMemo(() => {
    if (!currentView || !currentView.config || !currentView.config.columns) return [];
    
    // Make sure labels are formatted nicely
    return currentView.config.columns.map(col => ({
      key: col.field,
      label: col.field.replace(/^_/, '').replace(/_/g, ' ').split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' '),
      visible: col.visible
    }));
  }, [currentView]);

  // Handle column visibility toggle
  const handleColumnToggle = (columnKey: string, isVisible: boolean) => {
    if (!currentView || !currentView.config) return;

    console.log(`DataContainer handling column toggle: ${columnKey} -> ${isVisible}`);

    // Get current columns config
    const currentColumns = [...currentView.config.columns];
    
    // Find and update the column's visibility
    const updatedColumns = currentColumns.map(col => {
      if (col.field === columnKey) {
        return { ...col, visible: isVisible };
      }
      return col;
    });

    // Create a new config object (to ensure reactivity)
    const newConfig = {
      ...currentView.config,
      columns: updatedColumns,
      // Add a timestamp to force detection of changes
      lastUpdated: new Date().toISOString()
    };

    console.log("Updated columns config:", newConfig);

    // Notify parent component of the change
    onConfigChange(newConfig);
  };

  // Get current filters from view config
  const currentFilters = useMemo(() => {
    if (!currentView || !currentView.config || !currentView.config.filters) return [];
    return currentView.config.filters;
  }, [currentView]);

  // Get visible columns based on the current view configuration
  const visibleColumns = useMemo(() => {
    if (!currentView || !currentView.config || !currentView.config.columns) return columns;
    
    // Create a Set for faster lookups
    const visibleColumnKeys = new Set(
      currentView.config.columns
        .filter(col => col.visible)
        .map(col => col.field)
    );
      
    console.log("Visible column keys:", Array.from(visibleColumnKeys));
      
    // Return only visible columns
    return columns.filter(col => {
      // Handle different column definition types safely
      const columnId = String(col.id || (col as any).accessorKey);
      const isVisible = visibleColumnKeys.has(columnId);
      console.log(`Column ${columnId} visibility: ${isVisible}`);
      return isVisible;
    });
  }, [currentView, columns]);

  // Add debug log for hasUnsavedChanges
  React.useEffect(() => {
    console.log(`[DataContainer] hasUnsavedChanges: ${hasUnsavedChanges}`, { 
      isEditing: editing, 
      viewName: viewName,
      currentView: currentView?.id
    });
  }, [hasUnsavedChanges, editing, viewName, currentView]);

  return (
    <Box 
      height="100%"
      minHeight="400px" /* Add minimum height to ensure loading state is visible */
      display="flex"
      flexDirection="column"
      borderWidth="1px" 
      borderColor={borderColor} 
      borderRadius="md" 
      bg={bgColor}
      overflow="hidden"
      width="100%"
    >
      {currentView ? (
        <>
          {/* Consolidated header with all controls - Improved styling */}
          <Box borderBottomWidth="1px" borderColor={borderColor}>
            <Flex 
              py={2} 
              px={4} 
              alignItems="center"
              bg={headerBgColor}
              justifyContent="space-between"
            >
              {/* Left side: View name with improved styling */}
              <Flex align="center">
                <HStack 
                  spacing={2} 
                  p={2} 
                  bg={viewBgColor} 
                  borderRadius="md"
                  minW="180px"
                  maxW="300px"
                  w="auto"
                  onClick={() => !editing && setEditing(true)}
                  cursor="pointer"
                  height="32px"
                  alignItems="center"
                  borderWidth="1px"
                  borderColor="gray.700"
                  _hover={{ borderColor: "gray.600" }}
                >
                  <LayoutDashboard size={16} color={iconColor} />
                  <Box flex="1" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                    <EditableHeading
                      value={viewName}
                      onChange={setName}
                      isEditing={editing}
                      onEditStart={() => setEditing(true)}
                      onEditEnd={handleViewNameEdit}
                    />
                  </Box>
                </HStack>
              </Flex>
              
              {/* Right side: Controls with improved spacing and alignment */}
              <HStack spacing={2}>
                <SimpleFilterButton 
                  onClick={onOpenFilterDrawer} 
                  filters={currentFilters}
                />
                
                <SimpleColumnSelector
                  columns={allAvailableColumns}
                  onColumnToggle={handleColumnToggle}
                  key={`column-selector-${currentView?.id}-${allAvailableColumns.length}`}
                />
                
                <Tooltip label="Copy model details">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={onCopyModelDetails}
                    isLoading={copyingDetails}
                  >
                    Copy Details
                  </Button>
                </Tooltip>
                
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={onOpenClearDataDialog}
                >
                  Clear Data
                </Button>
                
                {hasUnsavedChanges && (
                  <Button 
                    size="sm" 
                    colorScheme="blue" 
                    onClick={onSave}
                    fontWeight="medium"
                    leftIcon={<Box as="span" className="lucide-save" width="1em" height="1em" />}
                  >
                    Save View
                  </Button>
                )}
                
                <ViewSelector
                  views={views}
                  activeViewId={activeViewId}
                  onViewSelect={onViewSelect}
                  onCreateView={onCreateView}
                  onDeleteView={onDeleteView}
                />
              </HStack>
            </Flex>
          </Box>
          
          {/* Table with data */}
          <Box flex="1" overflow="hidden" position="relative" width="100%">
            <EnhancedDataTable
              data={data}
              columns={visibleColumns}
              isLoading={isLoadingData}
              onRowClick={onEditRow}
              onDeleteRow={onDeleteRow}
              emptyStateMessage="No data available. Add data to start exploring."
              key={`table-${currentView?.id}-${visibleColumns.length}`}
            />
          </Box>
          
          {/* Pagination control */}
          {pagination && (
            <SimplePagination
              pagination={pagination}
              pageSizeOptions={pageSizeOptions}
              onPaginationChange={onPaginationChange}
            />
          )}
          
          {/* Filter Drawer */}
          {currentView && (
            <FilterDrawer
              isOpen={isFilterDrawerOpen}
              onClose={onCloseFilterDrawer}
              currentView={currentView}
              onConfigChange={onConfigChange}
            />
          )}
          
          {/* Clear Data Confirmation Dialog */}
          <ConfirmDialog
            isOpen={isClearDataDialogOpen}
            onClose={onCloseClearDataDialog}
            title="Clear all data"
            confirmProps={{ colorScheme: 'red' }}
            onConfirm={() => {
              onClearData();
              onCloseClearDataDialog();
            }}
          >
            Are you sure you want to clear all data? This action cannot be undone.
          </ConfirmDialog>
        </>
      ) : (
        <Center height="100%" p={8}>
          <VStack spacing={4}>
            <Text>No active view. Create a view to start exploring data.</Text>
            <Button colorScheme="purple" onClick={onCreateView}>
              Create View
            </Button>
          </VStack>
        </Center>
      )}
    </Box>
  );
} 