import { InfoIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';
import { ModelDefinition, FieldType, CreatableFieldDefinition, FieldDefinition } from '@/types/modelDefinition';
import { toast } from 'react-hot-toast';
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Input,
  Select,
  Table,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tooltip,
  Tr,
  VStack,
  Alert,
  AlertIcon,
  AlertDescription
} from '@chakra-ui/react';

const FIELD_TYPES = {
  string: 'String',
  number: 'Number',
  boolean: 'Boolean',
  date: 'Date',
} as const;

type FieldTypes = keyof typeof FIELD_TYPES;

type Field = {
  id: string;
  name: string;
  type: FieldTypes;
  required: boolean;
  unique: boolean;
  description?: string;
};

interface FieldsSectionProps {
  model: ModelDefinition;
  onChange: (updates: Partial<ModelDefinition>) => void;
}

export function FieldsSection({ model, onChange }: FieldsSectionProps) {
  const [newField, setNewField] = useState<Field>({
    id: crypto.randomUUID(),
    name: '',
    type: 'string',
    required: false,
    unique: false,
  });

  const addField = () => {
    if (!newField.name.trim()) {
      toast.error('Field name is required');
      return;
    }

    if (model.fields[newField.name]) {
      toast.error('Field name must be unique');
      return;
    }

    onChange({
      fields: {
        ...model.fields,
        [newField.name]: {
          id: newField.id,
          type: newField.type,
          required: newField.required,
          unique: newField.unique,
          description: newField.description,
        }
      }
    });

    setNewField({
      id: crypto.randomUUID(),
      name: '',
      type: 'string',
      required: false,
      unique: false,
    });
  };

  const removeField = (fieldName: string) => {
    const fields = { ...model.fields };
    delete fields[fieldName];
    onChange({ fields });
  };

  const updateField = (oldName: string, newName: string, updates: Partial<CreatableFieldDefinition>) => {
    const fields = { ...model.fields };
    const field = fields[oldName];
    if (!field) return;

    delete fields[oldName];
    fields[newName] = { ...field, ...updates };
    onChange({ fields });
  };

  return (
    <VStack spacing={4} align="stretch" width="100%">
      <Alert status="info" variant="subtle" borderRadius="md">
        <AlertIcon />
        <AlertDescription>
          Vector fields are handled automatically by the platform
        </AlertDescription>
      </Alert>
      
      {/* Existing Fields */}
      {Object.entries(model.fields).length > 0 ? (
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Type</Th>
              <Th>Required</Th>
              <Th>Unique</Th>
              <Th>Description</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {Object.entries(model.fields).map(([name, field]) => (
              <Tr key={field.id}>
                <Td>
                  <Input
                    size="sm"
                    value={name}
                    onChange={(e) => {
                      if (e.target.value && e.target.value !== name) {
                        updateField(name, e.target.value, {});
                      }
                    }}
                  />
                </Td>
                <Td>
                  <Select
                    size="sm"
                    value={field.type}
                    onChange={(e) => updateField(name, name, { type: e.target.value as FieldTypes })}
                  >
                    {Object.entries(FIELD_TYPES).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </Td>
                <Td>
                  <Checkbox
                    isChecked={field.required}
                    onChange={(e) => updateField(name, name, { required: e.target.checked })}
                  />
                </Td>
                <Td>
                  <Checkbox
                    isChecked={field.unique}
                    onChange={(e) => updateField(name, name, { unique: e.target.checked })}
                  />
                </Td>
                <Td>
                  <Input
                    size="sm"
                    value={field.description || ''}
                    onChange={(e) => updateField(name, name, { description: e.target.value })}
                    placeholder="Description (optional)"
                  />
                </Td>
                <Td textAlign="right">
                  <IconButton
                    aria-label="Remove field"
                    icon={<TrashIcon size={16} />}
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => removeField(name)}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : (
        <Box py={4} textAlign="center" bg="gray.50" rounded="md" borderWidth="1px" borderStyle="dashed" _dark={{ bg: "gray.700" }}>
          <Text color="gray.500">No fields defined yet. Add your first field below.</Text>
        </Box>
      )}

      {/* Add Field Form */}
      <Box p={4} bg="gray.50" rounded="md" borderWidth="1px" _dark={{ bg: "gray.700" }}>
        <HStack spacing={4} align="flex-end">
          <FormControl flex="2">
            <FormLabel fontSize="sm" fontWeight="medium">Field Name</FormLabel>
            <Input
              value={newField.name}
              onChange={e => setNewField(prev => ({ ...prev, name: e.target.value }))}
              placeholder="New field name"
              size="md"
            />
          </FormControl>
          
          <FormControl flex="1">
            <FormLabel fontSize="sm" fontWeight="medium">Type</FormLabel>
            <Select
              value={newField.type}
              onChange={e => setNewField(prev => ({ ...prev, type: e.target.value as FieldTypes }))}
              size="md"
            >
              {Object.entries(FIELD_TYPES).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </FormControl>
          
          <FormControl flex="1">
            <HStack spacing={4} mt={2}>
              <Checkbox
                isChecked={newField.required}
                onChange={e => setNewField(prev => ({ ...prev, required: e.target.checked }))}
              >
                Required
              </Checkbox>
              
              <Checkbox
                isChecked={newField.unique}
                onChange={e => setNewField(prev => ({ ...prev, unique: e.target.checked }))}
              >
                Unique
              </Checkbox>
            </HStack>
          </FormControl>
          
          <Button
            size="sm"
            colorScheme="brand"
            onClick={addField}
          >
            Add Field
          </Button>
        </HStack>
        
        <FormControl mt={4}>
          <FormLabel fontSize="sm" fontWeight="medium">Description (optional)</FormLabel>
          <Textarea
            value={newField.description || ''}
            onChange={e => setNewField(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Enter a description for this field"
            size="md"
            rows={2}
          />
        </FormControl>
      </Box>
    </VStack>
  );
} 