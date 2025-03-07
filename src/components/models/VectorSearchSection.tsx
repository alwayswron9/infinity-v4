import { InfoIcon } from 'lucide-react';
import { ModelDefinition, FieldDefinition } from '@/types/modelDefinition';
import {
  Box,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Text,
  VStack,
  Badge,
  Alert,
  AlertIcon,
  AlertDescription,
  Stack,
  Button
} from '@chakra-ui/react';

interface VectorSearchSectionProps {
  model: ModelDefinition;
  onChange: (updates: Partial<ModelDefinition>) => void;
}

export function VectorSearchSection({ model, onChange }: VectorSearchSectionProps) {
  const toggleVectorSearch = (enabled: boolean) => {
    onChange({
      embedding: {
        enabled,
        source_fields: enabled ? (model.embedding?.source_fields || []) : []
      }
    });
  };

  const toggleSourceField = (fieldName: string) => {
    const currentSourceFields = model.embedding?.source_fields || [];
    const newSourceFields = currentSourceFields.includes(fieldName)
      ? currentSourceFields.filter((f: string) => f !== fieldName)
      : [...currentSourceFields, fieldName];

    onChange({
      embedding: {
        enabled: model.embedding?.enabled ?? false,
        source_fields: newSourceFields
      }
    });
  };

  return (
    <Stack spacing={4} width="100%">
      <Alert status="info" variant="subtle" borderRadius="md">
        <AlertIcon />
        <AlertDescription>
          Enable semantic search using OpenAI embeddings
        </AlertDescription>
      </Alert>

      <FormControl>
        <Checkbox
          isChecked={model.embedding?.enabled}
          onChange={e => toggleVectorSearch(e.target.checked)}
          size="md"
          colorScheme="brand"
        >
          Enable vector search for this model
        </Checkbox>
      </FormControl>

      {model.embedding?.enabled && (
        <Box mt={2}>
          <FormLabel mb={3} fontWeight="medium">Select fields to include in vector search:</FormLabel>
          <Stack spacing={2} pl={2}>
            {Object.entries(model.fields)
              .filter(([_, field]) => field.type === 'string')
              .map(([name, field]) => (
                <Checkbox
                  key={field.id}
                  isChecked={model.embedding?.source_fields?.includes(name)}
                  onChange={() => toggleSourceField(name)}
                  size="md"
                  colorScheme="brand"
                >
                  {name}
                  {field.description && (
                    <Text as="span" fontSize="sm" color="gray.500" ml={2}>
                      ({field.description})
                    </Text>
                  )}
                </Checkbox>
              ))}
          </Stack>
          
          {Object.entries(model.fields).filter(([_, field]) => field.type === 'string').length === 0 && (
            <Alert status="warning" variant="subtle" mt={2} borderRadius="md">
              <AlertIcon />
              <AlertDescription>
                No string fields available. Add string fields to enable vector search.
              </AlertDescription>
            </Alert>
          )}
        </Box>
      )}
    </Stack>
  );
} 