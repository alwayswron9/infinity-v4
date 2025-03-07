import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Flex, 
  HStack, 
  Button, 
  Tooltip, 
  useColorModeValue,
  IconButton,
  Spinner
} from '@chakra-ui/react';
import { LayoutDashboard, RefreshCw } from 'lucide-react';
import { SimpleFilterButton } from '../SimpleFilterButton';
import { SimpleColumnSelector } from '../SimpleColumnSelector';
import { ViewSelector } from '../ViewSelector';
import { EditableHeading } from '../EditableHeading';
import { DataHeaderProps } from './types';

export function DataHeader({
  currentView,
  hasUnsavedChanges,
  activeViewId,
  views,
  onSave,
  onCreateView,
  onViewSelect,
  onDeleteView,
  onCopyModelDetails,
  copyingDetails,
  viewName,
  editing,
  setEditing,
  onViewNameEdit,
  onOpenFilterDrawer,
  allAvailableColumns,
  handleColumnToggle,
  currentFilters,
  onOpenClearDataDialog,
  onRefreshData,
  isLoadingData
}: DataHeaderProps) {
  const headerBgColor = useColorModeValue('gray.50', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  // Extract these useColorModeValue hooks to fix the hook order issue
  const viewBgColor = useColorModeValue("gray.100", "gray.700");
  const iconColor = useColorModeValue("gray.500", "gray.300");
  
  // State to track refresh button animation
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleViewNameEdit = () => {
    if (onViewNameEdit && currentView) {
      onViewNameEdit(viewName);
    }
  };

  // Prepare a safe onChange handler
  const handleNameChange = (name: string) => {
    if (onViewNameEdit) {
      onViewNameEdit(name);
    }
  };

  // Add debug logging for column toggle
  const handleColumnToggleDebug = (columnKey: string, isVisible: boolean) => {
    console.log(`DataHeader: Column toggle requested for ${columnKey} to ${isVisible}`);
    if (typeof handleColumnToggle === 'function') {
      handleColumnToggle(columnKey, isVisible);
    } else {
      console.error("DataHeader: handleColumnToggle is not a function", handleColumnToggle);
    }
  };
  
  // Handle refresh with animation
  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefreshData();
    
    // Reset the refreshing state after a delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };
  
  // Update refreshing state based on loading state
  useEffect(() => {
    if (!isLoadingData && isRefreshing) {
      // If data is done loading but we're still showing the refresh animation,
      // we can stop the animation
      setIsRefreshing(false);
    }
  }, [isLoadingData, isRefreshing]);

  console.log("DataHeader: Rendering with allAvailableColumns:", allAvailableColumns);

  return (
    <Box borderBottomWidth="1px" borderColor={borderColor}>
      <Flex 
        py={2} 
        px={4} 
        alignItems="center"
        bg={headerBgColor}
        justifyContent="space-between"
      >
        {/* Left side: View name */}
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
                onChange={handleNameChange}
                isEditing={editing}
                onEditStart={() => setEditing(true)}
                onEditEnd={handleViewNameEdit}
              />
            </Box>
          </HStack>
        </Flex>
        
        {/* Right side: Controls */}
        <HStack spacing={2}>
          {/* Refresh Button */}
          <Tooltip label="Refresh data">
            <IconButton
              aria-label="Refresh data"
              icon={isRefreshing ? <Spinner size="sm" /> : <RefreshCw size={16} />}
              size="sm"
              variant="ghost"
              onClick={handleRefresh}
              isDisabled={isRefreshing}
              className={isRefreshing ? "rotate-animation" : ""}
            />
          </Tooltip>
          
          <SimpleFilterButton 
            onClick={onOpenFilterDrawer} 
            filters={currentFilters}
          />
          
          <SimpleColumnSelector
            columns={allAvailableColumns}
            onColumnToggle={handleColumnToggleDebug}
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
              colorScheme="brand" 
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
  );
} 