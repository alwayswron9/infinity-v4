'use client';
import React from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  Key, 
  Table2, 
  Search,
  LayoutGrid,
  Workflow,
  Database,
  Shield
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
  Divider,
  SimpleGrid
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
        borderColor: 'brand.500',
        transition: 'all 0.2s ease' 
      }}
      h="full"
    >
      <Flex alignItems="start" gap="4">
        <Box flexShrink={0}>
          <Flex 
            bg="brand.900" 
            color="brand.400" 
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

const FeatureCard = ({ title, description, icon: IconComponent }: { 
  title: string; 
  description: string; 
  icon: any; 
}) => (
  <Card
    p="5" 
    borderWidth="1px" 
    borderColor="gray.700" 
    rounded="lg" 
    bg="gray.800"
    _hover={{ borderColor: 'brand.500', transition: 'all 0.2s ease' }}
  >
    <Flex direction="column" gap={3}>
      <Flex 
        bg="brand.900" 
        color="brand.400" 
        boxSize={10} 
        borderRadius="md" 
        alignItems="center" 
        justifyContent="center"
        mb={1}
      >
        <Icon as={IconComponent} boxSize="5" />
      </Flex>
      <Heading as="h3" size="md" fontWeight="semibold" color="white">{title}</Heading>
      <Text fontSize="sm" color="gray.400">{description}</Text>
    </Flex>
  </Card>
);

export default function Dashboard() {
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
                Your central hub for data management and workflow automation
              </Text>
            </Box>
            
            <Link href="/models/new">
              <Button
                colorScheme="brand"
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

        {/* What is Infinity */}
        <Card bg="gray.800" borderColor="gray.700" variant="outline" shadow="sm" borderRadius="lg" mb={6} p={6}>
          <Stack spacing={4}>
            <Heading as="h2" size="md" fontWeight="semibold" color="white">
              What is Infinity?
            </Heading>
            <Text color="gray.300">
              Infinity is your centralized data management system that allows you to create custom data models,
              interact with your data through an intuitive UI, and connect with workflow automation tools.
            </Text>
            <List spacing="3">
              <ListItem display="flex" alignItems="center" gap="3">
                <Flex 
                  bg="brand.900" 
                  color="brand.400" 
                  boxSize={8} 
                  borderRadius="md" 
                  alignItems="center" 
                  justifyContent="center"
                >
                  <Icon as={Database} boxSize={4} />
                </Flex>
                <Text color="gray.100">Create custom data models to structure your information</Text>
              </ListItem>
              <ListItem display="flex" alignItems="center" gap="3">
                <Flex 
                  bg="brand.900" 
                  color="brand.400" 
                  boxSize={8} 
                  borderRadius="md" 
                  alignItems="center" 
                  justifyContent="center"
                >
                  <Icon as={Search} boxSize={4} />
                </Flex>
                <Text color="gray.100">Search and filter data with advanced query capabilities</Text>
              </ListItem>
              <ListItem display="flex" alignItems="center" gap="3">
                <Flex 
                  bg="brand.900" 
                  color="brand.400" 
                  boxSize={8} 
                  borderRadius="md" 
                  alignItems="center" 
                  justifyContent="center"
                >
                  <Icon as={Workflow} boxSize={4} />
                </Flex>
                <Text color="gray.100">Connect to n8n and other tools via our comprehensive API</Text>
              </ListItem>
            </List>
            <Divider borderColor="gray.700" />
            <Flex justifyContent="space-between" alignItems="center">
              <Text color="gray.400" fontSize="sm">
                Infinity serves as the central data hub for all your automation workflows.
              </Text>
              <Link href="/public-docs" passHref>
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="brand"
                  rightIcon={<Icon as={ArrowRight} boxSize={4} />}
                >
                  View Documentation
                </Button>
              </Link>
            </Flex>
          </Stack>
        </Card>

        {/* Quick Start */}
        <Card bg="gray.800" borderColor="gray.700" variant="outline" shadow="sm" borderRadius="lg" mb={6} p={6}>
          <Stack spacing={4}>
            <Heading as="h2" size="md" fontWeight="semibold" color="white">
              Quick Start
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <QuickStartCard
                title="Create Model"
                description="Define your data structure with custom fields and validations"
                icon={Table2}
                href="/models/new"
              />
              <QuickStartCard
                title="Generate API Key"
                description="Get API keys for secure access to your data"
                icon={Key}
                href="/settings"
              />
              <QuickStartCard
                title="Explore Data"
                description="Browse and search through your existing records"
                icon={Search}
                href="/models"
              />
            </SimpleGrid>
          </Stack>
        </Card>

        {/* API Examples */}
        <Card bg="gray.800" borderColor="gray.700" variant="outline" shadow="sm" borderRadius="lg" mb={6} p={6}>
          <Stack spacing={6}>
            <Heading as="h2" size="md" fontWeight="semibold" color="white">
              API Integration
            </Heading>
            
            <Text color="gray.300">
              Every model you create gets its own set of RESTful API endpoints. Use these endpoints to integrate with n8n, 
              Zapier, or your own custom applications.
            </Text>
            
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
              <Heading as="h3" size="sm" fontWeight="semibold" mb="3" color="gray.100">Filtering & Sorting</Heading>
              <CodeBlock code={`# Filter by field value
GET /api/public/data/customers?filter=status:active&sort=created_at:desc

# Search with vector similarity
GET /api/public/data/products/search?query="comfortable office chair"

# Paginate results
GET /api/public/data/orders?page=2&limit=50`} />
            </Box>
          </Stack>
        </Card>

        {/* Automation Integration */}
        <Card bg="gray.800" borderColor="gray.700" variant="outline" shadow="sm" borderRadius="lg" mb={6} p={6}>
          <Stack spacing={4}>
            <Heading as="h2" size="md" fontWeight="semibold" color="white">
              Workflow Automation
            </Heading>
            <Text color="gray.300">
              Connect Infinity to n8n to create powerful automation workflows that leverage your data models.
            </Text>
            <List spacing="4" styleType="decimal" pl={5}>
              <ListItem color="gray.100">
                <Text color="gray.100">Create data models in Infinity</Text>
                <Text color="gray.400" fontSize="sm">Define your data structure first</Text>
              </ListItem>
              <ListItem color="gray.100">
                <Text color="gray.100">Generate an API key in settings</Text>
                <Text color="gray.400" fontSize="sm">You'll need this to connect to n8n</Text>
              </ListItem>
              <ListItem color="gray.100">
                <Text color="gray.100">
                  <ChakraLink href="mailto:aiwahlabs@gmail.com" color="brand.400">Email us</ChakraLink> for n8n access credentials
                </Text>
                <Text color="gray.400" fontSize="sm">We'll set you up with a dedicated instance</Text>
              </ListItem>
              <ListItem color="gray.100">
                <Text color="gray.100">Create HTTP Request nodes in n8n</Text>
                <Text color="gray.400" fontSize="sm">Use your API key in the Authorization header</Text>
              </ListItem>
            </List>
            <Flex mt={2} justifyContent="center">
              <ChakraLink href="https://automate.aiwahlabs.xyz" isExternal>
                <Button colorScheme="brand" size="md">
                  Get Started with n8n
                </Button>
              </ChakraLink>
            </Flex>
          </Stack>
        </Card>

        {/* Key Features */}
        <Card bg="gray.800" borderColor="gray.700" variant="outline" shadow="sm" borderRadius="lg" p={6}>
          <Stack spacing={4}>
            <Heading as="h2" size="md" fontWeight="semibold" color="white">
              Key Features
            </Heading>
            
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              <FeatureCard
                title="Centralized Data"
                description="Store all your business data in a single, structured platform with proper relationships and validations."
                icon={Database}
              />
              <FeatureCard
                title="Vector Search"
                description="Enable AI-powered semantic search across your data models for intelligent data retrieval."
                icon={Search}
              />
              <FeatureCard
                title="Secure by Design"
                description="Role-based access control, API key management, and secure authentication protect your data."
                icon={Shield}
              />
            </SimpleGrid>
            
            <Box mt={4} textAlign="center">
              <Text color="gray.400" fontSize="sm">
                Need help getting started? <ChakraLink href="mailto:aiwahlabs@gmail.com" color="brand.400">Contact our support team</ChakraLink>
              </Text>
            </Box>
          </Stack>
        </Card>

      </Container>
    </Box>
  );
}