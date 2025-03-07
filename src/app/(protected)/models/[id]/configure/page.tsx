'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Box, Spinner, Flex, Button, Icon } from '@chakra-ui/react';
import { SaveIcon } from 'lucide-react';

import { 
  ModelDefinition, 
  UpdateModelDefinitionInput, 
  CreatableFieldDefinition,
  FieldDefinition 
} from '@/types/modelDefinition';
import { Section } from '@/components/layout/Section';
import { BasicInfoSection } from '@/components/models/BasicInfoSection';
import { FieldsSection } from '@/components/models/FieldsSection';
import { VectorSearchSection } from '@/components/models/VectorSearchSection';
import { useModelContext } from '../explore/components/ModelContext';

export default function ConfigurePage() {
  const router = useRouter();
  
  // Use the shared model context with the new hook
  const { model: contextModel, modelId, loading: modelLoading, refreshModel } = useModelContext();
  
  // Local state for the model (to allow editing without affecting the shared context model)
  const [submitting, setSubmitting] = useState(false);
  const [model, setModel] = useState<ModelDefinition | null>(null);

  // Update local model when context model changes
  useEffect(() => {
    if (contextModel) {
      setModel(contextModel);
    }
  }, [contextModel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!model) return;

    if (Object.keys(model.fields).length === 0) {
      toast.error('Add at least one field to your model');
      return;
    }

    setSubmitting(true);
    try {
      // Filter out any vector fields before updating
      const fields: Record<string, CreatableFieldDefinition> = {};
      const entries = Object.entries(model.fields) as [string, FieldDefinition][];
      for (const [name, field] of entries) {
        if (field.type !== 'vector') {
          const { type, id, required, unique, description, default: defaultValue, enum: enumValues, foreign_key } = field;
          if (type === 'string' || type === 'number' || type === 'boolean' || type === 'date') {
            fields[name] = {
              type,
              id,
              required,
              unique,
              description,
              default: defaultValue,
              enum: enumValues,
              foreign_key,
            };
          }
        }
      }

      const updateData: UpdateModelDefinitionInput = {
        name: model.name,
        description: model.description,
        fields,
        embedding: model.embedding,
        relationships: model.relationships,
        indexes: model.indexes
      };

      const response = await fetch(`/api/models?id=${modelId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to update model');
      }

      toast.success('Model updated successfully');
      refreshModel(); // Refresh the model in the context
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (modelLoading || !model) {
    return (
      <Flex justify="center" align="center" py={16}>
        <Spinner color="brand.500" size="xl" />
      </Flex>
    );
  }

  return (
    <Box>
      {/* Action buttons */}
      <Flex justify="flex-end" mb={4}>
        <Button
          type="submit"
          form="model-form"
          isLoading={submitting}
          loadingText="Saving..."
          colorScheme="brand"
          leftIcon={<Icon as={SaveIcon} boxSize={4} />}
          isDisabled={submitting || (model.embedding?.enabled && (!model.embedding.source_fields || model.embedding.source_fields.length === 0))}
        >
          Save Changes
        </Button>
      </Flex>
      
      {/* Configure Form */}
      <form id="model-form" onSubmit={handleSubmit}>
        <Section title="Basic Information">
          <BasicInfoSection 
            model={model} 
            onChange={(updates: Partial<ModelDefinition>) => setModel((prev: ModelDefinition | null) => prev ? { ...prev, ...updates } : null)} 
          />
        </Section>
        
        <Section title="Fields">
          <FieldsSection 
            model={model} 
            onChange={(updates: Partial<ModelDefinition>) => setModel((prev: ModelDefinition | null) => prev ? { ...prev, ...updates } : null)} 
          />
        </Section>
        
        <Section title="Vector Search">
          <VectorSearchSection 
            model={model} 
            onChange={(updates: Partial<ModelDefinition>) => setModel((prev: ModelDefinition | null) => prev ? { ...prev, ...updates } : null)} 
          />
        </Section>
      </form>
    </Box>
  );
} 