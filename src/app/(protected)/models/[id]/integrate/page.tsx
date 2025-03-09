'use client';

import { 
  Box, 
  Stack, 
  Flex, 
  Spinner,
  Code,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  useClipboard,
  Select,
  Text,
  Heading,
  Divider,
  Card,
  CardHeader,
  CardBody,
  VStack,
  HStack
} from '@chakra-ui/react';
import { Section } from '@/components/layout/Section';
import { CheckIcon, CopyIcon } from 'lucide-react';
import { useModelContext } from '../explore/components/ModelContext';
import { useState, useEffect } from 'react';
import useViewStore from '@/lib/stores/viewStore';
import type { ModelView } from '@/types/viewDefinition';

// Copyable code block component
function CopyableCode({ content, label }: { content: string, label?: string }) {
  const { hasCopied, onCopy } = useClipboard(content);
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box position="relative" mb={4}>
      {label && (
        <Text fontSize="sm" fontWeight="medium" mb={1} color="gray.500">
          {label}
        </Text>
      )}
      <Box
        position="relative"
        bg={bgColor}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="md"
        p={4}
        pr={12}
        overflowX="auto"
      >
        <Code
          display="block"
          whiteSpace="pre"
          overflowX="auto"
          bg="transparent"
          p={0}
          fontSize="sm"
          fontFamily="mono"
        >
          {content}
        </Code>
        <Button
          position="absolute"
          top={2}
          right={2}
          size="sm"
          variant="ghost"
          onClick={onCopy}
          aria-label="Copy code"
          leftIcon={hasCopied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
        >
          {hasCopied ? 'Copied' : 'Copy'}
        </Button>
      </Box>
    </Box>
  );
}

// View Configuration Copy Component
function ViewConfigCopy() {
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
  
  return (
    <Card variant="outline" mb={6}>
      <CardHeader>
        <Heading size="md">View Configuration for API Calls</Heading>
        <Text mt={2} color="gray.500">
          Select a view to copy its filter and sorting configuration for API calls
        </Text>
      </CardHeader>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <Select 
            placeholder="Select a view" 
            value={selectedViewId}
            onChange={(e) => setSelectedViewId(e.target.value)}
          >
            {views.map(view => (
              <option key={view.id} value={view.id}>
                {view.name}
              </option>
            ))}
          </Select>
          
          {selectedView && (
            <>
              <Divider my={2} />
              
              <Heading size="sm" mb={2}>Filter Configuration</Heading>
              <CopyableCode 
                content={getFilterConfig()} 
                label="filter parameter" 
              />
              
              <Heading size="sm" mb={2}>Sorting Configuration</Heading>
              <CopyableCode 
                content={getSortingConfig()} 
                label="sorting parameter" 
              />
              
              <Heading size="sm" mb={2}>Complete API Call Example</Heading>
              <CopyableCode 
                content={getFullApiConfig()} 
                label="API call with configuration" 
              />
            </>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
}

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
          <AlertTitle>Error loading model</AlertTitle>
          <AlertDescription>{error || 'Model not found'}</AlertDescription>
        </Alert>
      </Section>
    );
  }

  return (
    <Section>
      <Stack spacing={6}>
        <Heading as="h1" size="lg">
          Integrate with {model.name}
        </Heading>
        
        <Text>
          Use these code snippets to integrate with your {model.name} model.
        </Text>
        
        {/* View Configuration Copy Tool */}
        <ViewConfigCopy />
        
        {/* Rest of your integration code examples */}
        {/* ... */}
      </Stack>
    </Section>
  );
} 