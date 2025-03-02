import React from 'react';
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Box
} from '@chakra-ui/react';
import { ModelDataForm } from '@/components/models/ModelDataForm';

interface AddDataDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  modelName: string;
  modelDefinition: any;
  onSubmit: (data: Record<string, any>) => Promise<void>;
}

export function AddDataDrawer({
  isOpen,
  onClose,
  modelName,
  modelDefinition,
  onSubmit
}: AddDataDrawerProps) {
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
          {`Add Data to ${modelName}`}
          <DrawerCloseButton size="lg" color="gray.400" _hover={{ bg: "gray.700", color: "gray.200" }} />
        </DrawerHeader>
        <DrawerBody p={6}>
          <Box>
            <ModelDataForm
              model={modelDefinition}
              onSubmit={onSubmit}
              onCancel={onClose}
            />
          </Box>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
} 