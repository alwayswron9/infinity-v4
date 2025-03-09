import { 
  Box, 
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Text,
  Flex
} from '@chakra-ui/react';
import { 
  Banner
} from '@saas-ui/react';
import { SearchIcon, CodeIcon } from 'lucide-react';
import { useModelContext } from '../../explore/components/ModelContext';
import { CopyableCode } from './CopyableCode';

export function SearchApiConfig() {
  const { model, modelId } = useModelContext();
  
  const getSearchRequestBody = () => {
    return `{
  "query": "search term or question",
  "limit": 10,
  "minSimilarity": 0.7
}`;
  };
  
  const getPrivateSearchExample = () => {
    return `// Example search request
fetch('/api/data/${modelId}/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    query: "search term or question",
    limit: 10,
    minSimilarity: 0.7
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`;
  };

  const getPublicSearchExample = () => {
    return `// Example public search request with query parameters
fetch('/api/public/data/search?model=${model.name}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'YOUR_PUBLIC_API_KEY'
  },
  body: JSON.stringify({
    query: "search term or question",
    limit: 10,
    minSimilarity: 0.7
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`;
  };

  const getPublicPathSearchExample = () => {
    return `// Example public search request with path parameters
fetch('/api/public/data/${model.name}/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'YOUR_PUBLIC_API_KEY'
  },
  body: JSON.stringify({
    query: "search term or question",
    limit: 10,
    minSimilarity: 0.7
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`;
  };

  const getSearchCurlExample = () => {
    return `curl -X POST \\
  "https://your-domain.com/api/data/${modelId}/search" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
  "query": "search term or question",
  "limit": 10,
  "minSimilarity": 0.7
}'`;
  };

  const getPublicSearchCurlExample = () => {
    return `curl -X POST \\
  "https://your-domain.com/api/public/data/search?model=${model.name}" \\
  -H "X-API-Key: YOUR_PUBLIC_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
  "query": "search term or question",
  "limit": 10,
  "minSimilarity": 0.7
}'`;
  };

  const getPublicPathSearchCurlExample = () => {
    return `curl -X POST \\
  "https://your-domain.com/api/public/data/${model.name}/search" \\
  -H "X-API-Key: YOUR_PUBLIC_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
  "query": "search term or question",
  "limit": 10,
  "minSimilarity": 0.7
}'`;
  };

  const getSearchResponseExample = () => {
    return `{
  "success": true,
  "data": [
    {
      "_id": "record-id-1",
      "similarity": 0.92,
      // Your model fields here
    },
    {
      "_id": "record-id-2",
      "similarity": 0.85,
      // Your model fields here
    }
  ]
}`;
  };
  
  return (
    <Box>
      <Banner
        status="info"
        mb={6}
      >
        <Text>
          The search API allows you to find records using vector similarity search. This is useful for semantic search, question answering, and finding similar content.
        </Text>
      </Banner>
      
      <Tabs variant="enclosed">
        <TabList>
          <Tab><Flex align="center" gap={2}><SearchIcon size={14} /> Request Body</Flex></Tab>
          <Tab><Flex align="center" gap={2}><CodeIcon size={14} /> Private API</Flex></Tab>
          <Tab><Flex align="center" gap={2}><CodeIcon size={14} /> Public API</Flex></Tab>
          <Tab><Flex align="center" gap={2}><CodeIcon size={14} /> Response</Flex></Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel>
            <CopyableCode 
              content={getSearchRequestBody()} 
              label="Search request body structure" 
              language="json"
            />
            <Text mt={4} fontSize="sm" color="gray.500">
              <strong>query:</strong> The search term or question (required)<br />
              <strong>limit:</strong> Maximum number of results to return (default: 10)<br />
              <strong>minSimilarity:</strong> Minimum similarity threshold from 0 to 1 (default: 0.7)
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
                    content={getPrivateSearchExample()} 
                    label="Private API search example" 
                    language="javascript"
                  />
                </TabPanel>
                <TabPanel>
                  <CopyableCode 
                    content={getSearchCurlExample()} 
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
                <Tab>Query Parameters</Tab>
                <Tab>Path Parameters</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <Tabs variant="enclosed">
                    <TabList>
                      <Tab>JavaScript</Tab>
                      <Tab>cURL</Tab>
                    </TabList>
                    <TabPanels>
                      <TabPanel>
                        <CopyableCode 
                          content={getPublicSearchExample()} 
                          label="Public API search with query parameters" 
                          language="javascript"
                        />
                      </TabPanel>
                      <TabPanel>
                        <CopyableCode 
                          content={getPublicSearchCurlExample()} 
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
                          content={getPublicPathSearchExample()} 
                          label="Public API search with path parameters" 
                          language="javascript"
                        />
                      </TabPanel>
                      <TabPanel>
                        <CopyableCode 
                          content={getPublicPathSearchCurlExample()} 
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
            <CopyableCode 
              content={getSearchResponseExample()} 
              label="Example response" 
              language="json"
            />
            <Text mt={4} fontSize="sm" color="gray.500">
              The response includes a similarity score for each result, indicating how closely it matches the query.
            </Text>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
} 