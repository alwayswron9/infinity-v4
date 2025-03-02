import { ModelCard } from '@/components/models/ModelCard';
import { EmptyState } from '@/components/models/EmptyState';
import { type ModelDefinition } from '@/types/modelDefinition';
import { 
  Box,
  SimpleGrid,
  VStack,
} from '@chakra-ui/react';

// Extend the ModelDefinition type to include recordCount
interface ModelWithStats extends ModelDefinition {
  recordCount: number;
}

interface ModelsGridProps {
  models: ModelWithStats[];
  loading: boolean;
  error: string | null;
  onAddData: (modelId: string) => void;
  onArchiveToggle: (modelId: string, currentStatus: string) => Promise<void>;
  onClearData: (modelId: string, modelName: string) => Promise<void>;
  onDelete: (modelId: string) => Promise<void>;
}

export function ModelsGrid({
  models,
  loading,
  error,
  onAddData,
  onArchiveToggle,
  onClearData,
  onDelete
}: ModelsGridProps) {
  // Loading and error states are now handled by the parent component
  
  if (models.length === 0) {
    return <EmptyState />;
  }

  return (
    <SimpleGrid 
      columns={{ base: 1, md: 2, lg: 3, xl: 4, "2xl": 5 }}
      spacing={4}
      width="100%"
    >
      {models.map((model) => (
        <Box key={model.id}>
          <ModelCard
            model={model}
            onAddData={onAddData}
            onArchiveToggle={onArchiveToggle}
            onClearData={onClearData}
            onDelete={onDelete}
          />
        </Box>
      ))}
    </SimpleGrid>
  );
} 