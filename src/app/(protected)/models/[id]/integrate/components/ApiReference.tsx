import { 
  Box, 
  Text,
  Badge,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Heading,
  Flex,
  Divider
} from '@chakra-ui/react';
import { 
  StructuredList,
  StructuredListItem,
  StructuredListCell,
  Banner
} from '@saas-ui/react';
import { useModelContext } from '../../explore/components/ModelContext';
import { ServerIcon, GlobeIcon } from 'lucide-react';

export function ApiReference() {
  const { model, modelId } = useModelContext();
  
  const privateEndpoints = [
    { 
      method: 'GET', 
      path: `/api/data/${modelId}`, 
      description: 'List records with optional filtering and sorting',
      params: 'page, limit, filter, sorting'
    },
    { 
      method: 'GET', 
      path: `/api/data/${modelId}?id={id}`, 
      description: 'Get a single record by ID',
      params: 'id (in query parameter)'
    },
    { 
      method: 'POST', 
      path: `/api/data/${modelId}`, 
      description: 'Create a new record',
      params: 'Request body with fields object'
    },
    { 
      method: 'PUT', 
      path: `/api/data/${modelId}?id={id}`, 
      description: 'Replace an entire record',
      params: 'id (in query parameter), Request body with fields object'
    },
    { 
      method: 'DELETE', 
      path: `/api/data/${modelId}?id={id}`, 
      description: 'Delete a record',
      params: 'id (in query parameter)'
    }
  ];

  const publicEndpoints = [
    { 
      method: 'GET', 
      path: `/api/public/data?model=${model.name}`, 
      description: 'List records with optional filtering and sorting',
      params: 'model (required), page, limit, filter'
    },
    { 
      method: 'GET', 
      path: `/api/public/data?model=${model.name}&id={id}`, 
      description: 'Get a single record by ID',
      params: 'model (required), id (required)'
    },
    { 
      method: 'POST', 
      path: `/api/public/data?model=${model.name}`, 
      description: 'Create a new record',
      params: 'model (required), Request body with data'
    },
    { 
      method: 'PUT', 
      path: `/api/public/data?model=${model.name}&id={id}`, 
      description: 'Replace an entire record',
      params: 'model (required), id (required), Request body with data'
    },
    { 
      method: 'DELETE', 
      path: `/api/public/data?model=${model.name}&id={id}`, 
      description: 'Delete a record',
      params: 'model (required), id (required)'
    },
    { 
      method: 'POST', 
      path: `/api/public/data/search?model=${model.name}`, 
      description: 'Search records using vector similarity',
      params: 'model (required), Request body with query, limit, minSimilarity'
    }
  ];

  const modelNameEndpoints = [
    { 
      method: 'GET', 
      path: `/api/public/data/${model.name}`, 
      description: 'List records with optional filtering and sorting',
      params: 'page, limit, filter'
    },
    { 
      method: 'GET', 
      path: `/api/public/data/${model.name}/{id}`, 
      description: 'Get a single record by ID',
      params: 'id (in path)'
    },
    { 
      method: 'POST', 
      path: `/api/public/data/${model.name}`, 
      description: 'Create a new record',
      params: 'Request body with data'
    },
    { 
      method: 'PUT', 
      path: `/api/public/data/${model.name}/{id}`, 
      description: 'Replace an entire record',
      params: 'id (in path), Request body with data'
    },
    { 
      method: 'DELETE', 
      path: `/api/public/data/${model.name}/{id}`, 
      description: 'Delete a record',
      params: 'id (in path)'
    },
    { 
      method: 'POST', 
      path: `/api/public/data/${model.name}/search`, 
      description: 'Search records using vector similarity',
      params: 'Request body with query, limit, minSimilarity'
    }
  ];
  
  const renderEndpointList = (endpoints: any[]) => (
    <StructuredList>
      {endpoints.map((endpoint, index) => (
        <StructuredListItem key={index}>
          <StructuredListCell width="100px">
            <Badge 
              colorScheme={
                endpoint.method === 'GET' ? 'green' : 
                endpoint.method === 'POST' ? 'blue' : 
                endpoint.method === 'PUT' ? 'orange' : 
                'red'
              }
              px={2}
              py={1}
              borderRadius="md"
              fontWeight="bold"
            >
              {endpoint.method}
            </Badge>
          </StructuredListCell>
          <StructuredListCell flex="1">
            <Text fontFamily="mono" fontSize="sm" fontWeight="medium">{endpoint.path}</Text>
            <Text fontSize="sm" color="gray.500" mt={1}>{endpoint.description}</Text>
          </StructuredListCell>
          <StructuredListCell width="200px">
            <Text fontSize="xs" color="gray.500">{endpoint.params}</Text>
          </StructuredListCell>
        </StructuredListItem>
      ))}
    </StructuredList>
  );

  return (
    <Box>
      <Banner
        status="info"
        mb={6}
      >
        <Text>
          All public API routes now accept direct data in the request body without requiring a fields wrapper.
          Private API routes still require the fields wrapper for backward compatibility.
        </Text>
      </Banner>

      <Tabs variant="enclosed">
        <TabList>
          <Tab><Flex align="center" gap={2}><ServerIcon size={14} /> Private API</Flex></Tab>
          <Tab><Flex align="center" gap={2}><GlobeIcon size={14} /> Public API (Query)</Flex></Tab>
          <Tab><Flex align="center" gap={2}><GlobeIcon size={14} /> Public API (Path)</Flex></Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Heading size="sm" mb={4}>Private API Endpoints</Heading>
            <Text mb={4}>
              These endpoints require authentication with your user credentials. Use these for server-to-server integrations where you control both sides.
            </Text>
            <Divider mb={4} />
            {renderEndpointList(privateEndpoints)}
          </TabPanel>
          <TabPanel>
            <Heading size="sm" mb={4}>Public API Endpoints (Query Parameters)</Heading>
            <Text mb={4}>
              These endpoints use query parameters and require an API key. Use these for public integrations where you need to expose your data to third parties.
            </Text>
            <Divider mb={4} />
            {renderEndpointList(publicEndpoints)}
          </TabPanel>
          <TabPanel>
            <Heading size="sm" mb={4}>Public API Endpoints (Path Parameters)</Heading>
            <Text mb={4}>
              These endpoints use path parameters and require an API key. They provide the same functionality as the query parameter endpoints but with a more RESTful URL structure.
            </Text>
            <Divider mb={4} />
            {renderEndpointList(modelNameEndpoints)}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
} 