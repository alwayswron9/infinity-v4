import { ModelDefinition } from '@/types/modelDefinition';
import { FormControl, FormLabel, Input, Textarea, VStack } from '@chakra-ui/react';

interface BasicInfoSectionProps {
  model: ModelDefinition;
  onChange: (updates: Partial<ModelDefinition>) => void;
}

export function BasicInfoSection({ model, onChange }: BasicInfoSectionProps) {
  return (
    <VStack spacing={4} align="stretch" width="100%">
      <FormControl id="model-name">
        <FormLabel fontWeight="medium">Model Name</FormLabel>
        <Input
          value={model.name}
          onChange={e => onChange({ name: e.target.value })}
          placeholder="e.g., Customer, Product, Order"
          required
          size="md"
        />
      </FormControl>
      
      <FormControl id="model-description">
        <FormLabel fontWeight="medium">Description</FormLabel>
        <Textarea
          value={model.description || ''}
          onChange={e => onChange({ description: e.target.value })}
          placeholder="Describe the purpose and usage of this model..."
          rows={3}
          size="md"
        />
      </FormControl>
    </VStack>
  );
} 