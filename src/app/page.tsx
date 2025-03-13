'use client';

import { Suspense } from 'react';
import { 
  Box, 
  Button, 
  Flex, 
  Heading, 
  Text, 
  Container, 
  Stack, 
  Icon,
  VStack, 
  HStack,
  Link as ChakraLink
} from '@chakra-ui/react';
import Link from 'next/link';
import { ArrowRight, FileText, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <Box 
      minH="100vh" 
      display="flex" 
      flexDirection="column" 
      position="relative"
      sx={{
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgImage: "url('/space.jpg')",
          bgSize: "cover",
          bgPosition: "center",
          bgRepeat: "no-repeat",
          zIndex: -1
        }
      }}
    >
      <Box 
        position="absolute" 
        top={0} 
        left={0} 
        right={0} 
        bottom={0} 
        bg="linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.7) 100%)" 
        zIndex={-1} 
      />
      
      <Container maxW="container.lg" flex="1" display="flex" flexDirection="column" justifyContent="center">
        <Stack 
          spacing={10} 
          py={20}
          textAlign="center"
          align="center"
        >
          <Flex direction="column" align="center">
            <Box boxSize={24} position="relative" mb={6}>
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bg="brand.500"
                borderRadius="xl"
                transform="rotate(45deg)"
              />
              <Flex
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                align="center"
                justify="center"
                fontWeight="bold"
                color="white"
                fontSize="6xl"
              >
                ∞
              </Flex>
            </Box>
            <Heading 
              as="h1" 
              size="4xl" 
              mb={4} 
              bgGradient="linear(to-r, white, brand.200)"
              bgClip="text"
              fontWeight="extrabold"
              letterSpacing="tight"
            >
              Infinity
            </Heading>
            <Text 
              fontSize="2xl" 
              color="gray.300" 
              maxW="700px"
            >
              Your centralized data management system for workflow automation
            </Text>
          </Flex>
          
          <HStack spacing={8} justifyContent="center" wrap="wrap">
            <VStack align="center" bg="whiteAlpha.100" p={8} borderRadius="xl" w="300px" spacing={5}>
              <Icon as={FileText} boxSize={10} color="brand.400" />
              <Heading as="h2" size="lg" color="white">Documentation</Heading>
              <Text color="gray.300" fontSize="md">
                Learn how to use Infinity with our comprehensive documentation
              </Text>
              <Button 
                as={Link}
                href="/public-docs"
                colorScheme="brand"
                rightIcon={<Icon as={ArrowRight} />}
                size="lg"
                mt={2}
              >
                View Docs
              </Button>
            </VStack>
            
            <VStack align="center" bg="whiteAlpha.100" p={8} borderRadius="xl" w="300px" spacing={5}>
              <Icon as={Users} boxSize={10} color="brand.400" />
              <Heading as="h2" size="lg" color="white">Sign In</Heading>
              <Text color="gray.300" fontSize="md">
                Access your Infinity dashboard to manage your data models
              </Text>
              <Button 
                as={Link}
                href="/auth"
                variant="outline"
                borderColor="brand.400"
                color="brand.400"
                rightIcon={<Icon as={ArrowRight} />}
                size="lg"
                mt={2}
                _hover={{
                  bg: "brand.500",
                  color: "white"
                }}
              >
                Sign In
              </Button>
            </VStack>
          </HStack>
          
          <Text color="gray.500" fontSize="sm" mt={16}>
            © {new Date().getFullYear()} AiwaLabs. All rights reserved.
          </Text>
        </Stack>
      </Container>
    </Box>
  );
}
