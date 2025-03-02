import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Box, Container, Flex, Heading, Icon, Text, useColorModeValue } from '@chakra-ui/react';

interface ErrorStateProps {
  error: string;
  title?: string;
}

export function ErrorState({ error, title = "Error Loading Data" }: ErrorStateProps) {
  const errorBg = useColorModeValue('red.50', 'rgba(254, 178, 178, 0.16)');
  const errorBorderColor = useColorModeValue('red.200', 'red.500');
  const errorTextColor = useColorModeValue('red.600', 'red.300');

  return (
    <Container py={8}>
      <Box 
        p={6} 
        bg={errorBg} 
        color={errorTextColor} 
        borderRadius="lg" 
        borderWidth="1px" 
        borderColor={errorBorderColor}
      >
        <Flex align="center" gap={3}>
          <Icon as={AlertTriangle} boxSize={6} />
          <Box>
            <Heading as="h3" size="sm" fontWeight="semibold">{title}</Heading>
            <Text fontSize="sm" mt={1}>{error}</Text>
          </Box>
        </Flex>
      </Box>
    </Container>
  );
} 