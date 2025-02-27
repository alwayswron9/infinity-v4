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
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ModelDataFormProps {
  model: ModelDefinition;
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  onCancel: () => void;
  submitButtonText?: string;
}

export function ModelDataForm({ 
  model, 
  initialData, 
  onSubmit, 
  onCancel,
  submitButtonText = 'Add Data'
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

  const renderField = (fieldName: string, field: FieldDefinition) => {
    // Skip system fields
    if (fieldName.startsWith('_')) return null;

    const handleChange = (value: any) => {
      setFormData(prev => ({ ...prev, [fieldName]: value }));
    };

    switch (field.type) {
      case 'string':
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName}>
              {fieldName}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={fieldName}
              type="text"
              value={formData[fieldName] || ''}
              onChange={e => handleChange(e.target.value)}
              required={field.required}
              placeholder={field.description}
            />
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
          </div>
        );

      case 'number':
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName}>
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
            />
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
          </div>
        );

      case 'boolean':
        return (
          <div key={fieldName} className="flex items-center justify-between space-x-2">
            <Label htmlFor={fieldName}>
              {fieldName}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Switch
              id={fieldName}
              checked={formData[fieldName] || false}
              onCheckedChange={handleChange}
            />
          </div>
        );

      case 'date':
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName}>
              {fieldName}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData[fieldName] && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData[fieldName] ? format(formData[fieldName], 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData[fieldName]}
                  onSelect={handleChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {Object.entries(model.fields).map(([fieldName, field]) => (
        renderField(fieldName, field)
      ))}

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
    </form>
  );
} 