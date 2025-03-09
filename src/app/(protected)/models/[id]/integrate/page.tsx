'use client';

import { 
  Stack, 
  Flex, 
  Spinner,
  Alert,
  AlertIcon,
  Text,
  Heading,
  Card,
  CardHeader,
  CardBody,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Box,
  SimpleGrid,
  Divider
} from '@chakra-ui/react';
import { 
  Persona
} from '@saas-ui/react';
import { Section } from '@/components/layout/Section';
import { FilterIcon, PlusIcon, RefreshCwIcon, CopyIcon, SearchIcon, EditIcon } from 'lucide-react';
import { useModelContext } from '../explore/components/ModelContext';
import { CopyableCode } from './components/CopyableCode';
import type { FieldDefinition } from '@/types/modelDefinition';

export default function IntegratePage() {
  const { model, loading, error } = useModelContext();

  if (loading) {
    return (
      <Section>
        <Flex justify="center" align="center" height="300px">
          <Spinner size="xl" color="brand.500" />
        </Flex>
      </Section>
    );
  }

  if (error || !model) {
    return (
      <Section>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Text>Error loading model: {error || 'Model not found'}</Text>
        </Alert>
      </Section>
    );
  }

  // Generate sample data structure based on model fields
  const getSampleData = () => {
    if (!model?.fields) return '{}';
    
    const sampleData: Record<string, any> = {};
    Object.entries(model.fields).forEach(([key, field]) => {
      if (!key.startsWith('_')) { // Skip system fields
        const typedField = field as FieldDefinition;
        switch(typedField.type) {
          case 'string':
            sampleData[key] = 'string value';
            break;
          case 'number':
            sampleData[key] = 0;
            break;
          case 'boolean':
            sampleData[key] = false;
            break;
          case 'date':
            sampleData[key] = '2023-01-01';
            break;
          default:
            sampleData[key] = null;
        }
      }
    });
    
    return JSON.stringify(sampleData, null, 2);
  };

  // GET examples
  const getQueryParams = () => {
    return `model=${model.name}&page=1&limit=10`;
  };

  const getFilterParam = () => {
    return `[
  {
    "field": "status",
    "operator": "eq",
    "value": "active"
  }
]`;
  };

  const getFullCurl = () => {
    return `curl -X GET \\
  "https://your-domain.com/api/public/data?model=${model.name}&page=1&limit=10" \\
  -H "X-API-Key: YOUR_API_KEY"`;
  };

  const getFilteredCurl = () => {
    return `curl -X GET \\
  "https://your-domain.com/api/public/data?model=${model.name}&filter=%5B%7B%22field%22%3A%22status%22%2C%22operator%22%3A%22eq%22%2C%22value%22%3A%22active%22%7D%5D" \\
  -H "X-API-Key: YOUR_API_KEY"`;
  };

  const getSingleRecordCurl = () => {
    return `curl -X GET \\
  "https://your-domain.com/api/public/data?model=${model.name}&id=record-id-1" \\
  -H "X-API-Key: YOUR_API_KEY"`;
  };

  // Alternative path-based format
  const getPathBasedCurl = () => {
    return `curl -X GET \\
  "https://your-domain.com/api/public/data/${model.name}/record-id-1" \\
  -H "X-API-Key: YOUR_API_KEY"`;
  };

  // POST examples
  const getPostCurl = () => {
    return `curl -X POST \\
  "https://your-domain.com/api/public/data?model=${model.name}" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${getSampleData().replace(/\n/g, '\\n')}'`;
  };

  const getPostPathCurl = () => {
    return `curl -X POST \\
  "https://your-domain.com/api/public/data/${model.name}" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${getSampleData().replace(/\n/g, '\\n')}'`;
  };

  // PUT examples
  const getPutRequestBody = () => {
    return `{
  "field1": "updated value",
  "field2": 123
}`;
  };

  const getPutCurl = () => {
    return `curl -X PUT \\
  "https://your-domain.com/api/public/data?model=${model.name}&id=record-id-1" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
  "field1": "updated value",
  "field2": 123
}'`;
  };

  const getPutPathCurl = () => {
    return `curl -X PUT \\
  "https://your-domain.com/api/public/data/${model.name}/record-id-1" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
  "field1": "updated value",
  "field2": 123
}'`;
  };

  // PATCH examples
  const getPatchRequestBody = () => {
    return `{
  "field1": "updated value"
}`;
  };

  const getPatchToggleBody = () => {
    return `{
  "isActive": true
}`;
  };

  const getPatchCurl = () => {
    return `curl -X PATCH \\
  "https://your-domain.com/api/public/data?model=${model.name}&id=record-id-1" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
  "field1": "updated value"
}'`;
  };

  const getPatchPathCurl = () => {
    return `curl -X PATCH \\
  "https://your-domain.com/api/public/data/${model.name}/record-id-1" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
  "field1": "updated value"
}'`;
  };

  const getPatchToggleCurl = () => {
    return `curl -X PATCH \\
  "https://your-domain.com/api/public/data/${model.name}/record-id-1" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
  "isActive": true
}'`;
  };

  // DELETE examples
  const getDeleteCurl = () => {
    return `curl -X DELETE \\
  "https://your-domain.com/api/public/data?model=${model.name}&id=record-id-1" \\
  -H "X-API-Key: YOUR_API_KEY"`;
  };

  const getDeletePathCurl = () => {
    return `curl -X DELETE \\
  "https://your-domain.com/api/public/data/${model.name}/record-id-1" \\
  -H "X-API-Key: YOUR_API_KEY"`;
  };

  // SEARCH examples
  const getSearchRequestBody = () => {
    return `{
  "query": "search term or question",
  "limit": 10,
  "minSimilarity": 0.7
}`;
  };

  const getSearchCurl = () => {
    return `curl -X POST \\
  "https://your-domain.com/api/public/data/search?model=${model.name}" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
  "query": "search term or question",
  "limit": 10,
  "minSimilarity": 0.7
}'`;
  };

  const getSearchPathCurl = () => {
    return `curl -X POST \\
  "https://your-domain.com/api/public/data/${model.name}/search" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
  "query": "search term or question",
  "limit": 10,
  "minSimilarity": 0.7
}'`;
  };

  return (
    <Section>
      <Stack spacing={6}>
        <Heading as="h1" size="lg">
          Public API Integration for {model.name}
        </Heading>
        
        <Alert status="info" mb={4}>
          <AlertIcon />
          <Box>
            <Text fontWeight="medium">Important URL Format Note</Text>
            <Text>
              The API supports two URL formats: query parameters (e.g., ?model=name&id=123) and path parameters (e.g., /name/123).
              For PUT, PATCH, and DELETE requests, make sure to use the correct format as shown in the examples.
            </Text>
          </Box>
        </Alert>
        
        <Text>
          Use these code snippets to integrate with the {model.name} model using public API endpoints.
        </Text>
        
        <Card>
          <CardHeader pb={0}>
            <Flex align="center" gap={2}>
              <Persona
                name="API Reference"
                size="xs"
                src=""
                presence="online"
              />
              <Heading size="md">API Integration Guide</Heading>
            </Flex>
          </CardHeader>
          
          <CardBody>
            <Tabs isLazy variant="line" colorScheme="brand">
              <TabList>
                <Tab><Flex align="center" gap={2}><FilterIcon size={14} /> GET</Flex></Tab>
                <Tab><Flex align="center" gap={2}><PlusIcon size={14} /> POST</Flex></Tab>
                <Tab><Flex align="center" gap={2}><RefreshCwIcon size={14} /> PUT</Flex></Tab>
                <Tab><Flex align="center" gap={2}><EditIcon size={14} /> PATCH</Flex></Tab>
                <Tab><Flex align="center" gap={2}><CopyIcon size={14} /> DELETE</Flex></Tab>
                <Tab><Flex align="center" gap={2}><SearchIcon size={14} /> SEARCH</Flex></Tab>
              </TabList>
              
              <TabPanels>
                {/* GET Tab */}
                <TabPanel>
                  <Stack spacing={6}>
                    <Box>
                      <Heading size="sm" mb={3}>List Records</Heading>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <Box>
                          <Text fontWeight="medium" mb={2}>Query Parameters</Text>
                          <CopyableCode 
                            content={getQueryParams()} 
                            label="Basic query parameters" 
                          />
                        </Box>
                        <Box>
                          <Text fontWeight="medium" mb={2}>Filter Parameter (JSON)</Text>
                          <CopyableCode 
                            content={getFilterParam()} 
                            label="Filter parameter" 
                            language="json"
                          />
                        </Box>
                      </SimpleGrid>
                      
                      <Divider my={4} />
                      
                      <Text fontWeight="medium" mb={2}>Complete cURL Examples</Text>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <CopyableCode 
                          content={getFullCurl()} 
                          label="Basic list request (query params)" 
                          language="bash"
                        />
                        <CopyableCode 
                          content={getFilteredCurl()} 
                          label="Filtered list request" 
                          language="bash"
                        />
                      </SimpleGrid>
                    </Box>
                    
                    <Box>
                      <Heading size="sm" mb={3}>Get Single Record</Heading>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <CopyableCode 
                          content={getSingleRecordCurl()} 
                          label="Get record by ID (query params)" 
                          language="bash"
                        />
                        <CopyableCode 
                          content={getPathBasedCurl()} 
                          label="Get record by ID (path params)" 
                          language="bash"
                        />
                      </SimpleGrid>
                    </Box>
                  </Stack>
                </TabPanel>
                
                {/* POST Tab */}
                <TabPanel>
                  <Stack spacing={6}>
                    <Box>
                      <Heading size="sm" mb={3}>Create Record</Heading>
                      <Text fontWeight="medium" mb={2}>Request Body (JSON)</Text>
                      <CopyableCode 
                        content={getSampleData()} 
                        label="Sample data based on your model" 
                        language="json"
                      />
                      
                      <Divider my={4} />
                      
                      <Text fontWeight="medium" mb={2}>Complete cURL Examples</Text>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <CopyableCode 
                          content={getPostCurl()} 
                          label="Create new record (query params)" 
                          language="bash"
                        />
                        <CopyableCode 
                          content={getPostPathCurl()} 
                          label="Create new record (path params)" 
                          language="bash"
                        />
                      </SimpleGrid>
                    </Box>
                  </Stack>
                </TabPanel>
                
                {/* PUT Tab */}
                <TabPanel>
                  <Stack spacing={6}>
                    <Box>
                      <Heading size="sm" mb={3}>Update Record (Full Replace)</Heading>
                      <Text fontSize="sm" mb={3}>
                        Use PUT when you want to completely replace a record with new data.
                      </Text>
                      <Text fontWeight="medium" mb={2}>Request Body (JSON)</Text>
                      <CopyableCode 
                        content={getPutRequestBody()} 
                        label="Update data" 
                        language="json"
                      />
                      
                      <Divider my={4} />
                      
                      <Text fontWeight="medium" mb={2}>Complete cURL Examples</Text>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <CopyableCode 
                          content={getPutCurl()} 
                          label="Update record (query params)" 
                          language="bash"
                        />
                        <CopyableCode 
                          content={getPutPathCurl()} 
                          label="Update record (path params)" 
                          language="bash"
                        />
                      </SimpleGrid>
                      <Text mt={2} fontSize="sm" color="red.500" fontWeight="medium">
                        Note: The URL format in your error was "...thoughts/id=\"5fba116d-9a61-4f5b-82e1-263fbf08ec50\"" which is incorrect.
                        Use either query params (?model=thoughts&id=5fba116d...) or path params (/thoughts/5fba116d...) as shown above.
                      </Text>
                    </Box>
                  </Stack>
                </TabPanel>
                
                {/* PATCH Tab */}
                <TabPanel>
                  <Stack spacing={6}>
                    <Box>
                      <Heading size="sm" mb={3}>Update Record (Partial Update)</Heading>
                      <Text fontSize="sm" mb={3}>
                        Use PATCH when you want to update only specific fields of a record without affecting other fields.
                        This is ideal for toggling boolean values or updating just one field.
                      </Text>
                      <Text fontWeight="medium" mb={2}>Request Body Examples (JSON)</Text>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <CopyableCode 
                          content={getPatchRequestBody()} 
                          label="Update single field" 
                          language="json"
                        />
                        <CopyableCode 
                          content={getPatchToggleBody()} 
                          label="Toggle boolean field" 
                          language="json"
                        />
                      </SimpleGrid>
                      
                      <Divider my={4} />
                      
                      <Text fontWeight="medium" mb={2}>Complete cURL Examples</Text>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
                        <CopyableCode 
                          content={getPatchCurl()} 
                          label="Partial update (query params)" 
                          language="bash"
                        />
                        <CopyableCode 
                          content={getPatchPathCurl()} 
                          label="Partial update (path params)" 
                          language="bash"
                        />
                      </SimpleGrid>
                      <CopyableCode 
                        content={getPatchToggleCurl()} 
                        label="Toggle boolean field example" 
                        language="bash"
                      />
                    </Box>
                  </Stack>
                </TabPanel>
                
                {/* DELETE Tab */}
                <TabPanel>
                  <Stack spacing={6}>
                    <Box>
                      <Heading size="sm" mb={3}>Delete Record</Heading>
                      <Text fontWeight="medium" mb={2}>Complete cURL Examples</Text>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <CopyableCode 
                          content={getDeleteCurl()} 
                          label="Delete record (query params)" 
                          language="bash"
                        />
                        <CopyableCode 
                          content={getDeletePathCurl()} 
                          label="Delete record (path params)" 
                          language="bash"
                        />
                      </SimpleGrid>
                    </Box>
                  </Stack>
                </TabPanel>
                
                {/* SEARCH Tab */}
                <TabPanel>
                  <Stack spacing={6}>
                    <Box>
                      <Heading size="sm" mb={3}>Search Records</Heading>
                      <Text fontWeight="medium" mb={2}>Request Body (JSON)</Text>
                      <CopyableCode 
                        content={getSearchRequestBody()} 
                        label="Search parameters" 
                        language="json"
                      />
                      
                      <Divider my={4} />
                      
                      <Text fontWeight="medium" mb={2}>Complete cURL Examples</Text>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <CopyableCode 
                          content={getSearchCurl()} 
                          label="Search records (query params)" 
                          language="bash"
                        />
                        <CopyableCode 
                          content={getSearchPathCurl()} 
                          label="Search records (path params)" 
                          language="bash"
                        />
                      </SimpleGrid>
                    </Box>
                  </Stack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardBody>
        </Card>
      </Stack>
    </Section>
  );
} 