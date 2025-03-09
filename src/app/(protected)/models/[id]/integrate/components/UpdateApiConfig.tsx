import { 
  Box, 
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Text,
  Flex,
  Heading
} from '@chakra-ui/react';
import { 
  Banner
} from '@saas-ui/react';
import { RefreshCwIcon, CodeIcon, ServerIcon, GlobeIcon } from 'lucide-react';
import { useModelContext } from '../../explore/components/ModelContext';
import { CopyableCode } from './CopyableCode';

export function UpdateApiConfig() {
  const { model, modelId } = useModelContext();
  
  const getPrivateRequestBodyJson = () => {
    return `{
  "fields": {
    "field1": "updated value",
    "field2": 123
    // Include all fields that should be updated
  }
}`;
  };

  const getPublicRequestBodyJson = () => {
    return `{
  "field1": "updated value",
  "field2": 123
  // Include all fields that should be updated
}`;
  };
  
  const getPrivatePutExample = () => {
    return `// Example PUT request to private API (requires fields wrapper)
fetch('/api/data/${modelId}?id=record-id-1', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    fields: {
      // Include all fields that should be updated
      field1: 'updated value',
      field2: 123
    }
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`;
  };

  const getPublicPutExample = () => {
    return `// Example PUT request to public API with query parameters
fetch('/api/public/data?model=${model.name}&id=record-id-1', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'YOUR_PUBLIC_API_KEY'
  },
  body: JSON.stringify({
    // Include all fields that should be updated
    field1: 'updated value',
    field2: 123
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`;
  };

  const getPublicPathPutExample = () => {
    return `// Example PUT request to public API with path parameters
fetch('/api/public/data/${model.name}/record-id-1', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'YOUR_PUBLIC_API_KEY'
  },
  body: JSON.stringify({
    // Include all fields that should be updated
    field1: 'updated value',
    field2: 123
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`;
  };

  const getPrivateCurlExample = () => {
    return `curl -X PUT \\
  "https://your-domain.com/api/data/${modelId}?id=record-id-1" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
  "fields": {
    "field1": "updated value",
    "field2": 123
  }
}'`;
  };

  const getPublicCurlExample = () => {
    return `curl -X PUT \\
  "https://your-domain.com/api/public/data?model=${model.name}&id=record-id-1" \\
  -H "X-API-Key: YOUR_PUBLIC_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
  "field1": "updated value",
  "field2": 123
}'`;
  };

  const getPublicPathCurlExample = () => {
    return `curl -X PUT \\
  "https://your-domain.com/api/public/data/${model.name}/record-id-1" \\
  -H "X-API-Key: YOUR_PUBLIC_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
  "field1": "updated value",
  "field2": 123
}'`;
  };

  const getResponseExample = () => {
    return `{
  "success": true,
  "data": {
    "_id": "record-id-1",
    "_created_at": "2023-01-01T00:00:00.000Z",
    "_updated_at": "2023-01-01T00:00:00.000Z",
    "field1": "updated value",
    "field2": 123,
    // All updated fields
  }
}`;
  };

  const getPrivateBulkUpdateExample = () => {
    return `// Example bulk update request to private API
fetch('/api/data/${modelId}', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify([
    {
      id: 'record-id-1',
      fields: {
        field1: 'updated value for record 1'
      }
    },
    {
      id: 'record-id-2',
      fields: {
        field1: 'updated value for record 2',
        field2: 456
      }
    }
  ])
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`;
  };

  const getPublicBulkUpdateExample = () => {
    return `// Example bulk update request to public API
fetch('/api/public/data?model=${model.name}', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'YOUR_PUBLIC_API_KEY'
  },
  body: JSON.stringify([
    {
      id: 'record-id-1',
      field1: 'updated value for record 1'
    },
    {
      id: 'record-id-2',
      field1: 'updated value for record 2',
      field2: 456
    }
  ])
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`;
  };

  const getPublicPathBulkUpdateExample = () => {
    return `// Example bulk update request to public API with path parameters
fetch('/api/public/data/${model.name}', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'YOUR_PUBLIC_API_KEY'
  },
  body: JSON.stringify([
    {
      id: 'record-id-1',
      field1: 'updated value for record 1'
    },
    {
      id: 'record-id-2',
      field1: 'updated value for record 2',
      field2: 456
    }
  ])
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`;
  };

  const getBulkUpdateResponse = () => {
    return `{
  "success": true,
  "data": [
    {
      "_id": "record-id-1",
      "_created_at": "2023-01-01T00:00:00.000Z",
      "_updated_at": "2023-01-01T00:00:00.000Z",
      "field1": "updated value for record 1",
      // Other fields
    },
    {
      "_id": "record-id-2",
      "_created_at": "2023-01-01T00:00:00.000Z",
      "_updated_at": "2023-01-01T00:00:00.000Z",
      "field1": "updated value for record 2",
      "field2": 456,
      // Other fields
    }
  ],
  "meta": {
    "total": 2,
    "succeeded": 2,
    "failed": 0
  }
}`;
  };
  
  return (
    <Box>
      <Banner
        status="warning"
        mb={6}
      >
        <Text>
          Public API routes accept direct data in the request body. Private API routes require the fields wrapper for backward compatibility.
          Always include the record ID in the URL when updating records.
        </Text>
      </Banner>
      
      <Tabs variant="enclosed">
        <TabList>
          <Tab><Flex align="center" gap={2}><RefreshCwIcon size={14} /> Single Update</Flex></Tab>
          <Tab><Flex align="center" gap={2}><RefreshCwIcon size={14} /> Bulk Update</Flex></Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel>
            <Tabs variant="enclosed">
              <TabList>
                <Tab><Flex align="center" gap={2}><ServerIcon size={14} /> Private API</Flex></Tab>
                <Tab><Flex align="center" gap={2}><GlobeIcon size={14} /> Public API</Flex></Tab>
                <Tab><Flex align="center" gap={2}><CodeIcon size={14} /> Response</Flex></Tab>
              </TabList>
              
              <TabPanels>
                <TabPanel>
                  <Heading size="sm" mb={3}>Private API Examples</Heading>
                  <Tabs variant="enclosed">
                    <TabList>
                      <Tab>Request Body</Tab>
                      <Tab>JavaScript</Tab>
                      <Tab>cURL</Tab>
                    </TabList>
                    <TabPanels>
                      <TabPanel>
                        <CopyableCode 
                          content={getPrivateRequestBodyJson()} 
                          label="Request body structure" 
                          language="json"
                        />
                        <Text mt={4} fontSize="sm" color="gray.500">
                          Private API routes require the data to be wrapped in a "fields" object.
                        </Text>
                      </TabPanel>
                      <TabPanel>
                        <CopyableCode 
                          content={getPrivatePutExample()} 
                          label="JavaScript fetch example" 
                          language="javascript"
                        />
                      </TabPanel>
                      <TabPanel>
                        <CopyableCode 
                          content={getPrivateCurlExample()} 
                          label="cURL example" 
                          language="bash"
                        />
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </TabPanel>
                <TabPanel>
                  <Heading size="sm" mb={3}>Public API Examples</Heading>
                  <Tabs variant="enclosed">
                    <TabList>
                      <Tab>Request Body</Tab>
                      <Tab>Query Parameters</Tab>
                      <Tab>Path Parameters</Tab>
                    </TabList>
                    <TabPanels>
                      <TabPanel>
                        <CopyableCode 
                          content={getPublicRequestBodyJson()} 
                          label="Request body structure" 
                          language="json"
                        />
                        <Text mt={4} fontSize="sm" color="gray.500">
                          Public API routes accept the data directly without a wrapper.
                        </Text>
                      </TabPanel>
                      <TabPanel>
                        <Tabs variant="enclosed">
                          <TabList>
                            <Tab>JavaScript</Tab>
                            <Tab>cURL</Tab>
                          </TabList>
                          <TabPanels>
                            <TabPanel>
                              <CopyableCode 
                                content={getPublicPutExample()} 
                                label="Public API with query parameters" 
                                language="javascript"
                              />
                            </TabPanel>
                            <TabPanel>
                              <CopyableCode 
                                content={getPublicCurlExample()} 
                                label="cURL example" 
                                language="bash"
                              />
                            </TabPanel>
                          </TabPanels>
                        </Tabs>
                      </TabPanel>
                      <TabPanel>
                        <Tabs variant="enclosed">
                          <TabList>
                            <Tab>JavaScript</Tab>
                            <Tab>cURL</Tab>
                          </TabList>
                          <TabPanels>
                            <TabPanel>
                              <CopyableCode 
                                content={getPublicPathPutExample()} 
                                label="Public API with path parameters" 
                                language="javascript"
                              />
                            </TabPanel>
                            <TabPanel>
                              <CopyableCode 
                                content={getPublicPathCurlExample()} 
                                label="cURL example" 
                                language="bash"
                              />
                            </TabPanel>
                          </TabPanels>
                        </Tabs>
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </TabPanel>
                <TabPanel>
                  <Heading size="sm" mb={3}>Response</Heading>
                  <CopyableCode 
                    content={getResponseExample()} 
                    label="Example response" 
                    language="json"
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </TabPanel>
          <TabPanel>
            <Tabs variant="enclosed">
              <TabList>
                <Tab><Flex align="center" gap={2}><ServerIcon size={14} /> Private API</Flex></Tab>
                <Tab><Flex align="center" gap={2}><GlobeIcon size={14} /> Public API</Flex></Tab>
                <Tab><Flex align="center" gap={2}><CodeIcon size={14} /> Response</Flex></Tab>
              </TabList>
              
              <TabPanels>
                <TabPanel>
                  <Heading size="sm" mb={3}>Private API Bulk Update</Heading>
                  <CopyableCode 
                    content={getPrivateBulkUpdateExample()} 
                    label="Bulk update example" 
                    language="javascript"
                  />
                  <Text mt={4} fontSize="sm" color="gray.500">
                    For bulk updates with the private API, send an array of objects, each with an "id" and "fields" property.
                  </Text>
                </TabPanel>
                <TabPanel>
                  <Heading size="sm" mb={3}>Public API Bulk Update</Heading>
                  <Tabs variant="enclosed">
                    <TabList>
                      <Tab>Query Parameters</Tab>
                      <Tab>Path Parameters</Tab>
                    </TabList>
                    <TabPanels>
                      <TabPanel>
                        <CopyableCode 
                          content={getPublicBulkUpdateExample()} 
                          label="Public API bulk update with query parameters" 
                          language="javascript"
                        />
                        <Text mt={4} fontSize="sm" color="gray.500">
                          For bulk updates with the public API, send an array of objects, each with an "id" and the fields to update directly.
                        </Text>
                      </TabPanel>
                      <TabPanel>
                        <CopyableCode 
                          content={getPublicPathBulkUpdateExample()} 
                          label="Public API bulk update with path parameters" 
                          language="javascript"
                        />
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </TabPanel>
                <TabPanel>
                  <Heading size="sm" mb={3}>Bulk Update Response</Heading>
                  <CopyableCode 
                    content={getBulkUpdateResponse()} 
                    label="Example response" 
                    language="json"
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
} 