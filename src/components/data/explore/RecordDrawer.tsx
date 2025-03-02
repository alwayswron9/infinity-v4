import React from 'react';
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Flex
} from '@chakra-ui/react';
import { ModelDataForm } from '@/components/models/ModelDataForm';

interface RecordDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isEditMode: boolean;
  setEditMode: (isEditMode: boolean) => void;
  title: string;
  record: Record<string, any> | null;
  model: any;
  onSubmit: (data: Record<string, any>) => Promise<void>;
}

export function RecordDrawer({
  isOpen,
  onClose,
  isEditMode,
  setEditMode,
  title,
  record,
  model,
  onSubmit
}: RecordDrawerProps) {
  return (
    <Drawer
      isOpen={isOpen}
      placement="right"
      onClose={onClose}
      size="lg"
    >
      <DrawerOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />
      <DrawerContent bg="gray.800" borderLeftWidth="1px" borderColor="gray.700">
        <DrawerHeader borderBottomWidth="1px" borderColor="gray.700" py={4}>
          {title}
          <DrawerCloseButton size="lg" color="gray.400" _hover={{ bg: "gray.700", color: "gray.200" }} />
        </DrawerHeader>
        <DrawerBody p={6}>
          <Flex justify="flex-end" mb={4}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditMode(!isEditMode)}
            >
              {isEditMode ? "Cancel Edit" : "Edit Record"}
            </Button>
          </Flex>
          
          <ModelDataForm
            model={model}
            initialData={record || undefined}
            onSubmit={onSubmit}
            onCancel={() => {
              if (isEditMode) {
                setEditMode(false);
              } else {
                onClose();
              }
            }}
            submitButtonText="Save Changes"
            readOnly={!isEditMode}
          />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
} 