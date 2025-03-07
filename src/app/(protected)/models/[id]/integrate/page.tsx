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
  useClipboard
} from '@chakra-ui/react';
import { Section } from '@/components/layout/Section';
import { CheckIcon, CopyIcon } from 'lucide-react';
import { useModelContext } from '../explore/components/ModelContext';

// Copyable code block component
function CopyableCode({ content, label }: { content: string, label?: string }) {
  const { hasCopied, onCopy } = useClipboard(content);
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.300');
  
  return (
    <Box position="relative">
      {label && (
        <Box fontWeight="medium" fontSize="sm" mb={2}>
          {label}
        </Box>
      )}
      <Code 
        display="block" 
        p={4} 
        pt={12} // Extra padding for the copy button
        bg={bgColor}
        color={textColor}
        borderRadius="md"
        whiteSpace="pre"
        overflow="auto"
        fontSize="sm"
      >
        {content}
      </Code>
      <Button
        position="absolute"
        top={2}
        right={2}
        size="sm"
        onClick={onCopy}
        leftIcon={hasCopied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
      >
        {hasCopied ? 'Copied' : 'Copy'}
      </Button>
    </Box>
  );
}

export default function IntegratePage() {
  // Use the shared model context with the new hook
  const { model, loading } = useModelContext();

  if (loading || !model) {
    return (
      <Flex justify="center" align="center" py={16}>
        <Spinner color="brand.500" size="xl" />
      </Flex>
    );
  }

  // Define curl commands for easy copying
  const curlCommands = {
    create: `curl -X POST \\
  https://api.infinity.app/v1/models/${model.name}/records \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    // Add your fields here
  }'`,
    get: `curl -X GET \\
  https://api.infinity.app/v1/models/${model.name}/records/RECORD_ID \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
    update: `curl -X PUT \\
  https://api.infinity.app/v1/models/${model.name}/records/RECORD_ID \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    // Update your fields here
  }'`,
    delete: `curl -X DELETE \\
  https://api.infinity.app/v1/models/${model.name}/records/RECORD_ID \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
    vectorSearch: model.embedding?.enabled ? `curl -X POST \\
  https://api.infinity.app/v1/models/${model.name}/vector-search \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "your search query",
    "limit": 10
  }'` : ''
  };

  return (
    <Box>
      {/* API Integration */}
      <Section title="API Reference" description="Use these commands to interact with your model via our REST API.">
        <Stack spacing={6}>
          <CopyableCode label="Create Record" content={curlCommands.create} />
          <CopyableCode label="Get Record" content={curlCommands.get} />
          <CopyableCode label="Update Record" content={curlCommands.update} />
          <CopyableCode label="Delete Record" content={curlCommands.delete} />
          {model.embedding?.enabled && (
            <CopyableCode label="Vector Search" content={curlCommands.vectorSearch} />
          )}
        </Stack>
      </Section>
      
      {/* Documentation Section */}
      <Section title="API Documentation" description="Review our full API documentation for more details and examples.">
        <Alert status="info" variant="subtle" borderRadius="md">
          <AlertIcon />
          <Stack>
            <AlertTitle>Looking for more examples?</AlertTitle>
            <AlertDescription>
              Check out our complete API documentation for detailed usage examples and guides.
            </AlertDescription>
            <Button size="sm" colorScheme="brand" alignSelf="flex-start" mt={2} width="auto">
              View Documentation
            </Button>
          </Stack>
        </Alert>
      </Section>
    </Box>
  );
} 