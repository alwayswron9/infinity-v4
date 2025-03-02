import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Info } from 'lucide-react';
import { 
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  FormControl,
  FormLabel,
  Select,
  Input,
  VStack,
  HStack,
  Box,
  Text,
  IconButton,
  useColorModeValue,
  Divider,
  ButtonGroup,
  Flex,
  Alert,
  AlertIcon,
  Icon
} from '@chakra-ui/react';
import type { ModelView as ModelViewType, ViewFilterConfig } from '@/types/viewDefinition';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: ModelViewType;
  onConfigChange: (config: any) => void;
}

const FILTER_OPERATORS: { value: ViewFilterConfig['operator']; label: string }[] = [
  { value: 'equals', label: 'Equals' },
  { value: 'notEquals', label: 'Not Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'notContains', label: 'Not Contains' },
  { value: 'startsWith', label: 'Starts With' },
  { value: 'endsWith', label: 'Ends With' },
  { value: 'gt', label: 'Greater Than' },
  { value: 'gte', label: 'Greater Than or Equal' },
  { value: 'lt', label: 'Less Than' },
  { value: 'lte', label: 'Less Than or Equal' },
  { value: 'isNull', label: 'Is Empty' },
  { value: 'isNotNull', label: 'Is Not Empty' }
];

// Operators that don't require a value input
const NO_VALUE_OPERATORS = ['isNull', 'isNotNull'];

export function FilterDrawer({ 
  isOpen, 
  onClose, 
  currentView,
  onConfigChange 
}: FilterDrawerProps) {
  const [filters, setFilters] = useState<ViewFilterConfig[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Get available fields from the current view's columns
  const availableFields = React.useMemo(() => {
    if (!currentView || !currentView.config || !currentView.config.columns) return [];
    return currentView.config.columns.map(col => col.field);
  }, [currentView]);

  // Get current filters from the view config
  const currentFilters = React.useMemo(() => {
    if (!currentView || !currentView.config || !currentView.config.filters) return [];
    return currentView.config.filters;
  }, [currentView]);

  // Sort available fields for better UX
  const sortedAvailableFields = React.useMemo(() => {
    // Filter out any empty field names and sort alphabetically
    return [...availableFields]
      .filter(field => field && field.trim() !== '')
      .sort((a, b) => {
        // Sort system fields (starting with _) to the end
        if (a.startsWith('_') && !b.startsWith('_')) return 1;
        if (!a.startsWith('_') && b.startsWith('_')) return -1;
        return a.localeCompare(b);
      });
  }, [availableFields]);

  // Initialize filters from props
  useEffect(() => {
    if (currentFilters && currentFilters.length > 0) {
      setFilters([...currentFilters]);
    } else {
      // Initialize with one empty filter if none exist
      setFilters([createEmptyFilter()]);
    }
    setHasChanges(false);
  }, [currentFilters, sortedAvailableFields]);

  // Create an empty filter object
  const createEmptyFilter = (): ViewFilterConfig => ({
    field: sortedAvailableFields.length > 0 ? sortedAvailableFields[0] : '',
    operator: 'contains',
    value: '',
    conjunction: 'and'
  });

  // Add a new filter
  const handleAddFilter = () => {
    setFilters([...filters, createEmptyFilter()]);
    setHasChanges(true);
  };

  // Remove a filter
  const handleRemoveFilter = (index: number) => {
    const newFilters = [...filters];
    newFilters.splice(index, 1);
    setFilters(newFilters);
    setHasChanges(true);
  };

  // Update a filter property
  const handleFilterChange = (index: number, property: keyof ViewFilterConfig, value: any) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], [property]: value };
    
    // Reset value when changing to operators that don't need values
    if (property === 'operator' && NO_VALUE_OPERATORS.includes(value)) {
      newFilters[index].value = '';
    }
    
    setFilters(newFilters);
    setHasChanges(true);
  };

  // Apply filters and close drawer
  const handleApplyFilters = () => {
    // Remove any incomplete filters
    const validFilters = filters.filter(
      filter => filter.field && filter.operator && 
        (NO_VALUE_OPERATORS.includes(filter.operator) || filter.value !== undefined)
    );
    
    // Update the view config with the new filters
    onConfigChange({
      ...currentView.config,
      filters: validFilters
    });
    
    onClose();
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters([createEmptyFilter()]);
    setHasChanges(true);
  };

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Drawer isOpen={isOpen} onClose={onClose} placement="right" size="md">
      <DrawerOverlay />
      <DrawerContent bg={bgColor}>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px" borderColor={borderColor}>
          Filter Data
        </DrawerHeader>

        <DrawerBody>
          <VStack spacing={4} align="stretch" py={2}>
            {filters.length === 0 || sortedAvailableFields.length === 0 ? (
              <Box textAlign="center" py={8}>
                <Icon as={Info} boxSize={8} mb={4} color="gray.400" />
                <Text color="gray.500">
                  {sortedAvailableFields.length === 0 
                    ? "No filterable fields available." 
                    : "No filters created yet. Add a filter to start."}
                </Text>
              </Box>
            ) : (
              <VStack spacing={4} align="stretch">
                {filters.map((filter, index) => (
                  <Box 
                    key={index} 
                    p={4}
                    borderWidth="1px"
                    borderColor={borderColor}
                    borderRadius="md"
                    bg={useColorModeValue('gray.50', 'gray.700')}
                  >
                    {/* Conjunction - only show for filters after the first one */}
                    {index > 0 && (
                      <Box mb={3}>
                        <FormLabel fontSize="sm" fontWeight="medium" mb={1}>
                          Join with:
                        </FormLabel>
                        <ButtonGroup isAttached size="sm" mb={2}>
                          <Button
                            colorScheme={filter.conjunction === 'and' ? "blue" : "gray"}
                            onClick={() => handleFilterChange(index, 'conjunction', 'and')}
                          >
                            AND
                          </Button>
                          <Button
                            colorScheme={filter.conjunction === 'or' ? "blue" : "gray"}
                            onClick={() => handleFilterChange(index, 'conjunction', 'or')}
                          >
                            OR
                          </Button>
                        </ButtonGroup>
                      </Box>
                    )}

                    <Flex justify="space-between" mb={2}>
                      <Text fontWeight="medium" fontSize="sm">Filter {index + 1}</Text>
                      <IconButton
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        icon={<Icon as={Trash2} />}
                        aria-label="Remove filter"
                        onClick={() => handleRemoveFilter(index)}
                        isDisabled={filters.length === 1}
                      />
                    </Flex>

                    <VStack spacing={3} align="stretch">
                      {/* Field selection */}
                      <FormControl>
                        <FormLabel fontSize="sm" mb={1}>Field</FormLabel>
                        <Select
                          size="sm"
                          value={filter.field}
                          onChange={(e) => handleFilterChange(index, 'field', e.target.value)}
                        >
                          {sortedAvailableFields.map((field) => (
                            <option key={field} value={field}>
                              {field}
                            </option>
                          ))}
                        </Select>
                      </FormControl>

                      {/* Operator selection */}
                      <FormControl>
                        <FormLabel fontSize="sm" mb={1}>Operator</FormLabel>
                        <Select
                          size="sm"
                          value={filter.operator}
                          onChange={(e) => handleFilterChange(
                            index, 
                            'operator', 
                            e.target.value as ViewFilterConfig['operator']
                          )}
                        >
                          {FILTER_OPERATORS.map((op) => (
                            <option key={op.value} value={op.value}>
                              {op.label}
                            </option>
                          ))}
                        </Select>
                      </FormControl>

                      {/* Value input - only show for operators that need values */}
                      {!NO_VALUE_OPERATORS.includes(filter.operator) && (
                        <FormControl>
                          <FormLabel fontSize="sm" mb={1}>Value</FormLabel>
                          <Input
                            size="sm"
                            value={filter.value || ''}
                            onChange={(e) => handleFilterChange(index, 'value', e.target.value)}
                          />
                        </FormControl>
                      )}
                    </VStack>
                  </Box>
                ))}
              </VStack>
            )}

            {/* Add filter button */}
            <Button
              leftIcon={<Icon as={Plus} />}
              variant="outline"
              onClick={handleAddFilter}
              isDisabled={sortedAvailableFields.length === 0}
              size="sm"
              width="full"
            >
              Add Filter
            </Button>

            {sortedAvailableFields.length === 0 && (
              <Alert status="info" size="sm" borderRadius="md">
                <AlertIcon />
                No fields are available for filtering. Make sure your view has columns configured.
              </Alert>
            )}
          </VStack>

          <Divider my={6} />

          {/* Footer actions */}
          <HStack spacing={3} justifyContent="flex-end">
            <Button 
              variant="ghost" 
              onClick={handleClearFilters}
              isDisabled={filters.length === 0 || filters.length === 1 && !filters[0].value}
              size="sm"
            >
              Clear Filters
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleApplyFilters}
              isDisabled={!hasChanges || sortedAvailableFields.length === 0}
              size="sm"
            >
              Apply Filters
            </Button>
          </HStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
} 