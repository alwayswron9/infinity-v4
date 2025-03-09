import { 
  Box, 
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Text
} from '@chakra-ui/react';
import { 
  Banner
} from '@saas-ui/react';
import { useModelContext } from '../../explore/components/ModelContext';
import { CopyableCode } from './CopyableCode';

export function DeleteApiConfig() {
  const { model, modelId } = useModelContext();
  
  const getDeleteExample = () => {
    return `// Example DELETE request to remove a record
fetch('/api/data/${modelId}?id=record-id-1', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
})
.then(response => {
  if (response.status === 204) {
    console.log('Record deleted successfully');
  } else {
    return response.json();
  }
})
.then(data => data && console.log(data))
.catch(error => console.error('Error:', error));`;
  };

  const getCurlExample = () => {
    return `curl -X DELETE \\
  "https://your-domain.com/api/data/${modelId}?id=record-id-1" \\
  -H "Authorization: Bearer YOUR_API_KEY"`;
  };

  const getResponseExample = () => {
    return `// The DELETE endpoint returns a 204 No Content status code on success
// with an empty response body

// If there's an error, you'll receive a JSON response:
{
  "success": false,
  "error": "Error message"
}`;
  };
  
  return (
    <Box>
      <Banner
        status="error"
        mb={6}
      >
        <Text>
          DELETE operations are permanent and cannot be undone. Always confirm with the user before deleting records.
          The record ID must be included as a query parameter.
        </Text>
      </Banner>
      
      <Tabs variant="enclosed">
        <TabList>
          <Tab>JavaScript</Tab>
          <Tab>cURL</Tab>
          <Tab>Response</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel>
            <CopyableCode 
              content={getDeleteExample()} 
              label="JavaScript fetch example" 
              language="javascript"
            />
            <Text mt={4} fontSize="sm" color="gray.500">
              Note: The DELETE endpoint returns a 204 No Content status code on success with an empty response body.
            </Text>
          </TabPanel>
          <TabPanel>
            <CopyableCode 
              content={getCurlExample()} 
              label="cURL example" 
              language="bash"
            />
          </TabPanel>
          <TabPanel>
            <CopyableCode 
              content={getResponseExample()} 
              label="Response information" 
              language="javascript"
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
} 