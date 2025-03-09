import { 
  Box, 
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Text,
  Flex,
  Divider,
  Heading
} from '@chakra-ui/react';
import { 
  Banner
} from '@saas-ui/react';
import { DatabaseIcon, CodeIcon, ServerIcon, GlobeIcon } from 'lucide-react';
import { useModelContext } from '../../explore/components/ModelContext';
import type { FieldDefinition } from '@/types/modelDefinition';
import { CopyableCode } from './CopyableCode';

export function PostApiConfig() {
  const { model, modelId } = useModelContext();
  
  const getModelStructure = () => {
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

  const getRequestBodyWithFields = () => {
    return `{
  "fields": ${getModelStructure()}
}`;
  };

  const getRequestBodyDirect = () => {
    return getModelStructure();
  };
  
  const getPrivatePostExample = () => {
    return `// Example POST request to private API (requires fields wrapper)
fetch('/api/data/${modelId}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    fields: ${getModelStructure()}
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`;
  };

  const getPublicPathPostExample = () => {
    return `// Example POST request to public API with path parameters
fetch('/api/public/data/${model.name}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'YOUR_PUBLIC_API_KEY'
  },
  body: JSON.stringify(${getModelStructure()})
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`;
  };

  const getPrivateCurlExample = () => {
    return `curl -X POST \\
  "https://your-domain.com/api/data/${modelId}" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${getRequestBodyWithFields().replace(/\n/g, '\\n')}'`;
  };

  const getPublicPathCurlExample = () => {
    return `curl -X POST \\
  "https://your-domain.com/api/public/data/${model.name}" \\
  -H "X-API-Key: YOUR_PUBLIC_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${getRequestBodyDirect().replace(/\n/g, '\\n')}'`;
  };

  const getResponseExample = () => {
    return `{
  "success": true,
  "data": {
    "_id": "new-record-id",
    "_created_at": "2023-01-01T00:00:00.000Z",
    "_updated_at": "2023-01-01T00:00:00.000Z",
    // All fields from your request
  }
}`;
  };
  
  return (
    <Box>
      <Banner
        status="info"
        mb={6}
      >
        <Text>
          Public API routes accept direct data in the request body. Private API routes require the fields wrapper for backward compatibility.
        </Text>
      </Banner>
      
      <Tabs variant="enclosed">
        <TabList>
          <Tab><Flex align="center" gap={2}><DatabaseIcon size={14} /> Request Body</Flex></Tab>
          <Tab><Flex align="center" gap={2}><ServerIcon size={14} /> Private API</Flex></Tab>
          <Tab><Flex align="center" gap={2}><GlobeIcon size={14} /> Public API</Flex></Tab>
          <Tab><Flex align="center" gap={2}><CodeIcon size={14} /> Response</Flex></Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel>
            <Tabs variant="enclosed">
              <TabList>
                <Tab>Private API (with fields)</Tab>
                <Tab>Public API (direct data)</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <Heading size="sm" mb={3}>Private API Request Body</Heading>
                  <CopyableCode 
                    content={getRequestBodyWithFields()} 
                    label="Request body with fields wrapper" 
                    language="json"
                  />
                  <Text mt={4} fontSize="sm" color="gray.500">
                    Private API routes require the data to be wrapped in a "fields" object.
                  </Text>
                </TabPanel>
                <TabPanel>
                  <Heading size="sm" mb={3}>Public API Request Body</Heading>
                  <CopyableCode 
                    content={getRequestBodyDirect()} 
                    label="Direct data structure" 
                    language="json"
                  />
                  <Text mt={4} fontSize="sm" color="gray.500">
                    Public API routes accept the data directly without a wrapper.
                  </Text>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </TabPanel>
          <TabPanel>
            <Heading size="sm" mb={3}>Private API Examples</Heading>
            <Tabs variant="enclosed">
              <TabList>
                <Tab>JavaScript</Tab>
                <Tab>cURL</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <CopyableCode 
                    content={getPrivatePostExample()} 
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
            <Heading size="sm" mb={3}>Public API Examples (Path Parameters)</Heading>
            <Tabs variant="enclosed">
              <TabList>
                <Tab>JavaScript</Tab>
                <Tab>cURL</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <CopyableCode 
                    content={getPublicPathPostExample()} 
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
          <TabPanel>
            <CopyableCode 
              content={getResponseExample()} 
              label="Example response" 
              language="json"
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
} 