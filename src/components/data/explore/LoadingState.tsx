import React from 'react';
import { Box, Flex, Spinner, Text, useColorModeValue } from '@chakra-ui/react';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  const textColor = useColorModeValue('gray.600', 'gray.300');
  
  return (
    <Flex 
      align="center" 
      justify="center" 
      height="100%" 
      minHeight="400px"
      width="100%"
    >
      <Flex flexDirection="column" align="center" gap={4}>
        <Spinner 
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.700"
          color="brand.500"
          size="xl"
        />
        <Text fontSize="lg" color={textColor}>{message}</Text>
      </Flex>
    </Flex>
  );
} 