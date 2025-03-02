"use client";

import { useState, useEffect, useContext, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { 
  Box, 
  Flex, 
  Spinner,
  useDisclosure,
} from '@chakra-ui/react';
import type { ColumnDef } from '@tanstack/react-table';

import { Section } from '@/components/layout/Section';
import { ModelContext } from '../layout';
import { useModelData } from '@/hooks/useModelData';
import { useViewManagement } from '@/hooks/useViewManagement';
import useViewStore from '@/lib/stores/viewStore';

// Import the actual components we should be using
import { DataContainer } from '@/components/data/explore/DataContainer';
import { AddDataDrawer } from '@/components/data/explore/AddDataDrawer';
import { RecordDrawer } from '@/components/data/explore/RecordDrawer';

export default function ExplorePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Use the shared model context
  const { model, modelId, loading: modelLoading, refreshModel } = useContext(ModelContext);
  
  // Record editing state
  const [currentRecord, setCurrentRecord] = useState<Record<string, any> | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [copyingDetails, setCopyingDetails] = useState(false);
  
  // For view name editing
  const [editedName, setEditedName] = useState<string>('');
  const [isEditingName, setIsEditingName] = useState(false);
  
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
  
  // Load data when modelId changes
  useEffect(() => {
    if (modelId) {
      loadModelData(1, 10);
    }
  }, [modelId, loadModelData]);
  
  // Check for action=add in URL query params
  useEffect(() => {
    if (searchParams?.get('action') === 'add' && model) {
      onAddDataOpen();
      // Clear the URL parameter after opening
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams, model, onAddDataOpen]);
  
  // Handle pagination change
  const handlePaginationChange = (pageIndex: number, pageSize: number) => {
    setPagination({
      pageIndex,
      pageSize,
      pageCount: Math.ceil((pagination?.total || 0) / pageSize),
      total: pagination?.total || 0
    });
    loadModelData(pageIndex + 1, pageSize);
  };
  
  // Handle config change
  const handleConfigChange = (config: any) => {
    if (!currentView) return;
    handleViewConfigChange(config);
    // Set isEditing flag to ensure Save button appears when config changes
    setIsEditing(true);
  };
  
  // Handle save view changes
  const handleSaveChanges = async () => {
    if (!currentView) return;
    
    try {
      await handleSaveView({
        ...currentView,
        name: editedName || currentView.name
      });
      
      toast.success('View saved successfully');
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  
  // Handle view name edit
  const handleViewNameEdit = (newName: string) => {
    setEditedName(newName);
    setIsEditingName(true);
    // Also set the main isEditing flag to ensure Save button appears
    setIsEditing(true);
  };
  
  // Handle row click
  const handleRowClick = (row: Record<string, any>) => {
    setCurrentRecord(row);
    setIsEditMode(false);
    onRecordDrawerOpen();
  };
  
  // Handle delete row
  const handleDeleteRow = async (row: Record<string, any>) => {
    if (!model || !row.id) return;
    
    try {
      const response = await fetch(`/api/data/${modelId}/${row.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete record');
      
      toast.success('Record deleted successfully');
      loadModelData(pagination.pageIndex + 1, pagination.pageSize);
      refreshModel(); // Refresh model data in context to update record count
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  
  // Handle add data
  const handleSubmitData = async (data: Record<string, any>) => {
    if (!model) return;
    
    try {
      const response = await fetch(`/api/data/${modelId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields: data }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to add data');
      }
      
      toast.success('Data added successfully');
      loadModelData(pagination.pageIndex + 1, pagination.pageSize);
      onAddDataClose();
      refreshModel(); // Refresh the model data in context
      return Promise.resolve();
    } catch (error: any) {
      toast.error(error.message);
      return Promise.reject(error);
    }
  };
  
  // Handle update record
  const handleUpdateRecord = async (data: Record<string, any>) => {
    if (!model || !currentRecord?.id) return;
    
    try {
      const response = await fetch(`/api/data/${modelId}/${currentRecord.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields: data }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to update record');
      }
      
      toast.success('Record updated successfully');
      loadModelData(pagination.pageIndex + 1, pagination.pageSize);
      onRecordDrawerClose();
      return Promise.resolve();
    } catch (error: any) {
      toast.error(error.message);
      return Promise.reject(error);
    }
  };
  
  // Handle clear data
  const handleClearData = async () => {
    if (!model) return;
    
    try {
      const response = await fetch(`/api/data/${modelId}/clear`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to clear data');
      
      toast.success('All data cleared successfully');
      loadModelData(pagination.pageIndex + 1, pagination.pageSize);
      refreshModel(); // Refresh model data in context
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  
  // Handle copy model details
  const handleCopyModelDetails = async () => {
    if (!model) return;
    
    setCopyingDetails(true);
    try {
      // Create a formatted string with model details
      const detailsText = `Model: ${model.name}
ID: ${model.id}
Description: ${model.description || 'N/A'}
Fields: ${Object.keys(model.fields || {}).join(', ')}`;
      
      await navigator.clipboard.writeText(detailsText);
      toast.success('Model details copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy details');
    } finally {
      setCopyingDetails(false);
    }
  };
  
  // Early return if model is loading
  if (modelLoading || !model) {
    return (
      <Flex justify="center" align="center" py={16}>
        <Spinner color="primary.500" size="xl" />
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
          onViewSelect={handleViewSelect}
          onDeleteView={handleDeleteView}
          onAddData={onAddDataOpen}
          onCopyModelDetails={handleCopyModelDetails}
          onClearData={handleClearData}
          onViewNameEdit={handleViewNameEdit}
          copyingDetails={copyingDetails}
          editedName={editedName}
          isEditingName={isEditingName}
          setEditingName={setIsEditingName}
          setEditedName={setEditedName}
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