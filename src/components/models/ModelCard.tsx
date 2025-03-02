import { Database, MoreHorizontal, FileText, Compass, Trash2, PlusCircle, ArrowUpRight, Archive, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import {
  Box,
  Button,
  Card,
  Flex,
  HStack,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  MenuGroup,
  Badge,
  Text,
  SimpleGrid,
  Heading,
  IconButton,
  Stat,
  StatLabel,
  StatNumber,
  useDisclosure,
  Divider,
  Tag,
  Portal
} from '@chakra-ui/react';

export interface ModelDefinition {
  id: string;
  name: string;
  description?: string;
  fields: Record<string, any>;
  status?: 'active' | 'archived';
  recordCount: number;
}

export interface ModelCardProps {
  model: ModelDefinition;
  onAddData: (modelId: string) => void;
  onArchiveToggle: (modelId: string, currentStatus: string) => void;
  onClearData: (modelId: string, modelName: string) => void;
  onDelete: (modelId: string) => void;
}

export function ModelCard({ 
  model, 
  onAddData, 
  onArchiveToggle, 
  onClearData, 
  onDelete 
}: ModelCardProps) {
  const isArchived = model.status === 'archived';
  
  return (
    <Card 
      bg="gray.800" 
      borderWidth="1px" 
      borderColor="gray.700" 
      borderRadius="md"
      overflow="visible"
      transition="all 0.2s ease"
      position="relative"
      h="full"
      _hover={{ 
        borderColor: 'gray.600',
        transform: 'translateY(-2px)',
        boxShadow: 'md',
      }}
    >
      <Flex 
        direction="column" 
        h="full"
        overflow="hidden"
      >
        <Box p={3}>
          {/* Header */}
          <Flex justifyContent="space-between" alignItems="flex-start" mb={2}>
            <HStack spacing={2} alignItems="center">
              <Flex 
                bg="gray.700" 
                color="brand.400" 
                boxSize={8} 
                borderRadius="md" 
                alignItems="center" 
                justifyContent="center"
              >
                <Icon as={Database} boxSize={4} />
              </Flex>
              
              <Box>
                <Heading 
                  as="h3" 
                  size="sm" 
                  fontWeight="semibold" 
                  color="white" 
                  isTruncated 
                  maxW="160px"
                >
                  {model.name}
                </Heading>
              </Box>
            </HStack>
            
            <HStack spacing={2}>
              {isArchived && (
                <Badge 
                  fontSize="xs" 
                  colorScheme="gray" 
                  variant="subtle" 
                  px={2} 
                  py={0.5} 
                  borderRadius="full"
                >
                  Archived
                </Badge>
              )}
              <Menu placement="bottom-end" strategy="fixed" autoSelect={false} closeOnSelect={true}>
                <MenuButton
                  as={IconButton}
                  aria-label="Options"
                  icon={<Icon as={MoreHorizontal} />}
                  variant="ghost"
                  size="sm"
                  color="gray.400"
                  _hover={{ bg: "gray.700", color: "white" }}
                />
                <Portal>
                  <MenuList 
                    zIndex={9999} 
                    bg="gray.800" 
                    borderColor="gray.700" 
                    py={1} 
                    boxShadow="lg"
                    fontSize="sm"
                  >
                    <MenuGroup title="Actions" color="gray.400" fontWeight="medium" fontSize="xs" ml={3} mb={1}>
                      <MenuItem
                        icon={<Icon as={FileText} boxSize={4} />}
                        onClick={() => onAddData(model.id)}
                        isDisabled={isArchived}
                        _hover={{ bg: 'gray.700' }}
                        color="gray.200"
                      >
                        Add Data
                      </MenuItem>
                      <Link href={`/models/${model.id}/explore`} style={{ width: '100%' }}>
                        <MenuItem
                          icon={<Icon as={Compass} boxSize={4} />}
                          isDisabled={isArchived}
                          _hover={{ bg: 'gray.700' }}
                          color="gray.200"
                        >
                          Explore Data
                        </MenuItem>
                      </Link>
                    </MenuGroup>
                    
                    <MenuDivider borderColor="gray.700" my={1} />
                    
                    <MenuGroup title="Management" color="gray.400" fontWeight="medium" fontSize="xs" ml={3} mb={1}>
                      <MenuItem
                        icon={<Icon as={isArchived ? RotateCcw : Archive} boxSize={4} />}
                        onClick={() => onArchiveToggle(model.id, model.status || 'active')}
                        _hover={{ bg: 'gray.700' }}
                        color="gray.200"
                      >
                        {isArchived ? 'Restore Model' : 'Archive Model'}
                      </MenuItem>
                      
                      {!isArchived && (
                        <MenuItem
                          onClick={() => onClearData(model.id, model.name)}
                          _hover={{ bg: 'gray.700' }}
                          color="yellow.300"
                        >
                          Clear All Data
                        </MenuItem>
                      )}
                      
                      <MenuItem
                        icon={<Icon as={Trash2} boxSize={4} />}
                        onClick={() => onDelete(model.id)}
                        _hover={{ bg: 'gray.700' }}
                        color="red.300"
                      >
                        Delete Model
                      </MenuItem>
                    </MenuGroup>
                  </MenuList>
                </Portal>
              </Menu>
            </HStack>
          </Flex>
          
          {/* Description */}
          <Text 
            color="gray.400" 
            fontSize="xs" 
            noOfLines={1} 
            mb={3}
            minH="1.2rem"
          >
            {model.description || 'No description'}
          </Text>
          
          {/* Stats */}
          <SimpleGrid columns={2} spacing={3}>
            <Stat
              bg="gray.700"
              p={2}
              borderRadius="md"
              size="sm"
            >
              <StatLabel fontSize="xs" color="gray.400" fontWeight="medium">Fields</StatLabel>
              <StatNumber fontSize="lg" fontWeight="semibold" color="gray.100">
                {Object.keys(model.fields).length}
              </StatNumber>
            </Stat>
            
            <Stat
              bg="gray.700"
              p={2}
              borderRadius="md"
              size="sm"
            >
              <StatLabel fontSize="xs" color="gray.400" fontWeight="medium">Records</StatLabel>
              <StatNumber fontSize="lg" fontWeight="semibold" color="gray.100">
                {model.recordCount}
              </StatNumber>
            </Stat>
          </SimpleGrid>
        </Box>
        
        {/* Footer with actions */}
        <Box mt="auto">
          <Divider borderColor="gray.700" />
          <Flex gap={2} p={2}>
            <Button
              onClick={() => onAddData(model.id)}
              isDisabled={isArchived}
              flex={1}
              leftIcon={<Icon as={PlusCircle} boxSize={3} />}
              size="sm"
              variant="ghost"
              color="gray.300"
              fontWeight="medium"
              _hover={{ bg: 'gray.700' }}
            >
              Add
            </Button>
            
            <Link href={`/models/${model.id}/explore`} style={{ flex: 1 }}>
              <Button
                width="100%"
                leftIcon={<Icon as={Compass} boxSize={3} />}
                colorScheme="brand"
                size="sm"
                isDisabled={isArchived}
                fontWeight="medium"
              >
                Explore
              </Button>
            </Link>
          </Flex>
        </Box>
      </Flex>
    </Card>
  );
} 