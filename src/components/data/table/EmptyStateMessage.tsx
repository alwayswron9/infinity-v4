import React from 'react';
import {
  Center,
  VStack,
  Icon,
  Text
} from '@chakra-ui/react';
import { FileText } from 'lucide-react';

interface EmptyStateMessageProps {
  message: string;
}

export function EmptyStateMessage({ message }: EmptyStateMessageProps) {
  return (
    <Center 
      position="absolute" 
      top="0" 
      left="0" 
      right="0" 
      bottom="0"
      pointerEvents="none"
    >
      <VStack spacing={3}>
        <Icon as={FileText} boxSize={10} color="gray.400" />
        <Text color="gray.500" fontSize="sm" fontWeight="medium">{message}</Text>
      </VStack>
    </Center>
  );
} 