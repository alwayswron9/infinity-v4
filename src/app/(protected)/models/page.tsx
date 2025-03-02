'use client';

import { useEffect, useState } from 'react';
import { useModels } from '@/hooks/useModels';
import { SideDrawer } from '@/components/layout/SideDrawer';
import { ModelDataForm } from '@/components/models/ModelDataForm';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { 
  Box, 
  Button, 
  Container, 
  Flex, 
  Heading, 
  Icon, 
  Input, 
  InputGroup, 
  InputLeftElement,
  FormControl,
  FormLabel,
  Switch,
  Text,
  HStack,
  useDisclosure,
  Card,
  Stack,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Spinner,
} from '@chakra-ui/react';
import { ModelsGrid } from '@/components/models/ModelsGrid';
import { toast } from 'sonner';

export default function ModelsPage() {
  const {
    filteredModels,
    loading,
    error,
    searchQuery,
    showArchived,
    setSearchQuery,
    setShowArchived,
    loadModels,
    handleArchiveToggle,
    handleDeleteModel,
  } = useModels();

  // State for the add data drawer
  const [isAddDataOpen, setIsAddDataOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  useEffect(() => {
    // Always show archived models
    setShowArchived(true);
    loadModels();
  }, [loadModels, setShowArchived]);

  // Handle adding data to a model
  const handleAddData = async (modelId: string) => {
    setSelectedModel(modelId);
    setIsAddDataOpen(true);
  };

  // Handle clearing all data for a model
  const handleClearData = async (modelId: string, modelName: string) => {
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

      toast.success(`All data for ${modelName} cleared successfully`);
      loadModels(); // Refresh the models list to update record counts
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Handle form submission
  const handleSubmitData = async (data: Record<string, any>) => {
    if (!selectedModel) return;

    try {
      const response = await fetch(`/api/data/${selectedModel}`, {
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
      loadModels(); // Refresh the models list to update record counts
      setIsAddDataOpen(false);
    } catch (error: any) {
      toast.error(error.message);
      throw error; // Re-throw to be handled by the form
    }
  };

  // Get the selected model definition
  const selectedModelDef = selectedModel 
    ? filteredModels.find(m => m.id === selectedModel)
    : null;

  // Separate active and archived models
  const activeModels = filteredModels.filter(model => model.status !== 'archived');
  const archivedModels = filteredModels.filter(model => model.status === 'archived');

  return (
    <Box minH="calc(100vh - 64px)" bg="gray.900" py={6} px={{ base: 4, md: 6 }}>
      <Container maxW="container.2xl" px={0}>
        {/* Page Header */}
        <Stack spacing={4} mb={6}>
          <Flex justifyContent="space-between" alignItems="center">
            <Box>
              <Heading size="lg" fontWeight="semibold" color="white" letterSpacing="-0.02em">
                Models
              </Heading>
              <Text mt={1} color="gray.400" fontSize="sm">
                Create and manage your data models
              </Text>
            </Box>
            
            <Link href="/models/new" passHref>
              <Button
                as="a"
                leftIcon={<Icon as={Plus} boxSize={4} />}
                colorScheme="purple"
                size="md"
                fontWeight="medium"
                borderRadius="md"
              >
                Add model
              </Button>
            </Link>
          </Flex>
          
          {/* Search and Filters */}
          <Card bg="gray.800" borderColor="gray.700" variant="outline" shadow="sm" borderRadius="lg">
            <Flex 
              p={4}
              alignItems="center"
            >
              <InputGroup maxW={{ md: "md" }} flex={1}>
                <InputLeftElement pointerEvents="none">
                  <Icon as={Search} color="gray.500" boxSize={4} />
                </InputLeftElement>
                <Input
                  placeholder="Search models..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  bg="gray.900"
                  color="white"
                  borderColor="gray.700"
                  borderRadius="md"
                  fontSize="sm"
                  _hover={{ borderColor: "gray.600" }}
                  _focus={{ 
                    borderColor: "purple.500", 
                    boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)" 
                  }}
                  _placeholder={{ color: "gray.500" }}
                />
              </InputGroup>
            </Flex>
          </Card>
        </Stack>
        
        {/* Content Area */}
        {loading ? (
          <Flex justify="center" align="center" py={16}>
            <Spinner color="purple.500" size="xl" thickness="3px" speed="0.8s" emptyColor="gray.700" />
          </Flex>
        ) : error ? (
          <Card bg="red.900" borderColor="red.700" color="white" p={4} borderRadius="lg" maxW="lg" mx="auto">
            <Heading size="sm" mb={2}>Error loading models</Heading>
            <Text fontSize="sm" color="red.200">{error}</Text>
          </Card>
        ) : (
          <Tabs variant="enclosed" colorScheme="purple" isLazy mt={6}>
            <TabList borderBottomColor="gray.700">
              <Tab 
                _selected={{ color: 'white', bg: 'gray.800', borderColor: 'gray.700', borderBottomColor: 'gray.800' }}
                color="gray.400"
                borderColor="transparent"
                borderTopRadius="md"
                fontWeight="medium"
                fontSize="sm"
              >
                All Models ({filteredModels.length})
              </Tab>
              <Tab 
                _selected={{ color: 'white', bg: 'gray.800', borderColor: 'gray.700', borderBottomColor: 'gray.800' }}
                color="gray.400"
                borderColor="transparent"
                borderTopRadius="md"
                fontWeight="medium"
                fontSize="sm"
              >
                Active ({activeModels.length})
              </Tab>
              <Tab 
                _selected={{ color: 'white', bg: 'gray.800', borderColor: 'gray.700', borderBottomColor: 'gray.800' }}
                color="gray.400"
                borderColor="transparent"
                borderTopRadius="md"
                fontWeight="medium"
                fontSize="sm"
              >
                Archived ({archivedModels.length})
              </Tab>
            </TabList>
            
            <TabPanels>
              <TabPanel p={0} pt={6}>
                <ModelsGrid 
                  models={filteredModels}
                  loading={false}
                  error={null}
                  onAddData={handleAddData}
                  onArchiveToggle={handleArchiveToggle}
                  onClearData={handleClearData}
                  onDelete={handleDeleteModel}
                />
              </TabPanel>
              <TabPanel p={0} pt={6}>
                <ModelsGrid 
                  models={activeModels}
                  loading={false}
                  error={null}
                  onAddData={handleAddData}
                  onArchiveToggle={handleArchiveToggle}
                  onClearData={handleClearData}
                  onDelete={handleDeleteModel}
                />
              </TabPanel>
              <TabPanel p={0} pt={6}>
                <ModelsGrid 
                  models={archivedModels}
                  loading={false}
                  error={null}
                  onAddData={handleAddData}
                  onArchiveToggle={handleArchiveToggle}
                  onClearData={handleClearData}
                  onDelete={handleDeleteModel}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
        )}
        
        {/* Add Data Drawer */}
        {selectedModelDef && (
          <SideDrawer
            isOpen={isAddDataOpen}
            onClose={() => setIsAddDataOpen(false)}
            title={`Add Data to ${selectedModelDef.name}`}
          >
            <ModelDataForm
              model={selectedModelDef}
              onSubmit={handleSubmitData}
              onCancel={() => setIsAddDataOpen(false)}
            />
          </SideDrawer>
        )}
      </Container>
    </Box>
  );
} 