import React from 'react';
import { Center, VStack, Text, Button } from '@chakra-ui/react';
import { EmptyStateViewProps } from './types';

export function EmptyStateView({ onCreateView }: EmptyStateViewProps) {
  return (
    <Center height="100%" p={8}>
      <VStack spacing={4}>
        <Text>No active view. Create a view to start exploring data.</Text>
        <Button colorScheme="purple" onClick={onCreateView}>
          Create View
        </Button>
      </VStack>
    </Center>
  );
} 