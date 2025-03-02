'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon, 
  SaveIcon, 
  ClipboardCopyIcon, 
  DatabaseIcon, 
  Settings, 
  Code, 
  Table2, 
  Search,
  PlusCircle 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { 
  Box,
  Container,
  Card,
  Stack,
  Heading,
  Text,
  Flex,
  Button,
  Icon,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Spinner,
  HStack,
  IconButton,
  useDisclosure,
  Badge,
  Divider,
  useColorModeValue,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay
} from '@chakra-ui/react';

import { 
  ModelDefinition, 
  UpdateModelDefinitionInput, 
  CreatableFieldDefinition,
  FieldDefinition 
} from '@/types/modelDefinition';
import type { ModelView as ModelViewType, ViewConfig, ViewColumnConfig } from '@/types/viewDefinition';
import type { ColumnDef } from '@tanstack/react-table';
import { BasicInfoSection } from '@/components/models/BasicInfoSection';
import { FieldsSection } from '@/components/models/FieldsSection';
import { VectorSearchSection } from '@/components/models/VectorSearchSection';
import { useModelData } from '@/hooks/useModelData';
import { useViewManagement } from '@/hooks/useViewManagement';
import useViewStore from '@/lib/stores/viewStore';

// Import explore components
import { DataContainer } from '@/components/data/explore/DataContainer';
import { RecordDrawer } from '@/components/data/explore/RecordDrawer';
import { AddDataDrawer } from '@/components/data/explore/AddDataDrawer';
import { LoadingState } from '@/components/data/explore/LoadingState';
import { ErrorState } from '@/components/data/explore/ErrorState';

// Import explore.css styles
import '@/app/explore.css';

// Create helper function to determine active tab based on the URL
const getActiveTabIndex = (pathname: string) => {
  if (pathname.includes('/configure')) return 0;
  if (pathname.includes('/explore')) return 1;
  if (pathname.includes('/integrate')) return 2;
  return 0; // Default to configure tab
};

export default function ModelDetailPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const modelId = typeof params.id === 'string' ? params.id : '';
  const [activeTab, setActiveTab] = useState(getActiveTabIndex(pathname));
  
  // State for model and loading
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [model, setModel] = useState<ModelDefinition | null>(null);
  const [copyingDetails, setCopyingDetails] = useState(false);
  
  // State for record details/edit
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<Record<string, any> | null>(null);
  const [isAddDataOpen, setIsAddDataOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Track if initial data load has happened
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [modelName, setModelName] = useState<string>('');
  const [modelDefinition, setModelDefinition] = useState<any>(null);

  // Use a ref to track if the model has been loaded
  const [modelLoaded, setModelLoaded] = useState(false);

  // Data related hooks for the explore tab
  const {
    data,
    isLoading: isLoadingData,
    error: dataError,
    availableColumns,
    pagination,
    loadModelData,
  } = useModelData({ modelId });

  // Cast the currentView to the consistent ModelViewType to fix type issues
  const {
    currentView: viewManagementCurrentView,
    loading: isLoadingViews,
    error: viewError,
    handleViewSelect: baseHandleViewSelect,
    handleCreateView,
    handleSaveView,
    handleViewConfigChange: baseHandleViewConfigChange,
    handleDeleteView: baseHandleDeleteView,
  } = useViewManagement({ modelId });

  // Explicitly type the currentView to resolve type conflicts
  const currentView = viewManagementCurrentView as ModelViewType | undefined;

  const { views: storeViews, activeView } = useViewStore();

  // Explicitly type the views array to match the component expectations
  const views = storeViews as ModelViewType[];

  // Add state for view name editing
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');

  // Add state for delete confirmation
  const [rowToDelete, setRowToDelete] = useState<Record<string, any> | null>(null);
  const deleteAlertDisclosure = useDisclosure();
  const cancelDeleteRef = useRef(null);

  useEffect(() => {
    if (modelId && !modelLoaded) {
      fetchModel();
    }
  }, [modelId, modelLoaded]);

  // Redirect to the configure tab if we're at the root model URL
  useEffect(() => {
    if (loading) return;
    
    // Check if we're at the root `/models/[id]` path
    if (pathname === `/models/${modelId}`) {
      router.push(`/models/${modelId}/configure`);
    }
  }, [loading, pathname, modelId, router]);

  // Load data when switching to explore tab or when view changes
  useEffect(() => {
    if (activeTab === 1 && model) {
      if (currentView) {
        // Only load if it's initial or view changed
        if (isInitialLoad) {
          loadModelData(1, 10);
          setIsInitialLoad(false);
        }
      }
    }
  }, [activeTab, model, currentView, isInitialLoad]);

  // Add a new useEffect to handle view changes
  useEffect(() => {
    // When the view changes, reload data
    if (currentView && activeTab === 1 && !isInitialLoad) {
      loadModelData(pagination?.pageIndex || 0, pagination?.pageSize || 10);
    }
  }, [currentView?.id]); // Only dependency is currentView.id to detect view changes

  // Update active tab when URL changes
  useEffect(() => {
    const newTabIndex = getActiveTabIndex(pathname);
    setActiveTab(newTabIndex);
  }, [pathname]);

  // Update edited name when current view changes
  useEffect(() => {
    if (currentView) {
      setEditedName(currentView.name);
      setHasUnsavedChanges(false);
    }
  }, [currentView]);

  const fetchModel = async () => {
    setLoading(true);
    try {
      console.log('Fetching model with ID:', modelId);
      const response = await fetch(`/api/models?id=${modelId}`, {
        credentials: 'same-origin'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to fetch model');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to fetch model');
      }

      console.log('Model data loaded successfully:', data.data);
      setModel(data.data);
      setModelName(data.data.name);
      setModelDefinition(data.data);
      setModelLoaded(true);
    } catch (error: any) {
      console.error('Error fetching model:', error);
      toast.error(error.message);
      router.push('/models');
    } finally {
      setLoading(false);
    }
  };

  // Handle view selection
  const handleViewSelect = (viewId: string) => {
    baseHandleViewSelect(viewId);
    setIsInitialLoad(true); // Reset initial load flag to trigger data reload
    setHasUnsavedChanges(false);
  };

  // Handle view deletion
  const handleDeleteView = async (viewId: string) => {
    if (!baseHandleDeleteView) return;
    try {
      await baseHandleDeleteView(viewId);
      
      // After successful deletion, if this was the active view, select another view
      if (activeView === viewId && views.length > 1) {
        const remainingViews = views.filter(v => v.id !== viewId);
        const defaultView = remainingViews.find(v => v.is_default);
        const nextView = defaultView || remainingViews[0];
        if (nextView) {
          handleViewSelect(nextView.id);
        }
      }
    } catch (error) {
      console.error('Error deleting view:', error);
    }
  };

  // Handle view name edit
  const handleViewNameEdit = async (newName: string) => {
    if (!currentView || newName === currentView.name) return;
    try {
      await handleSaveView({
        ...currentView,
        name: newName
      });
      setHasUnsavedChanges(false);  // Name updates are saved immediately
    } catch (error) {
      console.error('Error updating view name:', error);
    }
  };

  // Handle pagination changes
  const handlePaginationChange = (pageIndex: number, pageSize: number) => {
    if (!currentView) return;
    loadModelData(pageIndex + 1, pageSize);
  };

  // Handle view config changes (filters, sorting, etc.)
  const handleViewConfigChange = async (configUpdate: Partial<ViewConfig>) => {
    if (!currentView) return;
    
    try {
      // Create updated view with new config
      const updatedView = {
        ...currentView,
        config: { ...currentView.config, ...configUpdate }
      };

      // Update the local state
      await baseHandleViewConfigChange(configUpdate);
      
      setHasUnsavedChanges(true);
      
      if (pagination) {
        handlePaginationChange(0, pagination.pageSize);
      }
    } catch (error) {
      console.error('Error updating view config:', error);
    }
  };

  // Handle saving the current view
  const handleSaveCurrentView = async () => {
    if (!currentView) return;
    
    try {
      // Get the current view from the store to ensure we have the latest state
      const viewToSave = useViewStore.getState().views.find(v => v.id === currentView.id);
      if (!viewToSave) return;

      await handleSaveView(viewToSave as ModelViewType);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving view:', error);
    }
  };

  const getColumns = (view: ModelViewType): ColumnDef<Record<string, any>>[] => {
    // If we have modelDefinition, use its fields to ensure all columns are available
    if (modelDefinition) {
      const allFields = Object.keys(modelDefinition.fields);
      
      // If view doesn't have columns config yet, create it from model fields
      if (!view?.config?.columns) {
        return allFields.map(field => ({
          accessorKey: field,
          header: field,
          enableSorting: true,
          enableColumnFilter: true,
          cell: ({ getValue }) => {
            const value = getValue();
            // Handle different data types for display
            if (value === null || value === undefined) return '';
            if (typeof value === 'object') return JSON.stringify(value);
            
            // Convert to string and truncate long values
            const strValue = String(value);
            return (
              <Box 
                title={strValue}
                textOverflow="ellipsis" 
                overflow="hidden" 
                whiteSpace="nowrap"
                maxW="100%"
              >
                {strValue}
              </Box>
            );
          }
        }));
      }
      
      // Ensure all model fields are in the view columns
      const existingFields = new Set(view.config.columns.map(col => col.field));
      const missingFields = allFields.filter(field => !existingFields.has(field));
      
      // Add any missing fields to the columns config
      const updatedColumns = [
        ...view.config.columns,
        ...missingFields.map(field => ({
          field,
          visible: true,
          sortable: true,
          filterable: true,
          width: 150
        }))
      ];
      
      return updatedColumns
        .filter((col) => col.visible)
        .map((col) => ({
          accessorKey: col.field,
          header: col.field,
          size: col.width,
          enableSorting: col.sortable ?? true,
          enableColumnFilter: col.filterable ?? true,
          cell: ({ getValue }) => {
            const value = getValue();
            
            // Handle different data types for display
            if (value === null || value === undefined) return '';
            if (typeof value === 'object') return JSON.stringify(value);
            
            // Convert to string and truncate long values
            const strValue = String(value);
            return (
              <Box 
                title={strValue}
                textOverflow="ellipsis" 
                overflow="hidden" 
                whiteSpace="nowrap"
                maxW="100%"
              >
                {strValue}
              </Box>
            );
          }
        }));
    }
    
    // Fallback to existing behavior if no modelDefinition
    if (!view?.config?.columns) return [];
    
    return view.config.columns
      .filter((col) => col.visible)
      .map((col) => ({
        accessorKey: col.field,
        header: col.field,
        size: col.width,
        enableSorting: col.sortable ?? true,
        enableColumnFilter: col.filterable ?? true,
        cell: ({ getValue }) => {
          const value = getValue();
          
          // Handle different data types for display
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return JSON.stringify(value);
          
          // Convert to string and truncate long values
          const strValue = String(value);
          return (
            <Box 
              title={strValue}
              textOverflow="ellipsis" 
              overflow="hidden" 
              whiteSpace="nowrap"
              maxW="100%"
            >
              {strValue}
            </Box>
          );
        }
      }));
  };

  // Handle form submission
  const handleSubmitData = async (data: Record<string, any>) => {
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
      setIsAddDataOpen(false);
      
      // Reload the data table
      if (pagination) {
        handlePaginationChange(0, pagination.pageSize);
      }
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  // Handle clearing all data
  const handleClearData = async () => {
    try {
      const response = await fetch(`/api/data/${modelId}/clear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to clear data');
      }

      toast.success('All data cleared successfully');
      
      // Reload the data table
      if (pagination) {
        handlePaginationChange(0, pagination.pageSize);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Handle submitting edited data
  const handleSubmitEditedData = async (data: Record<string, any>) => {
    if (!currentRecord || !currentRecord._id) {
      toast.error('Record ID is missing');
      return;
    }
    
    try {
      const response = await fetch(`/api/data/${modelId}?id=${currentRecord._id}`, {
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
      
      // Exit edit mode but keep drawer open
      setIsEditMode(false);
      
      // Update current record with new data
      setCurrentRecord({
        _id: currentRecord._id,
        ...data
      });
      
      // Reload the data table
      if (pagination) {
        handlePaginationChange(pagination.pageIndex, pagination.pageSize);
      }
    } catch (error: any) {
      console.error('Error updating record:', error);
      toast.error(error.message || 'Failed to update record');
    }
  };

  // Handle deleting a record - updated to use AlertDialog
  const handleDeleteRow = (row: Record<string, any>) => {
    setRowToDelete(row);
    deleteAlertDisclosure.onOpen();
  };
  
  // Perform the actual delete after confirmation
  const confirmDelete = async () => {
    if (!rowToDelete || !rowToDelete._id) {
      toast.error('Record ID is missing');
      deleteAlertDisclosure.onClose();
      return;
    }
    
    try {
      const response = await fetch(`/api/data/${modelId}?id=${rowToDelete._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to delete record');
      }

      toast.success('Record deleted successfully');
      
      // Reload the data table
      if (pagination) {
        handlePaginationChange(pagination.pageIndex, pagination.pageSize);
      }
    } catch (error: any) {
      console.error('Error deleting record:', error);
      toast.error(error.message || 'Failed to delete record');
    } finally {
      setRowToDelete(null);
      deleteAlertDisclosure.onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!model) return;

    if (Object.keys(model.fields).length === 0) {
      toast.error('Add at least one field to your model');
      return;
    }

    setSubmitting(true);
    try {
      // Filter out any vector fields before updating
      const fields: Record<string, CreatableFieldDefinition> = {};
      const entries = Object.entries(model.fields) as [string, FieldDefinition][];
      for (const [name, field] of entries) {
        if (field.type !== 'vector') {
          const { type, id, required, unique, description, default: defaultValue, enum: enumValues, foreign_key } = field;
          if (type === 'string' || type === 'number' || type === 'boolean' || type === 'date') {
            fields[name] = {
              type,
              id,
              required,
              unique,
              description,
              default: defaultValue,
              enum: enumValues,
              foreign_key,
            };
          }
        }
      }

      const updateData: UpdateModelDefinitionInput = {
        name: model.name,
        description: model.description,
        fields,
        embedding: model.embedding,
        relationships: model.relationships,
        indexes: model.indexes
      };

      const response = await fetch(`/api/models?id=${modelId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to update model');
      }

      toast.success('Model updated successfully');
      fetchModel(); // Refresh the model
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyModelDetails = async () => {
    if (!model) return;
    
    setCopyingDetails(true);
    try {
      const response = await fetch(`/api/models/${modelId}/details`, {
        credentials: 'same-origin'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch model details');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch model details');
      }

      const details = data.data;
      
      // Format the details as a readable string
      const formattedDetails = [
        `Model: ${details.name}`,
        `Description: ${details.description}`,
        `ID: ${details.id}`,
        `Record Count: ${details.recordCount}`,
        `Created: ${details.createdAt}`,
        `Updated: ${details.updatedAt}`,
        '',
        'Fields:',
        ...details.fields.map((field: any) => 
          `  - ${field.name} (${field.type})${field.required ? ' [Required]' : ''}${field.unique ? ' [Unique]' : ''}`
        ),
        '',
        `Vector Search: ${details.vectorSearch.enabled ? 'Enabled' : 'Disabled'}`,
        details.vectorSearch.enabled ? `  Source Fields: ${details.vectorSearch.sourceFields.join(', ')}` : '',
        '',
        'Relationships:',
        details.relationships.length > 0 
          ? details.relationships.map((rel: any) => `  - ${rel.name}: ${rel.type} to ${rel.target_model}`) 
          : '  None',
        '',
        'Indexes:',
        details.indexes.length > 0 
          ? details.indexes.map((idx: any) => `  - ${idx.name}: ${idx.fields.join(', ')}`) 
          : '  None'
      ].filter(Boolean).join('\n');

      await navigator.clipboard.writeText(formattedDetails);
      toast.success('Model details copied to clipboard');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setCopyingDetails(false);
    }
  };

  // Handle adding data to the model
  const handleAddData = () => {
    setIsAddDataOpen(true);
  };

  // Handle showing record details
  const handleOpenRecord = (record: Record<string, any>) => {
    // Extract the record data
    const { _id, _created_at, _updated_at, _vector, ...recordData } = record;
    
    // Set the current record
    setCurrentRecord({
      _id,
      ...recordData
    });
    
    // Reset edit mode and open details drawer
    setIsEditMode(false);
    setIsDetailsOpen(true);
  };

  // Handle tab change by navigating to the appropriate URL
  const handleTabChange = (index: number) => {
    if (index === 0) {
      router.push(`/models/${modelId}/configure`);
    } else if (index === 1) {
      router.push(`/models/${modelId}/explore`);
    } else if (index === 2) {
      router.push(`/models/${modelId}/integrate`);
    }
  };

  // Determine overall loading state for explore tab
  const isExploreLoading = activeTab === 1 && (isLoadingViews || (isInitialLoad && isLoadingData));
  const exploreError = viewError || dataError;

  // Add this before the return statement to ensure we have correct component rendering
  const renderDeleteConfirmDialog = () => (
    <AlertDialog
      isOpen={deleteAlertDisclosure.isOpen}
      leastDestructiveRef={cancelDeleteRef}
      onClose={deleteAlertDisclosure.onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Delete Record
          </AlertDialogHeader>

          <AlertDialogBody>
            Are you sure you want to delete this record? This action cannot be undone.
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelDeleteRef} onClick={deleteAlertDisclosure.onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={confirmDelete} ml={3}>
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );

  if (loading) {
    return (
      <Box minH="calc(100vh - 64px)" bg="gray.900" py={6} px={{ base: 4, md: 6 }}>
        <Container maxW="container.2xl" px={0}>
          <Flex justify="center" align="center" py={16}>
            <Spinner color="purple.500" size="xl" thickness="3px" speed="0.8s" emptyColor="gray.700" />
          </Flex>
        </Container>
      </Box>
    );
  }

  if (!model) {
    return null;
  }

  return (
    <Box minH="calc(100vh - 64px)" bg="gray.900" py={6} px={{ base: 4, md: 6 }}>
      {/* Render the delete confirmation dialog */}
      {renderDeleteConfirmDialog()}
      
      <Container maxW="container.2xl" px={0}>
        {/* Page Header */}
        <Stack spacing={4} mb={6}>
          <Flex justifyContent="space-between" alignItems="center">
            <Flex align="center" gap={4}>
              <Link href="/models" passHref>
                <IconButton
                  aria-label="Back to models"
                  icon={<Icon as={ArrowLeftIcon} boxSize={4} />}
                  variant="ghost"
                  color="gray.400"
                  _hover={{ color: "white", bg: "gray.700" }}
                  size="md"
                />
              </Link>
              <Box>
                <Heading size="lg" fontWeight="semibold" color="white" letterSpacing="-0.02em">
                  {model.name}
                </Heading>
                <Text mt={1} color="gray.400" fontSize="sm">
                  {model.description || 'No description'}
                </Text>
              </Box>
            </Flex>
            
            <HStack spacing={3}>
              <Button
                onClick={handleCopyModelDetails}
                isLoading={copyingDetails}
                loadingText="Copying..."
                leftIcon={<Icon as={ClipboardCopyIcon} boxSize={4} />}
                variant="ghost"
                color="gray.400"
                _hover={{ color: "white", bg: "gray.700" }}
              >
                Copy Details
              </Button>
              
              {activeTab === 0 && (
                <Button
                  type="submit"
                  form="model-form"
                  isLoading={submitting}
                  loadingText="Saving..."
                  colorScheme="purple"
                  leftIcon={<Icon as={SaveIcon} boxSize={4} />}
                  isDisabled={submitting || (model.embedding?.enabled && (!model.embedding.source_fields || model.embedding.source_fields.length === 0))}
                >
                  Save Changes
                </Button>
              )}
              
              {activeTab === 1 && !isExploreLoading && (
                <Button
                  onClick={handleAddData}
                  colorScheme="purple"
                  leftIcon={<Icon as={PlusCircle} boxSize={4} />}
                >
                  Add Data
                </Button>
              )}
            </HStack>
          </Flex>
        </Stack>

        {/* Tabs Navigation */}
        <Tabs 
          index={activeTab} 
          onChange={handleTabChange} 
          variant="enclosed" 
          colorScheme="purple" 
          isLazy
        >
          <TabList borderBottomColor="gray.700">
            <Tab 
              _selected={{ color: 'white', bg: 'gray.800', borderColor: 'gray.700', borderBottomColor: 'gray.800' }}
              color="gray.400"
              borderColor="transparent"
              borderTopRadius="md"
              fontWeight="medium"
              fontSize="sm"
            >
              <Icon as={Settings} boxSize={4} mr={2} />
              Configure
            </Tab>
            <Tab 
              _selected={{ color: 'white', bg: 'gray.800', borderColor: 'gray.700', borderBottomColor: 'gray.800' }}
              color="gray.400"
              borderColor="transparent"
              borderTopRadius="md"
              fontWeight="medium"
              fontSize="sm"
            >
              <Icon as={Table2} boxSize={4} mr={2} />
              Explore Data
            </Tab>
            <Tab 
              _selected={{ color: 'white', bg: 'gray.800', borderColor: 'gray.700', borderBottomColor: 'gray.800' }}
              color="gray.400"
              borderColor="transparent"
              borderTopRadius="md"
              fontWeight="medium"
              fontSize="sm"
            >
              <Icon as={Code} boxSize={4} mr={2} />
              Integrate
            </Tab>
          </TabList>
          
          <TabPanels>
            {/* Configure Tab */}
            <TabPanel p={0} pt={6} h="calc(100vh - 220px)" overflow="auto" maxW="100%">
              <form id="model-form" onSubmit={handleSubmit} style={{ width: "100%" }}>
                <Stack spacing={8} pb={6} maxW="100%">
                  <Card bg="gray.800" borderWidth="1px" borderColor="gray.700" borderRadius="md" p={6}>
                    <Stack spacing={4}>
                      <Heading as="h3" size="md" fontWeight="semibold" color="white">
                        Basic Information
                      </Heading>
                      <BasicInfoSection 
                        model={model} 
                        onChange={(updates: Partial<ModelDefinition>) => setModel((prev: ModelDefinition | null) => prev ? { ...prev, ...updates } : null)} 
                      />
                    </Stack>
                  </Card>
                  
                  <Card bg="gray.800" borderWidth="1px" borderColor="gray.700" borderRadius="md" p={6}>
                    <Stack spacing={4}>
                      <Heading as="h3" size="md" fontWeight="semibold" color="white">
                        Fields
                      </Heading>
                      <FieldsSection 
                        model={model} 
                        onChange={(updates: Partial<ModelDefinition>) => setModel((prev: ModelDefinition | null) => prev ? { ...prev, ...updates } : null)} 
                      />
                    </Stack>
                  </Card>
                  
                  <Card bg="gray.800" borderWidth="1px" borderColor="gray.700" borderRadius="md" p={6}>
                    <Stack spacing={4}>
                      <Heading as="h3" size="md" fontWeight="semibold" color="white">
                        Vector Search
                      </Heading>
                      <VectorSearchSection 
                        model={model} 
                        onChange={(updates: Partial<ModelDefinition>) => setModel((prev: ModelDefinition | null) => prev ? { ...prev, ...updates } : null)} 
                      />
                    </Stack>
                  </Card>
                </Stack>
              </form>
            </TabPanel>
            
            {/* Explore Data Tab - No overflow here as only the table should scroll */}
            <TabPanel p={0} pt={6} h="calc(100vh - 220px)" maxW="100%" overflow="hidden">
              {isExploreLoading ? (
                <LoadingState message={isLoadingViews ? 'Loading views...' : 'Loading data...'} />
              ) : exploreError ? (
                <ErrorState error={exploreError} />
              ) : (
                <Flex direction="column" h="100%" w="100%" overflow="hidden">
                  <DataContainer
                    currentView={currentView || null}
                    data={data}
                    columns={currentView ? getColumns(currentView) : []}
                    pagination={pagination}
                    isLoadingData={isLoadingData}
                    isInitialLoad={isInitialLoad}
                    hasUnsavedChanges={hasUnsavedChanges}
                    availableColumns={availableColumns}
                    views={views || []}
                    activeViewId={activeView}
                    modelName={modelName}
                    onPaginationChange={handlePaginationChange}
                    onConfigChange={handleViewConfigChange}
                    onSave={handleSaveCurrentView}
                    onEditRow={handleOpenRecord}
                    onDeleteRow={handleDeleteRow}
                    onCreateView={handleCreateView}
                    onViewSelect={handleViewSelect}
                    onDeleteView={handleDeleteView}
                    onAddData={handleAddData}
                    onCopyModelDetails={handleCopyModelDetails}
                    onClearData={handleClearData}
                    onViewNameEdit={handleViewNameEdit}
                    copyingDetails={copyingDetails}
                    editedName={editedName}
                    isEditingName={isEditingName}
                    setEditingName={setIsEditingName}
                    setEditedName={setEditedName}
                  />
                  
                  {/* Add Data Drawer */}
                  {modelDefinition && (
                    <AddDataDrawer
                      isOpen={isAddDataOpen}
                      onClose={() => setIsAddDataOpen(false)}
                      modelName={modelName}
                      modelDefinition={modelDefinition}
                      onSubmit={handleSubmitData}
                    />
                  )}
                  
                  {/* Record Details Drawer */}
                  {modelDefinition && currentRecord && (
                    <RecordDrawer
                      isOpen={isDetailsOpen}
                      onClose={() => {
                        setIsDetailsOpen(false);
                        setCurrentRecord(null);
                        setIsEditMode(false);
                      }}
                      isEditMode={isEditMode}
                      setEditMode={setIsEditMode}
                      title={isEditMode ? "Edit Record" : "Record Details"}
                      record={currentRecord}
                      model={modelDefinition}
                      onSubmit={handleSubmitEditedData}
                    />
                  )}
                </Flex>
              )}
            </TabPanel>
            
            {/* Integrate Tab */}
            <TabPanel p={0} pt={6} h="calc(100vh - 220px)" overflow="auto" maxW="100%">
              <Stack spacing={8} pb={6} maxW="100%">
                <Heading as="h3" size="md" fontWeight="semibold" color="white" mb={4}>
                  API Integration
                </Heading>
                <Text color="gray.400" mb={6}>
                  Use these code examples to integrate this model with your application.
                </Text>

                <Box>
                  <Heading as="h4" size="sm" fontWeight="semibold" mb={3} color="gray.200">
                    Create Record
                  </Heading>
                  <Box bg="gray.900" rounded="lg" p={4} borderWidth="1px" borderColor="gray.700">
                    <Text as="pre" fontSize="sm" color="gray.300" fontFamily="mono" whiteSpace="pre-wrap" overflowX="auto">
{`POST /api/public/data/${model.name}
Headers: {
  "X-API-Key": "your_api_key_here",
  "Content-Type": "application/json"
}
Body: {
  ${Object.entries(model.fields)
    .map(([name, field]) => `"${name}": "${field.type === 'string' ? 'value' : field.type === 'number' ? '0' : field.type === 'boolean' ? 'false' : ''}"`)
    .join(',\n  ')}
}`}
                    </Text>
                  </Box>
                </Box>
                
                <Box>
                  <Heading as="h4" size="sm" fontWeight="semibold" mb={3} color="gray.200">
                    Get Records
                  </Heading>
                  <Box bg="gray.900" rounded="lg" p={4} borderWidth="1px" borderColor="gray.700">
                    <Text as="pre" fontSize="sm" color="gray.300" fontFamily="mono" whiteSpace="pre-wrap" overflowX="auto">
{`GET /api/public/data/${model.name}?page=1&limit=10
Headers: {
  "X-API-Key": "your_api_key_here"
}`}
                    </Text>
                  </Box>
                </Box>
                
                <Box>
                  <Heading as="h4" size="sm" fontWeight="semibold" mb={3} color="gray.200">
                    Update Record
                  </Heading>
                  <Box bg="gray.900" rounded="lg" p={4} borderWidth="1px" borderColor="gray.700">
                    <Text as="pre" fontSize="sm" color="gray.300" fontFamily="mono" whiteSpace="pre-wrap" overflowX="auto">
{`PUT /api/public/data/${model.name}?id=record_id
Headers: {
  "X-API-Key": "your_api_key_here",
  "Content-Type": "application/json"
}
Body: {
  ${Object.entries(model.fields)
    .filter(([name]) => name !== 'id')
    .map(([name, field]) => `"${name}": "${field.type === 'string' ? 'new value' : field.type === 'number' ? '0' : field.type === 'boolean' ? 'false' : ''}"`)
    .join(',\n  ')}
}`}
                    </Text>
                  </Box>
                </Box>
                
                <Box>
                  <Heading as="h4" size="sm" fontWeight="semibold" mb={3} color="gray.200">
                    Delete Record
                  </Heading>
                  <Box bg="gray.900" rounded="lg" p={4} borderWidth="1px" borderColor="gray.700">
                    <Text as="pre" fontSize="sm" color="gray.300" fontFamily="mono" whiteSpace="pre-wrap" overflowX="auto">
{`DELETE /api/public/data/${model.name}?id=record_id`}
                    </Text>
                  </Box>
                </Box>
              </Stack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </Box>
  );
} 
