'use client';

import { 
  Box, 
  Flex, 
  Spinner,
  Text,
  Heading,
  useColorModeValue,
  HStack,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Alert,
  AlertIcon,
  Icon,
} from '@chakra-ui/react';
import { 
  FilterIcon,
  PlusIcon,
  RefreshCwIcon, 
  Code as CodeIcon,
  Trash2 as TrashIcon,
  Search as SearchIcon,
  Info as InfoIcon,
} from 'lucide-react';
import { useModelContext } from '../explore/components/ModelContext';
import { ApiReference } from './components/ApiReference';
import { GetApiConfig } from './components/GetApiConfig';
import { PostApiConfig } from './components/PostApiConfig';
import { UpdateApiConfig } from './components/UpdateApiConfig';
import { DeleteApiConfig } from './components/DeleteApiConfig';
import { SearchApiConfig } from './components/SearchApiConfig';

export default function IntegratePage() {
  const { model, loading, error } = useModelContext();
  const cardBgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  if (loading) {
    return (
      <Flex justify="center" align="center" height="300px">
        <Spinner size="xl" color="brand.500" />
      </Flex>
    );
  }

  if (error || !model) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <Flex direction="column">
          <Heading size="md">Error Loading Model</Heading>
          <Text>{error || 'Model not found'}</Text>
        </Flex>
      </Alert>
    );
  }

  return (
    <Box>
      <Heading as="h1" size="lg" mb={2}>
        Public API Integration for {model.name}
      </Heading>
      <Text color="gray.500" mb={6}>
        Integrate with the API using these endpoints and code samples
      </Text>
      
      <Alert status="info" variant="left-accent" mb={6}>
        <AlertIcon as={InfoIcon} />
        <Box>
          <Text fontWeight="medium">URL Format Note</Text>
          <Text>
            The API supports two URL formats: query parameters (e.g., ?model=name&id=123) and 
            path parameters (e.g., /name/123). The examples below use path parameters for a cleaner RESTful API structure.
          </Text>
        </Box>
      </Alert>

      {/* API Reference Overview */}
      <Box mb={8}>
        <ApiReference />
      </Box>
      
      <Box 
        borderWidth="1px" 
        borderColor={borderColor} 
        borderRadius="md" 
        bg={cardBgColor} 
        overflow="hidden"
      >
        <Tabs 
          variant="line" 
          colorScheme="brand" 
          isLazy
        >
          <TabList borderBottomColor={borderColor}>
            <Tab><HStack spacing={2}><Icon as={FilterIcon} boxSize={4} /><Text>GET</Text></HStack></Tab>
            <Tab><HStack spacing={2}><Icon as={PlusIcon} boxSize={4} /><Text>POST</Text></HStack></Tab>
            <Tab><HStack spacing={2}><Icon as={RefreshCwIcon} boxSize={4} /><Text>PUT/PATCH</Text></HStack></Tab>
            <Tab><HStack spacing={2}><Icon as={TrashIcon} boxSize={4} /><Text>DELETE</Text></HStack></Tab>
            <Tab><HStack spacing={2}><Icon as={SearchIcon} boxSize={4} /><Text>SEARCH</Text></HStack></Tab>
          </TabList>
          
          <TabPanels>
            {/* GET Tab */}
            <TabPanel p={6}>
              <GetApiConfig />
            </TabPanel>
            
            {/* POST Tab */}
            <TabPanel p={6}>
              <PostApiConfig />
            </TabPanel>
            
            {/* PUT/PATCH Tab */}
            <TabPanel p={6}>
              <UpdateApiConfig />
            </TabPanel>
            
            {/* DELETE Tab */}
            <TabPanel p={6}>
              <DeleteApiConfig />
            </TabPanel>
            
            {/* SEARCH Tab */}
            <TabPanel p={6}>
              <SearchApiConfig />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
} 