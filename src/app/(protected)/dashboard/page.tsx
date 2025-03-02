'use client';
import React from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  Key, 
  Table2, 
  Search,
  LayoutGrid
} from 'lucide-react';
import { 
  Box, 
  Container,
  Flex, 
  Grid, 
  Icon, 
  Text, 
  Heading, 
  Code, 
  List, 
  ListItem, 
  Link as ChakraLink,
  Card,
  Stack,
  Button,
  useColorModeValue 
} from '@chakra-ui/react';

const QuickStartCard = ({ title, description, icon: IconComponent, href }: { title: string; description: string; icon: any; href: string }) => (
  <Link href={href} style={{ textDecoration: 'none' }}>
    <Card 
      p="6" 
      borderWidth="1px" 
      borderColor="gray.700" 
      rounded="lg" 
      bg="gray.800" 
      _hover={{ 
        boxShadow: 'lg', 
        transform: 'translateY(-2px)',
        transition: 'all 0.2s ease' 
      }}
      h="full"
    >
      <Flex alignItems="start" gap="4">
        <Box flexShrink={0}>
          <Flex 
            bg="gray.700" 
            color="purple.400" 
            boxSize={10} 
            borderRadius="md" 
            alignItems="center" 
            justifyContent="center"
          >
            <Icon as={IconComponent} boxSize="5" />
          </Flex>
        </Box>
        <Box>
          <Heading as="h3" size="md" fontWeight="semibold" color="gray.100">{title}</Heading>
          <Text mt="2" fontSize="sm" color="gray.400">{description}</Text>
        </Box>
      </Flex>
    </Card>
  </Link>
);

const CodeBlock = ({ code }: { code: string }) => (
  <Box bg="gray.900" rounded="lg" p="4" mt="2" borderWidth="1px" borderColor="gray.700">
    <Code 
      display="block"
      whiteSpace="pre"
      overflow="auto"
      fontSize="sm"
      color="gray.300"
      p="0"
      bg="transparent"
    >
      {code}
    </Code>
  </Box>
);

export default function HomePage() {
  return (
    <Box minH="calc(100vh - 64px)" bg="gray.900" py={6} px={{ base: 4, md: 6 }}>
      <Container maxW="container.2xl" px={0}>
        {/* Page Header */}
        <Stack spacing={4} mb={6}>
          <Flex justifyContent="space-between" alignItems="center">
            <Box>
              <Heading size="lg" fontWeight="semibold" color="white" letterSpacing="-0.02em">
                Welcome to Infinity
              </Heading>
              <Text mt={1} color="gray.400" fontSize="sm">
                Your central data service with powerful REST API capabilities
              </Text>
            </Box>
            
            <Link href="/models" passHref>
              <Button
                as="a"
                colorScheme="purple"
                size="md"
                fontWeight="medium"
                borderRadius="md"
                rightIcon={<Icon as={ArrowRight} boxSize={4} />}
              >
                Create Model
              </Button>
            </Link>
          </Flex>
        </Stack>

        {/* Quick Start Cards */}
        <Stack spacing={6}>
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap="6" mt={4}>
            <QuickStartCard
              title="Create Your First Model"
              description="Define your data structure with fields, validations, and vector search capabilities."
              icon={Table2}
              href="/models"
            />
            <QuickStartCard
              title="Generate API Key"
              description="Get your API key to start making authenticated requests to the API."
              icon={Key}
              href="/settings"
            />
            <QuickStartCard
              title="Basic Data Operations"
              description="Create, read, update, and delete records using our REST API endpoints."
              icon={Search}
              href="#basic-operations"
            />
            <QuickStartCard
              title="Advanced Querying"
              description="Use filters, pagination, and vector search to find exactly what you need."
              icon={LayoutGrid}
              href="#advanced-querying"
            />
          </Grid>
        </Stack>

        {/* API Examples */}
        <Card bg="gray.800" borderColor="gray.700" variant="outline" shadow="sm" borderRadius="lg" mt={8} p={6}>
          <Stack spacing={6}>
            <Heading as="h2" size="md" fontWeight="semibold" color="white">
              API Examples
            </Heading>
            
            <Stack spacing={6}>
              <Box>
                <Heading as="h3" size="sm" fontWeight="semibold" mb="3" color="gray.100">Creating Records</Heading>
                <CodeBlock code={`curl --location 'https://infinity.aiwahlabs.xyz/api/public/data/feedback' \\
--header 'X-API-Key: your_api_key_here' \\
--data-raw '{
  "customer_name": "John Doe",
  "feedback": "Great service!",
  "rating": 5
}'`} />
              </Box>

              <Box>
                <Heading as="h3" size="sm" fontWeight="semibold" mb="3" color="gray.100">Reading Records</Heading>
                <CodeBlock code={`curl --location 'https://infinity.aiwahlabs.xyz/api/public/data/feedback?page=1' \\
--header 'X-API-Key: your_api_key_here'`} />
              </Box>

              <Box>
                <Heading as="h3" size="sm" fontWeight="semibold" mb="3" color="gray.100">Updating & Deleting</Heading>
                <CodeBlock code={`# Update record
PUT /api/public/data/[model_name]?id=record_id
{
  "rating": 4,
  "feedback": "Updated feedback"
}

# Delete record
DELETE /api/public/data/[model_name]?id=record_id`} />
              </Box>
            </Stack>
          </Stack>
        </Card>

        {/* Automation Section */}
        <Card bg="gray.800" borderColor="gray.700" variant="outline" shadow="sm" borderRadius="lg" mt={6} p={6}>
          <Flex alignItems="start" gap={4}>
            <Flex 
              bg="gray.700" 
              color="purple.400" 
              boxSize={10} 
              borderRadius="md" 
              alignItems="center" 
              justifyContent="center"
              flexShrink={0}
            >
              <Icon as={ArrowRight} boxSize="5" />
            </Flex>
            <Box>
              <Heading as="h3" size="md" fontWeight="semibold" mb="2" color="gray.100">Automation Integration</Heading>
              <Text color="gray.300" mb="4">
                Use our pre-configured n8n instance to automate workflows: {' '}
                <ChakraLink href="https://automate.aiwahlabs.xyz" color="purple.400" _hover={{ textDecoration: 'underline' }}>
                  automate.aiwahlabs.xyz
                </ChakraLink>
              </Text>
              <Text fontSize="sm" color="gray.400">
                Email aiwahlabs@gmail.com to get your automation credentials
              </Text>
            </Box>
          </Flex>
        </Card>

        {/* Key Features */}
        <Card bg="gray.800" borderColor="gray.700" variant="outline" shadow="sm" borderRadius="lg" mt={6} p={6}>
          <Stack spacing={4}>
            <Heading as="h2" size="md" fontWeight="semibold" color="white">
              Key Features
            </Heading>
            
            <List spacing="4">
              <ListItem display="flex" alignItems="center" gap="3">
                <Flex 
                  bg="gray.700" 
                  color="purple.400" 
                  boxSize={8} 
                  borderRadius="md" 
                  alignItems="center" 
                  justifyContent="center"
                >
                  <Icon as={ArrowRight} boxSize={4} />
                </Flex>
                <Text color="gray.100">Full CRUD operations with REST API endpoints</Text>
              </ListItem>
              <ListItem display="flex" alignItems="center" gap="3">
                <Flex 
                  bg="gray.700" 
                  color="purple.400" 
                  boxSize={8} 
                  borderRadius="md" 
                  alignItems="center" 
                  justifyContent="center"
                >
                  <Icon as={ArrowRight} boxSize={4} />
                </Flex>
                <Text color="gray.100">Advanced filtering and pagination support</Text>
              </ListItem>
              <ListItem display="flex" alignItems="center" gap="3">
                <Flex 
                  bg="gray.700" 
                  color="purple.400" 
                  boxSize={8} 
                  borderRadius="md" 
                  alignItems="center" 
                  justifyContent="center"
                >
                  <Icon as={ArrowRight} boxSize={4} />
                </Flex>
                <Text color="gray.100">Vector search for semantic similarity queries</Text>
              </ListItem>
              <ListItem display="flex" alignItems="center" gap="3">
                <Flex 
                  bg="gray.700" 
                  color="purple.400" 
                  boxSize={8} 
                  borderRadius="md" 
                  alignItems="center" 
                  justifyContent="center"
                >
                  <Icon as={ArrowRight} boxSize={4} />
                </Flex>
                <Text color="gray.100">Secure API key authentication</Text>
              </ListItem>
            </List>
          </Stack>
        </Card>
      </Container>
    </Box>
  );
}