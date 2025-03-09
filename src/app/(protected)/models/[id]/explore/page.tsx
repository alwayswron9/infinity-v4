"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, useDisclosure, Flex, Spinner, Text } from '@chakra-ui/react';
import type { ColumnDef } from '@tanstack/react-table';

import { Section } from '@/components/layout/Section';
import { useModelData } from '@/hooks/useModelData';
import { useViewManagement } from '@/hooks/useViewManagement';
import useViewStore from '@/lib/stores/viewStore';

// Import the actual components we should be using
import { DataContainer } from '@/components/data/explore/DataContainer';
import { AddDataDrawer } from '@/components/data/explore/AddDataDrawer';
import { RecordDrawer } from '@/components/data/explore/RecordDrawer';

// Import our modular handlers
import { 
  createRefreshDataHandler,
  createPaginationHandler,
  createDeleteRowHandler,
  createSubmitDataHandler,
  createUpdateRecordHandler,
  createClearDataHandler,
  createCopyModelDetailsHandler
} from './components/DataHandlers';

import {
  createConfigChangeHandler,
  createSaveChangesHandler,
  createViewNameEditHandler,
  createRowClickHandler,
  GenericModelView
} from './components/ViewHandlers';

import { useModelContext } from './components/ModelContext';

export default function ExplorePage() {
  const searchParams = useSearchParams();
  
  // Use the shared model context
  const { model, modelId, loading: modelLoading, error: modelError } = useModelContext();
  
  // Record editing state
  const [currentRecord, setCurrentRecord] = useState<Record<string, any> | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [copyingDetails, setCopyingDetails] = useState(false);
  
  // For view name editing
  const [editedName, setEditedName] = useState<string>('');
  const [isEditingName, setIsEditingName] = useState(false);
  
  // Custom handler for setting edited name to prevent unnecessary updates
  const handleSetEditedName = useCallback((name: string) => {
    console.log("ExplorePage: Setting editedName:", name);
    setEditedName(name);
  }, []);
  
  // Drawers state
  const { isOpen: isAddDataOpen, onOpen: onAddDataOpen, onClose: onAddDataClose } = useDisclosure();
  const { isOpen: isRecordDrawerOpen, onOpen: onRecordDrawerOpen, onClose: onRecordDrawerClose } = useDisclosure();
  
  // Use the model data hook
  const {
    data: records,
    isLoading: recordsLoading,
    error: recordsError,
    availableColumns,
    systemColumns,
    pagination,
    loadModelData,
    setPagination,
  } = useModelData({
    modelId: modelId || '',
  });
  
  // Reference to track if we should skip the next refresh
  const skipNextRefreshRef = useRef(false);
  // Track if a manual refresh is in progress
  const isManualRefreshingRef = useRef(false);
  // Track the last refresh time
  const lastRefreshTimeRef = useRef(Date.now());
  
  // Get views from the store directly to ensure consistent state
  const views = useViewStore(state => state.views) || [];
  const activeViewId = useViewStore(state => state.activeView);
  
  // Use the view management hook
  const {
    currentView,
    isEditing,
    loading: viewsLoading,
    error: viewsError,
    handleViewSelect,
    handleCreateView,
    handleEditView,
    handleDeleteView,
    handleSaveView,
    handleViewConfigChange,
    setIsEditing,
  } = useViewManagement({ 
    modelId: modelId || '' 
  });
  
  // Update editedName when currentView changes, but only if we're not in editing mode
  useEffect(() => {
    if (currentView && !isEditingName) {
      console.log("ExplorePage: Updating editedName from currentView:", currentView.name);
      setEditedName(currentView.name);
    }
  }, [currentView, isEditingName]);
  
  // Create handler functions using our factory functions
  const handleRefreshData = useCallback(
    createRefreshDataHandler({
      modelId,
      pagination,
      loadModelData
    }),
    [modelId, pagination, loadModelData]
  );
  
  const handlePaginationChange = useCallback(
    createPaginationHandler({
      pagination,
      loadModelData,
      setPagination
    }),
    [pagination, loadModelData, setPagination]
  );
  
  const handleConfigChange = useCallback(
    createConfigChangeHandler({
      currentView: currentView as GenericModelView | null,
      handleViewConfigChange,
      setIsEditing
    }),
    [currentView, handleViewConfigChange, setIsEditing]
  );
  
  const handleSaveChanges = useCallback(
    createSaveChangesHandler({
      currentView: currentView as GenericModelView | null,
      handleSaveView: handleSaveView as (view: Partial<GenericModelView>) => Promise<void>,
      editedName
    }),
    [currentView, handleSaveView, editedName]
  );
  
  const handleViewNameEdit = useCallback(
    createViewNameEditHandler({
      setEditedName: handleSetEditedName,
      setIsEditingName,
      setIsEditing
    }),
    [handleSetEditedName, setIsEditingName, setIsEditing]
  );
  
  const handleRowClick = useCallback(
    createRowClickHandler({
      setCurrentRecord,
      setIsEditMode,
      onRecordDrawerOpen
    }),
    [setCurrentRecord, setIsEditMode, onRecordDrawerOpen]
  );
  
  const handleDeleteRow = useCallback(
    createDeleteRowHandler({
      modelId,
      handleRefreshData
    }),
    [modelId, handleRefreshData]
  );
  
  const handleSubmitData = useCallback(
    createSubmitDataHandler({
      modelId,
      handleRefreshData,
      onAddDataClose
    }),
    [modelId, handleRefreshData, onAddDataClose]
  );
  
  const handleUpdateRecord = useCallback(
    createUpdateRecordHandler({
      modelId,
      handleRefreshData,
      onRecordDrawerClose,
      currentRecord
    }),
    [modelId, handleRefreshData, onRecordDrawerClose, currentRecord]
  );
  
  const handleClearData = useCallback(
    createClearDataHandler({
      modelId,
      handleRefreshData
    }),
    [modelId, handleRefreshData]
  );
  
  const handleCopyModelDetails = useCallback(
    createCopyModelDetailsHandler({
      model,
      setCopyingDetails
    }),
    [model, setCopyingDetails]
  );
  
  // Create columns for the data table
  const columns = useMemo(() => {
    if (!availableColumns) return [];
    
    // Transform availableColumns to the format expected by DataContainer
    return availableColumns.map(column => ({
      id: column,
      accessorKey: column,
      header: column.charAt(0).toUpperCase() + column.slice(1).replace(/_/g, ' '),
    })) as ColumnDef<Record<string, any>>[];
  }, [availableColumns]);
  
  // Create a wrapper for handleViewSelect that also refreshes data
  const handleViewSelectWithRefresh = useCallback(
    (viewId: string) => {
      handleViewSelect(viewId, handleRefreshData);
    },
    [handleViewSelect, handleRefreshData]
  );
  
  // Check for action=add in URL query params
  useEffect(() => {
    if (searchParams?.get('action') === 'add' && model) {
      onAddDataOpen();
      // Clear the URL parameter after opening
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams, model, onAddDataOpen]);

  // Show loading state if model is loading
  if (modelLoading) {
    return (
      <Flex justify="center" align="center" py={16}>
        <Spinner color="brand.500" size="xl" />
      </Flex>
    );
  }

  // Show error state if there's an error loading the model
  if (modelError || !model) {
    return (
      <Flex direction="column" justify="center" align="center" py={16}>
        <Text fontSize="lg" color="red.500" mb={4}>
          {modelError || 'Failed to load model data'}
        </Text>
        <Text>Please try refreshing the page or contact support if the issue persists.</Text>
      </Flex>
    );
  }

  return (
    <Box>
      <Section>
        {/* Use DataContainer to display the data */}
        <DataContainer
          currentView={currentView as any} // Using 'as any' to avoid type conflicts
          data={records}
          columns={columns}
          pagination={pagination}
          isLoadingData={recordsLoading}
          isInitialLoad={recordsLoading && records.length === 0}
          hasUnsavedChanges={isEditing}
          availableColumns={availableColumns || []}
          views={views} // Get views directly from the store
          activeViewId={activeViewId}
          modelName={model.name}
          onPaginationChange={handlePaginationChange}
          onConfigChange={handleConfigChange}
          onSave={handleSaveChanges}
          onEditRow={handleRowClick}
          onDeleteRow={handleDeleteRow}
          onCreateView={handleCreateView}
          onViewSelect={handleViewSelectWithRefresh}
          onDeleteView={handleDeleteView}
          onAddData={onAddDataOpen}
          onCopyModelDetails={handleCopyModelDetails}
          onClearData={handleClearData}
          onRefreshData={handleRefreshData}
          onViewNameEdit={handleViewNameEdit}
          copyingDetails={copyingDetails}
          editedName={editedName}
          isEditingName={isEditingName}
          setEditingName={setIsEditingName}
          setEditedName={handleSetEditedName}
        />
      </Section>
      
      {/* Add Data Drawer */}
      {model && (
        <AddDataDrawer
          isOpen={isAddDataOpen}
          onClose={onAddDataClose}
          modelName={model.name}
          modelDefinition={model}
          onSubmit={handleSubmitData}
        />
      )}
      
      {/* Record Drawer */}
      {model && currentRecord && (
        <RecordDrawer
          isOpen={isRecordDrawerOpen}
          onClose={onRecordDrawerClose}
          isEditMode={isEditMode}
          setEditMode={setIsEditMode}
          title={isEditMode ? 'Edit Record' : 'View Record'}
          record={currentRecord}
          model={model}
          onSubmit={handleUpdateRecord}
        />
      )}
    </Box>
  );
} 