import { useState, useEffect } from 'react';
import { type ModelDefinition, type FieldDefinition } from '@/types/modelDefinition';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
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

  const renderField = (fieldName: string, field: FieldDefinition) => {
    // Skip system fields
    if (fieldName.startsWith('_')) return null;

    const handleChange = (value: any) => {
      if (readOnly) return;
      setFormData(prev => ({ ...prev, [fieldName]: value }));
    };

    const commonInputProps = {
      disabled: readOnly,
      className: cn(
        readOnly && "opacity-90 bg-muted/50 border-0"
      )
    };

    const isLink = typeof formData[fieldName] === 'string' && 
                  (formData[fieldName].startsWith('http://') || 
                   formData[fieldName].startsWith('https://'));

    switch (field.type) {
      case 'string':
        return (
          <div key={fieldName} className="space-y-1.5">
            <Label htmlFor={fieldName} className="text-sm font-medium text-muted-foreground">
              {fieldName}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <div className="relative">
              <Input
                id={fieldName}
                type="text"
                value={formData[fieldName] || ''}
                onChange={e => handleChange(e.target.value)}
                required={field.required}
                placeholder={field.description}
                {...commonInputProps}
              />
              {readOnly && isLink && formData[fieldName] && (
                <a 
                  href={formData[fieldName]} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
            {field.description && (
              <p className="text-xs text-muted-foreground mt-1">{field.description}</p>
            )}
          </div>
        );

      case 'number':
        return (
          <div key={fieldName} className="space-y-1.5">
            <Label htmlFor={fieldName} className="text-sm font-medium text-muted-foreground">
              {fieldName}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={fieldName}
              type="number"
              value={formData[fieldName] || ''}
              onChange={e => handleChange(Number(e.target.value))}
              required={field.required}
              placeholder={field.description}
              {...commonInputProps}
            />
            {field.description && (
              <p className="text-xs text-muted-foreground mt-1">{field.description}</p>
            )}
          </div>
        );

      case 'boolean':
        return (
          <div key={fieldName} className="flex items-center justify-between py-2">
            <div>
              <Label htmlFor={fieldName} className="text-sm font-medium">
                {fieldName}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              {field.description && (
                <p className="text-xs text-muted-foreground mt-0.5">{field.description}</p>
              )}
            </div>
            <Switch
              id={fieldName}
              checked={formData[fieldName] || false}
              onCheckedChange={handleChange}
              disabled={readOnly}
              className={cn(readOnly && "cursor-not-allowed")}
            />
          </div>
        );

      case 'date':
        return (
          <div key={fieldName} className="space-y-1.5">
            <Label htmlFor={fieldName} className="text-sm font-medium text-muted-foreground">
              {fieldName}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData[fieldName] && "text-muted-foreground",
                    readOnly && "opacity-90 bg-muted/50 border-0 cursor-default"
                  )}
                  disabled={readOnly}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData[fieldName] ? format(formData[fieldName], 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              {!readOnly && (
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData[fieldName]}
                    onSelect={handleChange}
                    initialFocus
                  />
                </PopoverContent>
              )}
            </Popover>
            {field.description && (
              <p className="text-xs text-muted-foreground mt-1">{field.description}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Group fields by type for display
  const fieldsByType = modelFields.reduce((acc, [fieldName, field]) => {
    if (!acc[field.type]) acc[field.type] = [];
    acc[field.type].push([fieldName, field]);
    return acc;
  }, {} as Record<string, [string, FieldDefinition][]>);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Display fields in a clean two-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modelFields.map(([fieldName, field]) => (
          <div key={fieldName} className={cn(
            field.type === 'boolean' && "col-span-2",
            field.type === 'date' && "col-span-2 md:col-span-1"
          )}>
            {renderField(fieldName, field)}
          </div>
        ))}
      </div>

      {!readOnly && (
        <div className="flex items-center justify-end space-x-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Processing...' : submitButtonText}
          </Button>
        </div>
      )}
    </form>
  );
} 