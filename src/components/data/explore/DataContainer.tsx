import React, { useState } from 'react';
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
  MenuList,
  MenuItem,
  useDisclosure
} from '@chakra-ui/react';
import type { ModelView as ModelViewType } from '@/types/viewDefinition';
import type { ColumnDef } from '@tanstack/react-table';
import { ChevronDown, LayoutDashboard } from 'lucide-react';

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
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const pageSizeOptions = [10, 20, 50, 100];
  
  // Local state if external state not provided
  const [localEditedName, setLocalEditedName] = useState<string>(currentView?.name || 'New View');
  const [localIsEditing, setLocalIsEditing] = useState<boolean>(false);
  
  // Use either provided props or local state
  const viewName = editedName || localEditedName;
  const editing = isEditingName !== undefined ? isEditingName : localIsEditing;
  const setEditing = setEditingName || setLocalIsEditing;
  const setName = setEditedName || setLocalEditedName;
  
  // Filter drawer state
  const { isOpen: isFilterDrawerOpen, onOpen: onOpenFilterDrawer, onClose: onCloseFilterDrawer } = useDisclosure();
  
  // Handle view name edit
  const handleViewNameEdit = () => {
    setEditing(false);
    if (onViewNameEdit && currentView) {
      onViewNameEdit(viewName);
    }
  };
  
  // Get all available columns including those that might be hidden
  const getAllAvailableColumns = (): { key: string, label: string, visible: boolean }[] => {
    if (!currentView || !currentView.config || !currentView.config.columns) return [];
    
    return currentView.config.columns.map(col => ({
      key: col.field,
      label: col.field,
      visible: col.visible
    }));
  };

  // Handle column visibility toggle
  const handleColumnToggle = (columnKey: string, isVisible: boolean) => {
    if (!currentView || !currentView.config) return;

    // Get current columns config
    const currentColumns = [...currentView.config.columns];
    
    // Find and update the column's visibility
    const updatedColumns = currentColumns.map(col => {
      if (col.field === columnKey) {
        return { ...col, visible: isVisible };
      }
      return col;
    });

    // Notify parent component of the change
    onConfigChange({
      ...currentView.config,
      columns: updatedColumns
    });
  };

  // Get current filters from view config
  const getCurrentFilters = () => {
    if (!currentView || !currentView.config || !currentView.config.filters) return [];
    return currentView.config.filters;
  };

  return (
    <Box 
      height="100%"
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
          {/* Consolidated header with view configuration */}
          <Box borderBottomWidth="1px" borderColor={borderColor}>
            {/* Primary header row with view name, selection and actions */}
            <Flex 
              py={3} 
              px={4} 
              borderBottomWidth="1px" 
              borderColor={borderColor}
              alignItems="center"
              justifyContent="space-between"
              bg={useColorModeValue('gray.50', 'gray.800')}
            >
              <HStack spacing={4}>
                <HStack spacing={2} p={2} bg="gray.700" borderRadius="md">
                  <LayoutDashboard size={16} color="gray.300" />
                  <EditableHeading
                    value={viewName}
                    onChange={setName}
                    isEditing={editing}
                    onEditStart={() => setEditing(true)}
                    onEditEnd={handleViewNameEdit}
                  />
                </HStack>
                <Text fontWeight="medium" color="gray.500">{modelName}</Text>
              </HStack>
              
              <HStack spacing={3}>
                {hasUnsavedChanges && (
                  <Button 
                    size="sm" 
                    colorScheme="blue" 
                    onClick={onSave}
                  >
                    Save Changes
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

            {/* Secondary header row - Configuration tools and actions */}
            <Flex
              py={2}
              px={4}
              alignItems="center"
              justifyContent="space-between"
            >
              <Text fontSize="xs" color="gray.500">
                {currentView.description || 'No description available'}
              </Text>
              
              <Flex gap={4}>
                {/* Data configuration tools */}
                <HStack spacing={2}>
                  <SimpleFilterButton 
                    onClick={onOpenFilterDrawer} 
                    filters={getCurrentFilters()}
                  />
                  <SimpleColumnSelector
                    columns={getAllAvailableColumns()}
                    onColumnToggle={handleColumnToggle}
                  />
                </HStack>
                
                {/* Data actions */}
                <HStack spacing={2}>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={onCopyModelDetails}
                    isLoading={copyingDetails}
                  >
                    Copy Details
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={onClearData}
                  >
                    Clear Data
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="purple"
                    rightIcon={<ChevronDown size={16} />}
                    onClick={onAddData}
                  >
                    Add Data
                  </Button>
                </HStack>
              </Flex>
            </Flex>
          </Box>
          
          {/* Table with data */}
          <Box flex="1" overflow="hidden" position="relative" width="100%">
            <EnhancedDataTable
              data={data}
              columns={columns}
              isLoading={isLoadingData}
              onRowClick={onEditRow}
              emptyStateMessage="No data available. Add data to start exploring."
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