import React from 'react';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';
import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  MenuGroup,
  Text,
  useColorModeValue
} from '@chakra-ui/react';
import type { ModelView } from '@/types/viewDefinition';

interface ViewSelectorProps {
  views: ModelView[];
  activeViewId: string | null;
  onViewSelect: (viewId: string) => void;
  onCreateView: () => void;
  onDeleteView: (viewId: string) => void;
  isLoading?: boolean;
}

export function ViewSelector({
  views,
  activeViewId,
  onViewSelect,
  onCreateView,
  onDeleteView,
  isLoading = false,
}: ViewSelectorProps) {
  const activeView = views.find(v => v.id === activeViewId);
  const menuBg = useColorModeValue('white', 'gray.800');
  const menuBorderColor = useColorModeValue('gray.200', 'gray.700');
  const defaultLabelColor = useColorModeValue('gray.500', 'gray.400');

  const handleDeleteView = async (viewId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    // Don't allow deleting the last view
    if (views.length <= 1) {
      return;
    }
    // Don't allow deleting the default view if it's the only one
    const viewToDelete = views.find(v => v.id === viewId);
    if (viewToDelete?.is_default && views.length === 1) {
      return;
    }
    try {
      await onDeleteView(viewId);
    } catch (error) {
      console.error('Error deleting view:', error);
    }
  };

  return (
    <Menu closeOnSelect={false}>
      <MenuButton
        as={Button}
        rightIcon={<Icon as={ChevronDown} boxSize={4} />}
        variant="outline"
        size="sm"
        isLoading={isLoading}
        fontWeight="medium"
      >
        {activeView?.name || 'Select View'}
      </MenuButton>
      <MenuList
        bg={menuBg}
        borderColor={menuBorderColor}
        boxShadow="md"
        zIndex={10}
        minW="220px"
      >
        <MenuGroup title="Views" fontWeight="medium" fontSize="sm" px={3} pb={2}>
          <MenuDivider />
          <Box maxH="300px" overflowY="auto">
            {views.map((view) => (
              <MenuItem
                key={view.id}
                onClick={() => onViewSelect(view.id)}
                bg={view.id === activeViewId ? 'gray.700' : 'transparent'}
                _hover={{ bg: 'gray.700' }}
                borderRadius="md"
                my={1}
              >
                <Flex justify="space-between" align="center" width="100%">
                  <Flex align="center">
                    <Text>{view.name}</Text>
                    {view.is_default && (
                      <Text ml={2} fontSize="xs" color={defaultLabelColor}>(Default)</Text>
                    )}
                  </Flex>
                  <IconButton
                    aria-label="Delete view"
                    icon={<Icon as={Trash2} boxSize={3} />}
                    variant="ghost"
                    size="xs"
                    isDisabled={views.length <= 1 || (view.is_default && views.length === 1)}
                    onClick={(e) => handleDeleteView(view.id, e)}
                    _hover={{ color: 'red.500' }}
                  />
                </Flex>
              </MenuItem>
            ))}
          </Box>
        </MenuGroup>
        <MenuDivider />
        <MenuItem 
          onClick={onCreateView}
          icon={<Icon as={Plus} boxSize={4} />}
          _hover={{ bg: 'gray.700' }}
        >
          New View
        </MenuItem>
      </MenuList>
    </Menu>
  );
} 