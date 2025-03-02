import Link from 'next/link';
import { Database, Plus } from 'lucide-react';
import {
  Box,
  Button,
  Center,
  Heading,
  Icon,
  Text,
  VStack,
  Flex,
  Circle
} from '@chakra-ui/react';

export function EmptyState() {
  return (
    <Box
      bg="gray.800" 
      borderWidth="1px" 
      borderColor="gray.700" 
      borderRadius="md"
      py={16}
      px={4}
      textAlign="center"
    >
      <Center>
        <VStack spacing={5} maxW="md">
          <Circle
            size="24"
            bg="gray.700"
          >
            <Icon as={Database} boxSize="10" color="brand.400" />
          </Circle>
          
          <VStack spacing={2}>
            <Heading 
              as="h3" 
              size="md" 
              fontWeight="semibold" 
              color="white"
              letterSpacing="-0.01em"
            >
              No models found
            </Heading>
            
            <Text 
              color="gray.400" 
              fontSize="sm" 
              maxW="md" 
              lineHeight="tall"
            >
              Create your first model to start organizing and managing your data effectively.
              Models allow you to define your data structure with validation rules.
            </Text>
          </VStack>
          
          <Box pt={2}>
            <Link href="/models/new">
              <Button
                leftIcon={<Icon as={Plus} boxSize={4} />}
                colorScheme="brand"
                size="md"
                fontWeight="medium"
                px={6}
                borderRadius="md"
                _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
              >
                Create your first model
              </Button>
            </Link>
          </Box>
        </VStack>
      </Center>
    </Box>
  );
} 