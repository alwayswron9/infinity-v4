import { useState, useEffect } from 'react';
import { type ModelDefinition, type FieldDefinition } from '@/types/modelDefinition';
import {
  Box,
  Button,
  Flex,
  useColorModeValue
} from '@chakra-ui/react';
import { 
  Form, 
  FormLayout, 
  Field, 
  SubmitButton,
  SwitchField,
  NumberInputField,
  TextareaField
} from '@saas-ui/react';
import { toast } from 'sonner';

interface SaasUIModelDataFormProps {
  model: ModelDefinition;
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  onCancel: () => void;
  submitButtonText?: string;
  readOnly?: boolean;
}

export function SaasUIModelDataForm({ 
  model, 
  initialData, 
  onSubmit, 
  onCancel,
  submitButtonText = 'Add Data',
  readOnly = false
}: SaasUIModelDataFormProps) {
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

  // Prepare initial form data
  const prepareInitialData = () => {
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
    return initialFormData;
  };

  const handleFormSubmit = async (data: Record<string, any>) => {
    if (readOnly) return;
    
    setLoading(true);

    try {
      await onSubmit(data);
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

  // Determine the appropriate field type based on content length and field type
  const getFieldType = (fieldName: string, field: FieldDefinition) => {
    const value = initialData?.[fieldName];
    const stringLength = typeof value === 'string' ? value.length : 0;
    
    switch (field.type) {
      case 'string':
        // Use textarea for longer content or if multiline is specified
        if (stringLength > 100 || (field as any).multiline) {
          return 'textarea';
        }
        return 'text';
      case 'number':
        return 'number';
      case 'boolean':
        return 'switch';
      case 'date':
        return 'date';
      default:
        return 'text';
    }
  };

  return (
    <Box>
      <Form
        defaultValues={prepareInitialData()}
        onSubmit={handleFormSubmit}
        disabled={readOnly}
      >
        {({ formState }) => (
          <>
            <FormLayout spacing="6">
              {modelFields.map(([fieldName, field]) => {
                const fieldType = getFieldType(fieldName, field);
                const isRequired = field.required || false;
                const label = (field as any).label || fieldName;
                const helpText = field.description;
                
                // Common props for all field types
                const commonProps = {
                  name: fieldName,
                  label,
                  isRequired,
                  help: helpText,
                  isDisabled: readOnly,
                };
                
                switch (fieldType) {
                  case 'textarea':
                    return (
                      <TextareaField
                        key={fieldName}
                        {...commonProps}
                        placeholder={(field as any).placeholder || ''}
                        rows={4}
                      />
                    );
                  case 'number':
                    return (
                      <NumberInputField
                        key={fieldName}
                        {...commonProps}
                        type="number"
                        min={(field as any).min}
                        max={(field as any).max}
                        step={(field as any).step || 1}
                      />
                    );
                  case 'switch':
                    return (
                      <SwitchField
                        key={fieldName}
                        {...commonProps}
                      />
                    );
                  case 'date':
                    return (
                      <Field
                        key={fieldName}
                        {...commonProps}
                        type="text"
                        placeholder="YYYY-MM-DD"
                      />
                    );
                  default:
                    return (
                      <Field
                        key={fieldName}
                        {...commonProps}
                        type="text"
                        placeholder={(field as any).placeholder || ''}
                      />
                    );
                }
              })}
            </FormLayout>
            
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
                <SubmitButton
                  colorScheme="brand"
                  size="md"
                  isLoading={loading}
                >
                  {submitButtonText}
                </SubmitButton>
              )}
            </Flex>
          </>
        )}
      </Form>
    </Box>
  );
} 