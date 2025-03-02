import { useEffect } from 'react';
import { X } from 'lucide-react';
import {
  Box,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Heading,
  IconButton,
  Icon,
  useColorModeValue
} from '@chakra-ui/react';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function SideDrawer({
  isOpen,
  onClose,
  title,
  children,
  className
}: SideDrawerProps) {
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when drawer is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <Drawer
      isOpen={isOpen}
      placement="right"
      onClose={onClose}
      size="lg"
    >
      <DrawerOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />
      <DrawerContent bg="gray.900" borderLeftWidth="1px" borderColor="gray.700">
        <DrawerHeader borderBottomWidth="1px" borderColor="gray.800" py={4}>
          <Heading size="md" color="gray.100">{title}</Heading>
          <DrawerCloseButton size="lg" color="gray.400" _hover={{ bg: "gray.800", color: "gray.200" }} />
        </DrawerHeader>
        <DrawerBody p={6}>
          {children}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
} 