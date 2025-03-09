import { 
  Box, 
  Flex, 
  Divider,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Select,
  Text,
  FormLabel,
  FormHelperText,
  FormControl
} from '@chakra-ui/react';
import { 
  EmptyState,
  PropertyList,
  Property,
  Banner
} from '@saas-ui/react';
import { FilterIcon, ArrowDownIcon, CodeIcon } from 'lucide-react';
import { useModelContext } from '../../explore/components/ModelContext';
import { useState, useEffect, ChangeEvent } from 'react';
import useViewStore from '@/lib/stores/viewStore';
import type { ModelView } from '@/types/viewDefinition';
import { CopyableCode } from './CopyableCode';

export function GetApiConfig() {
  const [selectedViewId, setSelectedViewId] = useState<string>('');
  const [selectedView, setSelectedView] = useState<ModelView | null>(null);
  const { model, modelId } = useModelContext();
  
  // Get views from the store
  const views = useViewStore(state => state.views) || [];
  
  // Update selected view when view ID changes
  useEffect(() => {
    if (selectedViewId) {
      const view = views.find(v => v.id === selectedViewId);
      setSelectedView(view || null);
    } else {
      setSelectedView(null);
    }
  }, [selectedViewId, views]);
  
  // Generate API call configuration
  const getFilterConfig = () => {
    if (!selectedView?.config?.filters?.length) return '[]';
    return JSON.stringify(selectedView.config.filters, null, 2);
  };
  
  const getSortingConfig = () => {
    if (!selectedView?.config?.sorting?.length) return '[]';
    return JSON.stringify(selectedView.config.sorting, null, 2);
  };
  
  const getFullApiConfig = () => {
    const params = new URLSearchParams({
      page: '1',
      limit: '10'
    });
    
    if (selectedView?.config?.filters?.length) {
      params.append('filter', JSON.stringify(selectedView.config.filters));
    }
    
    if (selectedView?.config?.sorting?.length) {
      params.append('sorting', JSON.stringify(selectedView.config.sorting));
    }
    
    return `// API URL with query parameters
fetch('/api/data/${modelId}?${params.toString()}')
  .then(response => response.json())
  .then(data => console.log(data));

// Or with separate parameters
const params = {
  page: 1,
  limit: 10,
  filter: ${getFilterConfig()},
  sorting: ${getSortingConfig()}
};

// Then construct your fetch call with these params`;
  };

  const getCurlExample = () => {
    const params = new URLSearchParams({
      page: '1',
      limit: '10'
    });
    
    if (selectedView?.config?.filters?.length) {
      params.append('filter', JSON.stringify(selectedView.config.filters));
    }
    
    if (selectedView?.config?.sorting?.length) {
      params.append('sorting', JSON.stringify(selectedView.config.sorting));
    }
    
    return `curl -X GET \\
  "https://your-domain.com/api/data/${modelId}?${params.toString()}" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`;
  };

  const getFilterJson = () => {
    return getFilterConfig();
  };

  const getSortingJson = () => {
    return getSortingConfig();
  };

  const getResponseExample = () => {
    return `{
  "success": true,
  "data": [
    {
      "_id": "record-id-1",
      // Your model fields here
    },
    {
      "_id": "record-id-2",
      // Your model fields here
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}`;
  };

  const getSingleRecordExample = () => {
    return `// Get a single record by ID
fetch('/api/data/${modelId}?id=record-id-1')
  .then(response => response.json())
  .then(data => console.log(data));`;
  };

  const getSingleRecordCurl = () => {
    return `curl -X GET \\
  "https://your-domain.com/api/data/${modelId}?id=record-id-1" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`;
  };

  const getSingleRecordResponse = () => {
    return `{
  "success": true,
  "data": {
    "_id": "record-id-1",
    // Your model fields here
  }
}`;
  };
  
  // Handle select change
  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedViewId(e.target.value);
  };
  
  return (
    <Box>
      <Banner
        status="info"
        mb={6}
      >
        <Text>
          The GET endpoint supports both listing records with filtering/sorting and retrieving a single record by ID.
        </Text>
      </Banner>

      <Tabs variant="enclosed" mb={6}>
        <TabList>
          <Tab>List Records</Tab>
          <Tab>Get Single Record</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel>
            <Box mb={4}>
              <FormControl>
                <FormLabel>Select a view</FormLabel>
                <Select 
                  placeholder="Select a view" 
                  value={selectedViewId}
                  onChange={handleSelectChange}
                >
                  {views.map(view => (
                    <option key={view.id} value={view.id}>
                      {view.name}
                    </option>
                  ))}
                </Select>
                <FormHelperText>
                  Choose a saved view to use its filter and sorting configuration
                </FormHelperText>
              </FormControl>
            </Box>
            
            {selectedView ? (
              <Box mt={6}>
                <PropertyList>
                  <Property
                    label="View Name"
                    value={selectedView.name}
                  />
                  {selectedView.description && (
                    <Property
                      label="Description"
                      value={selectedView.description}
                    />
                  )}
                </PropertyList>

                <Divider my={4} />
                
                <Tabs variant="enclosed" mt={4}>
                  <TabList>
                    <Tab><Flex align="center" gap={2}><FilterIcon size={14} /> Filters</Flex></Tab>
                    <Tab><Flex align="center" gap={2}><ArrowDownIcon size={14} /> Sorting</Flex></Tab>
                    <Tab><Flex align="center" gap={2}><CodeIcon size={14} /> JavaScript</Flex></Tab>
                    <Tab><Flex align="center" gap={2}><CodeIcon size={14} /> cURL</Flex></Tab>
                    <Tab><Flex align="center" gap={2}><CodeIcon size={14} /> Response</Flex></Tab>
                  </TabList>
                  
                  <TabPanels>
                    <TabPanel>
                      <CopyableCode 
                        content={getFilterJson()} 
                        label="Filter configuration (JSON)" 
                        language="json"
                      />
                    </TabPanel>
                    <TabPanel>
                      <CopyableCode 
                        content={getSortingJson()} 
                        label="Sorting configuration (JSON)" 
                        language="json"
                      />
                    </TabPanel>
                    <TabPanel>
                      <CopyableCode 
                        content={getFullApiConfig()} 
                        label="JavaScript fetch example" 
                        language="javascript"
                      />
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
                        label="Example response" 
                        language="json"
                      />
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Box>
            ) : (
              <EmptyState
                title="No view selected"
                description="Select a view to see its API configuration"
                icon={FilterIcon}
                mt={6}
              />
            )}
          </TabPanel>
          <TabPanel>
            <Tabs variant="enclosed">
              <TabList>
                <Tab>JavaScript</Tab>
                <Tab>cURL</Tab>
                <Tab>Response</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <CopyableCode 
                    content={getSingleRecordExample()} 
                    label="Get a single record by ID" 
                    language="javascript"
                  />
                </TabPanel>
                <TabPanel>
                  <CopyableCode 
                    content={getSingleRecordCurl()} 
                    label="cURL example" 
                    language="bash"
                  />
                </TabPanel>
                <TabPanel>
                  <CopyableCode 
                    content={getSingleRecordResponse()} 
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