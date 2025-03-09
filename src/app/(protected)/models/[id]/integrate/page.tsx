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
import { FilterIcon, PlusIcon, RefreshCwIcon, CopyIcon, SearchIcon } from 'lucide-react';
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

  // POST examples
  const getPostCurl = () => {
    return `curl -X POST \\
  "https://your-domain.com/api/public/data?model=${model.name}" \\
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

  // DELETE examples
  const getDeleteCurl = () => {
    return `curl -X DELETE \\
  "https://your-domain.com/api/public/data?model=${model.name}&id=record-id-1" \\
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

  return (
    <Section>
      <Stack spacing={6}>
        <Heading as="h1" size="lg">
          Public API Integration for {model.name}
        </Heading>
        
        <Text>
          Use these code snippets to integrate with the {model.name} model using public API endpoints.
          All examples use the query parameter format, but path parameter format is also available.
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
                          label="Basic list request" 
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
                      <CopyableCode 
                        content={getSingleRecordCurl()} 
                        label="Get record by ID" 
                        language="bash"
                      />
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
                      
                      <Text fontWeight="medium" mb={2}>Complete cURL Example</Text>
                      <CopyableCode 
                        content={getPostCurl()} 
                        label="Create new record" 
                        language="bash"
                      />
                    </Box>
                  </Stack>
                </TabPanel>
                
                {/* PUT Tab */}
                <TabPanel>
                  <Stack spacing={6}>
                    <Box>
                      <Heading size="sm" mb={3}>Update Record</Heading>
                      <Text fontWeight="medium" mb={2}>Request Body (JSON)</Text>
                      <CopyableCode 
                        content={getPutRequestBody()} 
                        label="Update data" 
                        language="json"
                      />
                      
                      <Divider my={4} />
                      
                      <Text fontWeight="medium" mb={2}>Complete cURL Example</Text>
                      <CopyableCode 
                        content={getPutCurl()} 
                        label="Update record by ID" 
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
                      <Text fontWeight="medium" mb={2}>Complete cURL Example</Text>
                      <CopyableCode 
                        content={getDeleteCurl()} 
                        label="Delete record by ID" 
                        language="bash"
                      />
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
                      
                      <Text fontWeight="medium" mb={2}>Complete cURL Example</Text>
                      <CopyableCode 
                        content={getSearchCurl()} 
                        label="Search records" 
                        language="bash"
                      />
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