import { useState, useEffect } from 'react';
import { type ModelDefinition, type FieldDefinition } from '@/types/modelDefinition';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormHelperText,
  FormErrorMessage,
  Input,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Switch,
  VStack,
  HStack,
  Text,
  Flex,
  Select,
  Checkbox,
  useColorModeValue
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ModelDataFormProps {
  model: ModelDefinition;
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  onCancel: () => void;
  submitButtonText?: string;
  readOnly?: boolean;
}

export function ModelDataForm({ 
  model, 
  initialData, 
  onSubmit, 
  onCancel,
  submitButtonText = 'Add Data',
  readOnly = false
}: ModelDataFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  // Helper function to get initial value based on field type
  const getInitialValue = (field: FieldDefinition, existingValue?: any) => {
    // If we have an existing value, use it
    if (existingValue !== undefined) return existingValue;
    
    // Otherwise use default value based on type
    switch (field.type) {
      case 'string':
        return field.default || '';
      case 'number':
        return field.default || 0;
      case 'boolean':
        return field.default || false;
      case 'date':
        return field.default || null;
      default:
        return '';
    }
  };

  // Initialize form data with initial or default values
  useEffect(() => {
    const initialFormData: Record<string, any> = {};
    Object.entries(model.fields).forEach(([fieldName, field]) => {
      // Skip system fields (starting with underscore)
      if (!fieldName.startsWith('_')) {
        // Use initialData if provided, otherwise use default
        initialFormData[fieldName] = getInitialValue(
          field, 
          initialData ? initialData[fieldName] : undefined
        );
      }
    });
    setFormData(initialFormData);
  }, [model, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    
    setLoading(true);

    try {
      await onSubmit(formData);
      toast.success(initialData ? 'Record updated successfully' : 'Data added successfully');
      onCancel(); // Close the drawer
    } catch (error) {
      toast.error(initialData ? 'Failed to update record' : 'Failed to add data');
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get all fields from the model definition, excluding system fields
  const modelFields = Object.entries(model.fields)
    .filter(([fieldName]) => !fieldName.startsWith('_'))
    .sort((a, b) => {
      // Sort by required first, then by field name
      const aRequired = a[1].required || false;
      const bRequired = b[1].required || false;
      
      if (aRequired && !bRequired) return -1;
      if (!aRequired && bRequired) return 1;
      
      return a[0].localeCompare(b[0]);
    });

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack spacing="5" align="stretch" mb="6">
        {modelFields.map(([fieldName, field]) => {
          const value = formData[fieldName];
          const isRequired = field.required || false;
          
          return (
            <FormControl 
              key={fieldName} 
              isRequired={isRequired}
              isDisabled={readOnly}
            >
              <FormLabel 
                htmlFor={fieldName}
                color="gray.200"
                fontSize="sm"
                fontWeight="medium"
              >
                {(field as any).label || fieldName}
              </FormLabel>

              {field.type === 'string' && (
                (field as any).multiline ? (
                  <Textarea
                    id={fieldName}
                    value={value || ''}
                    onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                    placeholder={(field as any).placeholder || field.description || ''}
                    size="md"
                    bg="gray.800"
                    color="gray.100"
                    borderColor="gray.700"
                    _hover={{ borderColor: "gray.600" }}
                    _focus={{ borderColor: "brand.500" }}
                    rows={4}
                  />
                ) : (
                  <Input
                    id={fieldName}
                    type="text"
                    value={value || ''}
                    onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                    placeholder={(field as any).placeholder || field.description || ''}
                    bg="gray.800"
                    color="gray.100"
                    borderColor="gray.700"
                    _hover={{ borderColor: "gray.600" }}
                    _focus={{ borderColor: "brand.500" }}
                  />
                )
              )}

              {field.type === 'number' && (
                <NumberInput
                  id={fieldName}
                  value={value}
                  onChange={(valueString) => handleFieldChange(fieldName, parseFloat(valueString))}
                  min={(field as any).min}
                  max={(field as any).max}
                  step={(field as any).step || 1}
                  bg="gray.800"
                  borderColor="gray.700"
                >
                  <NumberInputField 
                    color="gray.100"
                    _hover={{ borderColor: "gray.600" }}
                    _focus={{ borderColor: "brand.500" }}
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper color="gray.400" />
                    <NumberDecrementStepper color="gray.400" />
                  </NumberInputStepper>
                </NumberInput>
              )}

              {field.type === 'boolean' && (
                <Switch
                  id={fieldName}
                  isChecked={value}
                  onChange={(e) => handleFieldChange(fieldName, e.target.checked)}
                  colorScheme="brand"
                  size="md"
                />
              )}

              {field.description && (
                <FormHelperText color="gray.400" fontSize="xs">
                  {field.description}
                </FormHelperText>
              )}
            </FormControl>
          );
        })}
      </VStack>

      <Flex justifyContent="flex-end" gap="3" mt="8">
        <Button
          onClick={onCancel}
          variant="ghost"
          size="md"
          colorScheme="gray"
          mr={3}
          isDisabled={loading}
        >
          Cancel
        </Button>

        {!readOnly && (
          <Button
            type="submit"
            isLoading={loading}
            colorScheme="brand"
            size="md"
          >
            {submitButtonText}
          </Button>
        )}
      </Flex>
    </Box>
  );
} 