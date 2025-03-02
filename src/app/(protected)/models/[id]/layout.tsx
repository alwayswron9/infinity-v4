'use client';

import { useState, useEffect, createContext } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { 
  Box, 
  Container, 
  Tabs, 
  TabList, 
  Tab, 
  Spinner,
  Flex,
  Heading,
  Text,
  Stack,
  Button,
  Icon,
  HStack
} from '@chakra-ui/react';
import { 
  Database as DatabaseIcon, 
  Settings as SettingsIcon, 
  Code as CodeIcon,
  Plus as PlusIcon,
  Copy as CopyIcon
} from 'lucide-react';

import { ModelDefinition } from '@/types/modelDefinition';

// Create a context to share model data with child components
export const ModelContext = createContext<{
  model: ModelDefinition | null;
  modelId: string;
  loading: boolean;
  refreshModel: () => Promise<void>;
}>({
  model: null,
  modelId: '',
  loading: false,
  refreshModel: async () => {},
});

/**
 * ModelDetailsLayout - Layout component for model detail pages
 * This component renders the model header, actions, tab navigation and the page content (children)
 */
export default function ModelDetailsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [model, setModel] = useState<ModelDefinition | null>(null);
  const [mounted, setMounted] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Extract model ID from URL path
  const modelId = typeof params.id === 'string' ? params.id : '';
  
  // Get active tab index based on the URL path
  const getActiveTabIndex = () => {
    if (!pathname) return 0;
    
    if (pathname.includes('/explore')) {
      return 0;
    }
    if (pathname.includes('/configure')) {
      return 1;
    }
    if (pathname.includes('/integrate')) {
      return 2;
    }
    
    // Default to explore tab
    return 0;
  };
  
  // Current active tab
  const activeTab = getActiveTabIndex();
  
  // Handle mounting state
  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    if (modelId) {
      fetchModel();
    }
  }, [modelId]);
  
  // Redirect to explore tab if at root model URL
  useEffect(() => {
    if (mounted && !loading && pathname === `/models/${modelId}`) {
      router.push(`/models/${modelId}/explore`);
    }
  }, [loading, pathname, modelId, router, mounted]);
  
  // Fetch model data
  const fetchModel = async () => {
    setLoading(true);
    try {
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

      setModel(data.data);
    } catch (error: any) {
      console.error('Error fetching model:', error);
      toast.error(error.message);
      router.push('/models');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle tab change
  const handleTabChange = (index: number) => {
    if (modelId) {
      switch (index) {
        case 0:
          router.push(`/models/${modelId}/explore`);
          break;
        case 1:
          router.push(`/models/${modelId}/configure`);
          break;
        case 2:
          router.push(`/models/${modelId}/integrate`);
          break;
      }
    }
  };

  // Handle copy model details
  const handleCopyModelDetails = () => {
    if (model) {
      const details = `Model: ${model.name}\nID: ${model.id}\nDescription: ${model.description || 'N/A'}`;
      navigator.clipboard.writeText(details).then(() => {
        setCopySuccess(true);
        toast.success('Model details copied to clipboard');
        setTimeout(() => setCopySuccess(false), 2000);
      });
    }
  };

  // Handle add data
  const handleAddData = () => {
    if (modelId) {
      // Redirect to the appropriate page or open modal for adding data
      router.push(`/models/${modelId}/explore?action=add`);
    }
  };
  
  if (!mounted) {
    // Return a minimal skeleton to prevent hydration mismatches
    return <Box p={6}><Spinner /></Box>;
  }
  
  if (loading && !model) {
    return (
      <Box minH="calc(100vh - 220px)" py={6}>
        <Container maxW="container.xl">
          <Flex justify="center" align="center" py={16}>
            <Spinner color="primary.500" size="xl" />
          </Flex>
        </Container>
      </Box>
    );
  }
  
  // Create context value to share with children
  const contextValue = {
    model,
    modelId,
    loading,
    refreshModel: fetchModel,
  };
  
  return (
    <ModelContext.Provider value={contextValue}>
      <Box minH="calc(100vh - 220px)" py={6}>
        <Container maxW="container.xl">
          {/* Model Header */}
          <Stack spacing={4} mb={6}>
            <Flex justify="space-between" align="center">
              <Box>
                <Heading size="lg" fontWeight="semibold">
                  {model?.name || 'Model Details'}
                </Heading>
                <Text mt={1} color="gray.500" fontSize="sm">
                  {model?.description || 'Manage your model data and configuration'}
                </Text>
              </Box>
              <HStack spacing={3}>
                <Button
                  size="md"
                  variant="outline"
                  leftIcon={<Icon as={CopyIcon} boxSize={4} />}
                  onClick={handleCopyModelDetails}
                >
                  {copySuccess ? 'Copied!' : 'Copy Details'}
                </Button>
                <Button
                  size="md"
                  colorScheme="primary"
                  leftIcon={<Icon as={PlusIcon} boxSize={4} />}
                  onClick={handleAddData}
                >
                  Add Data
                </Button>
              </HStack>
            </Flex>
          </Stack>

          {/* Navigation Tabs */}
          <Tabs 
            index={activeTab} 
            onChange={handleTabChange}
            colorScheme="primary"
            mb={6}
          >
            <TabList>
              <Tab>
                <Flex align="center" gap={2}>
                  <DatabaseIcon size={16} />
                  Explore Data
                </Flex>
              </Tab>
              <Tab>
                <Flex align="center" gap={2}>
                  <SettingsIcon size={16} />
                  Configure
                </Flex>
              </Tab>
              <Tab>
                <Flex align="center" gap={2}>
                  <CodeIcon size={16} />
                  Integrate
                </Flex>
              </Tab>
            </TabList>
          </Tabs>
          
          {/* Children render here (actual page content) */}
          {children}
        </Container>
      </Box>
    </ModelContext.Provider>
  );
} 