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
  
  // PATCH methods
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

  const getPublicPathPatchExample = () => {
    return `// Example PATCH request to public API with path parameters
fetch('/api/public/data/${model.name}/record-id-1', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'YOUR_PUBLIC_API_KEY'
  },
  body: JSON.stringify({
    // Include only fields that should be updated
    field1: 'updated value'
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`;
  };

  const getPublicPathPatchCurlExample = () => {
    return `curl -X PATCH \\
  "https://your-domain.com/api/public/data/${model.name}/record-id-1" \\
  -H "X-API-Key: YOUR_PUBLIC_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
  "field1": "updated value"
}'`;
  };

  const getPublicPathPatchToggleCurlExample = () => {
    return `curl -X PATCH \\
  "https://your-domain.com/api/public/data/${model.name}/record-id-1" \\
  -H "X-API-Key: YOUR_PUBLIC_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
  "isActive": true
}'`;
  };
  
  return (
    <Box>
      <Banner
        status="info"
        mb={6}
      >
        <Text>
          Both PUT and PATCH methods are available for updating records. Use PUT for full record replacement and PATCH for partial updates.
        </Text>
      </Banner>
      
      <Tabs variant="enclosed">
        <TabList>
          <Tab><Flex align="center" gap={2}><RefreshCwIcon size={14} /> PUT</Flex></Tab>
          <Tab><Flex align="center" gap={2}><CodeIcon size={14} /> PATCH</Flex></Tab>
          <Tab><Flex align="center" gap={2}><CodeIcon size={14} /> Bulk Update</Flex></Tab>
        </TabList>
        
        <TabPanels>
          {/* PUT Tab */}
          <TabPanel>
            <Tabs variant="enclosed">
              <TabList>
                <Tab>Request Body</Tab>
                <Tab>Private API</Tab>
                <Tab>Public API</Tab>
                <Tab>Response</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <Heading size="sm" mb={3}>PUT Request Body</Heading>
                  <Text color="gray.500" mb={4}>
                    Use PUT when you want to completely replace a record with new data. All fields not included will be set to null.
                  </Text>
                  <Tabs variant="enclosed">
                    <TabList>
                      <Tab>Private API</Tab>
                      <Tab>Public API</Tab>
                    </TabList>
                    <TabPanels>
                      <TabPanel>
                        <CopyableCode 
                          content={getPrivateRequestBodyJson()} 
                          label="Private API request body" 
                          language="json"
                        />
                      </TabPanel>
                      <TabPanel>
                        <CopyableCode 
                          content={getPublicRequestBodyJson()} 
                          label="Public API request body" 
                          language="json"
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
                          content={getPrivatePutExample()} 
                          label="Private API JavaScript example" 
                          language="javascript"
                        />
                      </TabPanel>
                      <TabPanel>
                        <CopyableCode 
                          content={getPrivateCurlExample()} 
                          label="Private API cURL example" 
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
                          label="Public API JavaScript example (path parameters)" 
                          language="javascript"
                        />
                      </TabPanel>
                      <TabPanel>
                        <CopyableCode 
                          content={getPublicPathCurlExample()} 
                          label="Public API cURL example (path parameters)" 
                          language="bash"
                        />
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </TabPanel>
                <TabPanel>
                  <CopyableCode 
                    content={getResponseExample()} 
                    label="Example response" 
                    language="json"
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </TabPanel>
          
          {/* PATCH Tab */}
          <TabPanel>
            <Tabs variant="enclosed">
              <TabList>
                <Tab>Request Body</Tab>
                <Tab>Public API</Tab>
                <Tab>Response</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <Heading size="sm" mb={3}>PATCH Request Body Examples</Heading>
                  <Text color="gray.500" mb={4}>
                    Use PATCH when you want to update only specific fields without affecting other fields.
                  </Text>
                  <Tabs variant="enclosed">
                    <TabList>
                      <Tab>Update Single Field</Tab>
                      <Tab>Toggle Boolean Field</Tab>
                    </TabList>
                    <TabPanels>
                      <TabPanel>
                        <CopyableCode 
                          content={getPatchRequestBody()} 
                          label="Partial update body" 
                          language="json"
                        />
                      </TabPanel>
                      <TabPanel>
                        <CopyableCode 
                          content={getPatchToggleBody()} 
                          label="Toggle boolean field" 
                          language="json"
                        />
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </TabPanel>
                <TabPanel>
                  <Tabs variant="enclosed">
                    <TabList>
                      <Tab>JavaScript</Tab>
                      <Tab>Single Field cURL</Tab>
                      <Tab>Toggle Field cURL</Tab>
                    </TabList>
                    <TabPanels>
                      <TabPanel>
                        <CopyableCode 
                          content={getPublicPathPatchExample()} 
                          label="Public API JavaScript example (path parameters)" 
                          language="javascript"
                        />
                      </TabPanel>
                      <TabPanel>
                        <CopyableCode 
                          content={getPublicPathPatchCurlExample()} 
                          label="Update a single field (path parameters)" 
                          language="bash"
                        />
                      </TabPanel>
                      <TabPanel>
                        <CopyableCode 
                          content={getPublicPathPatchToggleCurlExample()} 
                          label="Toggle a boolean field (path parameters)" 
                          language="bash"
                        />
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </TabPanel>
                <TabPanel>
                  <CopyableCode 
                    content={getResponseExample()} 
                    label="Example response" 
                    language="json"
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </TabPanel>
          
          {/* Bulk Update Tab */}
          <TabPanel>
            <Tabs variant="enclosed">
              <TabList>
                <Tab>Private API</Tab>
                <Tab>Public API</Tab>
                <Tab>Response</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <CopyableCode 
                    content={getPrivateBulkUpdateExample()} 
                    label="Bulk update with private API" 
                    language="javascript"
                  />
                </TabPanel>
                <TabPanel>
                  <CopyableCode 
                    content={getPublicPathBulkUpdateExample()} 
                    label="Bulk update with public API (path parameters)" 
                    language="javascript"
                  />
                </TabPanel>
                <TabPanel>
                  <CopyableCode 
                    content={getBulkUpdateResponse()} 
                    label="Example bulk update response" 
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