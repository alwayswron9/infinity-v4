'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  Button, 
  Container, 
  Stack, 
  Flex, 
  Card, 
  Icon, 
  Grid, 
  GridItem,
  SimpleGrid,
  Input,
  InputGroup,
  InputLeftElement,
  Link as ChakraLink,
  VStack,
  HStack,
  Divider,
  List,
  ListItem,
  ListIcon,
  useColorModeValue
} from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, 
  Database, 
  Search as SearchIcon, 
  ArrowRight, 
  Code, 
  Workflow, 
  Star, 
  Check,
  BarChart,
  Users,
  ExternalLink
} from 'lucide-react';
import Image from 'next/image';

// Feature card component for the landing page
const FeatureCard = ({ title, description, icon, color }: { 
  title: string; 
  description: string; 
  icon: any; 
  color: string;
}) => (
  <Card
    p={6}
    bg="rgba(17, 25, 40, 0.75)"
    backdropFilter="blur(16px)"
    borderWidth="1px"
    borderColor="gray.700"
    borderRadius="lg"
    boxShadow="lg"
    transition="all 0.3s"
    _hover={{ 
      transform: 'translateY(-8px)', 
      boxShadow: 'xl',
      borderColor: color
    }}
    height="full"
  >
    <Flex direction="column" height="full">
      <Flex 
        bg={`${color}22`} 
        color={color}
        boxSize={12} 
        borderRadius="md" 
        alignItems="center" 
        justifyContent="center"
        mb={4}
      >
        <Icon as={icon} boxSize={6} />
      </Flex>
      <Heading as="h3" size="md" fontWeight="bold" mb={3} color="white">
        {title}
      </Heading>
      <Text color="gray.300" flex="1">
        {description}
      </Text>
    </Flex>
  </Card>
);

// Document card component for quick access
const DocCard = ({ title, description, path, icon }: { 
  title: string; 
  description: string; 
  path: string;
  icon: any;
}) => (
  <Link href={`/documentation?doc=${path}`} passHref>
    <Card
      p={5}
      bg="rgba(17, 25, 40, 0.75)"
      backdropFilter="blur(16px)"
      borderWidth="1px"
      borderColor="gray.700"
      borderRadius="md"
      transition="all 0.2s"
      _hover={{ 
        transform: 'translateY(-4px)', 
        borderColor: 'brand.400',
        cursor: 'pointer'
      }}
      height="full"
    >
      <HStack spacing={4} align="flex-start">
        <Flex 
          bg="brand.900" 
          color="brand.400" 
          boxSize={10} 
          borderRadius="md" 
          alignItems="center" 
          justifyContent="center"
          flexShrink={0}
        >
          <Icon as={icon} boxSize={5} />
        </Flex>
        <VStack align="start" spacing={1}>
          <Heading as="h4" size="sm" fontWeight="semibold" color="white">
            {title}
          </Heading>
          <Text color="gray.400" fontSize="sm">{description}</Text>
        </VStack>
      </HStack>
    </Card>
  </Link>
);

// Search component
const SearchBox = ({ onSearch }: { onSearch: (query: string) => void }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <Card 
      as="form" 
      onSubmit={handleSubmit}
      p={6}
      bg="rgba(17, 25, 40, 0.9)" 
      backdropFilter="blur(20px)"
      borderWidth="1px"
      borderColor="gray.700"
      borderRadius="lg"
      boxShadow="xl"
      width="full"
      maxW="800px"
      mx="auto"
      mb={12}
    >
      <VStack spacing={5}>
        <Heading as="h2" size="md" textAlign="center" color="white">
          Find what you need
        </Heading>
        <InputGroup size="lg">
          <InputLeftElement pointerEvents="none">
            <Icon as={SearchIcon} color="gray.500" />
          </InputLeftElement>
          <Input 
            placeholder="Search documentation..." 
            borderRadius="md" 
            bg="gray.800"
            borderColor="gray.600"
            _hover={{ borderColor: 'gray.500' }}
            _focus={{ borderColor: 'brand.400', boxShadow: `0 0 0 1px var(--chakra-colors-brand-400)` }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </InputGroup>
        <HStack width="full" justifyContent="flex-end">
          <Button 
            type="submit"
            colorScheme="brand" 
            rightIcon={<Icon as={ArrowRight} />}
          >
            Search
          </Button>
        </HStack>
      </VStack>
    </Card>
  );
};

// Testimonial component
const Testimonial = ({ quote, author, position }: { 
  quote: string; 
  author: string; 
  position: string;
}) => (
  <Card
    p={6}
    bg="rgba(17, 25, 40, 0.6)"
    backdropFilter="blur(10px)"
    borderWidth="1px"
    borderColor="gray.700"
    borderRadius="md"
    position="relative"
  >
    <Box 
      position="absolute" 
      top={3} 
      left={3} 
      color="brand.300" 
      fontSize="4xl" 
      fontFamily="serif" 
      lineHeight={1}
    >
      "
    </Box>
    <Box pt={6}>
      <Text fontSize="md" color="gray.300" fontStyle="italic" mb={4}>
        {quote}
      </Text>
      <Flex align="center" mt={4}>
        <Box h="24px" w="3px" bg="brand.400" mr={3} borderRadius="full" />
        <Box>
          <Text fontWeight="bold" color="white">{author}</Text>
          <Text fontSize="sm" color="gray.400">{position}</Text>
        </Box>
      </Flex>
    </Box>
  </Card>
);

export default function PublicDocumentation() {
  const router = useRouter();

  const handleSearch = (query: string) => {
    if (query) {
      router.push(`/documentation?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <Box 
      minH="100vh" 
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
          opacity: 0.7,
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
        bg="linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(26,32,44,0.95) 100%)" 
        zIndex={-1} 
      />

      {/* Hero Section */}
      <Container maxW="container.xl" pt={{ base: 20, md: 32 }} pb={20} px={{ base: 4, md: 8 }}>
        <Stack spacing={8} align="center" textAlign="center" mb={16}>
          <Heading 
            as="h1" 
            size="3xl" 
            fontWeight="bold" 
            letterSpacing="tight" 
            lineHeight="1.2" 
            bgGradient="linear(to-r, white, brand.200)"
            bgClip="text"
          >
            Infinity Documentation
          </Heading>
          <Text 
            fontSize={{ base: "xl", md: "2xl" }} 
            color="gray.300" 
            maxW="800px"
          >
            Everything you need to know about building with Infinity's data management system
          </Text>
          <HStack spacing={4} pt={4}>
            <Button 
              as={Link} 
              href="/documentation?doc=1-introduction"
              size="lg" 
              colorScheme="brand" 
              height="56px" 
              px={8}
              fontSize="md"
              rightIcon={<Icon as={ArrowRight} />}
            >
              Get Started
            </Button>
            <Button 
              as={Link} 
              href="/documentation?doc=5-api-reference"
              size="lg" 
              variant="outline" 
              height="56px" 
              px={8}
              fontSize="md"
              borderColor="whiteAlpha.400"
              _hover={{
                bg: "whiteAlpha.100",
                borderColor: "whiteAlpha.600"
              }}
            >
              API Reference
            </Button>
          </HStack>
        </Stack>

        {/* Search Section */}
        <SearchBox onSearch={handleSearch} />

        {/* Quick Access Cards */}
        <Box mb={20}>
          <Heading 
            as="h2" 
            size="lg" 
            mb={8} 
            textAlign="center" 
            color="white"
            fontWeight="semibold"
          >
            Popular Resources
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <DocCard 
              title="Introduction" 
              description="Learn what Infinity is and how it can help your business"
              path="1-introduction"
              icon={BookOpen}
            />
            <DocCard 
              title="Getting Started" 
              description="Step-by-step guide to creating your first data model"
              path="2-getting-started"
              icon={Check}
            />
            <DocCard 
              title="API Reference" 
              description="Complete API documentation for developers"
              path="5-api-reference"
              icon={Code}
            />
            <DocCard 
              title="Data Modeling" 
              description="Designing effective data structures for your needs"
              path="3-data-modeling"
              icon={Database}
            />
            <DocCard 
              title="Vector Search" 
              description="Implement AI-powered search across your data"
              path="7-vector-search"
              icon={SearchIcon}
            />
            <DocCard 
              title="Use Cases" 
              description="Real-world examples and applications"
              path="8-use-cases"
              icon={Users}
            />
          </SimpleGrid>
        </Box>

        {/* Core Features Section */}
        <Box mb={20}>
          <Heading 
            as="h2" 
            size="lg" 
            mb={2} 
            textAlign="center" 
            color="white"
            fontWeight="semibold"
          >
            Core Features
          </Heading>
          <Text 
            textAlign="center" 
            color="gray.400" 
            maxW="700px" 
            mx="auto" 
            mb={10}
          >
            Infinity provides powerful tools for managing your business data
          </Text>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
            <FeatureCard 
              title="Data Modeling" 
              description="Create custom data models with fields, validations, and relationships. Store your business data in a structured and organized way."
              icon={Database}
              color="#63B3ED" // blue
            />
            <FeatureCard 
              title="API Integration" 
              description="Connect with any application through our comprehensive RESTful API. Built-in authentication and rate limiting for security."
              icon={Code}
              color="#68D391" // green
            />
            <FeatureCard 
              title="Workflow Automation" 
              description="Integrate with n8n for powerful workflow automation. Create triggers, actions, and complex business logic."
              icon={Workflow}
              color="#F687B3" // pink
            />
            <FeatureCard 
              title="Vector Search" 
              description="AI-powered semantic search across your data. Find information based on meaning, not just keywords."
              icon={SearchIcon}
              color="#B794F4" // purple
            />
            <FeatureCard 
              title="Analytics" 
              description="Get insights into your data with built-in analytics. Track usage, monitor performance, and make data-driven decisions."
              icon={BarChart}
              color="#FC8181" // red
            />
            <FeatureCard 
              title="Role-Based Access" 
              description="Control who can access what with granular permissions. Protect sensitive data while enabling collaboration."
              icon={Users}
              color="#F6AD55" // orange
            />
          </SimpleGrid>
        </Box>

        {/* Testimonials Section */}
        <Box mb={20}>
          <Heading 
            as="h2" 
            size="lg" 
            mb={10} 
            textAlign="center" 
            color="white"
            fontWeight="semibold"
          >
            What Teams Are Saying
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Testimonial 
              quote="Infinity transformed how our team manages customer data. The ability to create custom models that perfectly match our business needs has been invaluable."
              author="Sarah Chen"
              position="Product Manager, TechSolutions Inc."
            />
            <Testimonial 
              quote="The API is so well-documented and easy to work with. We integrated our entire stack with Infinity in just a few days."
              author="Michael Rodriguez"
              position="Lead Developer, DataSync"
            />
            <Testimonial 
              quote="Vector search capabilities have revolutionized how we find information across our knowledge base. It's like having AI assistance built right in."
              author="Jessica Kim"
              position="Knowledge Manager, LearnQuest"
            />
          </SimpleGrid>
        </Box>

        {/* Version Updates */}
        <Box mb={16}>
          <Card
            p={8}
            bg="rgba(17, 25, 40, 0.8)"
            backdropFilter="blur(16px)"
            borderWidth="1px"
            borderColor="gray.700"
            borderRadius="lg"
          >
            <Heading as="h2" size="lg" mb={6} color="white" fontWeight="semibold">
              Latest Updates
            </Heading>
            <List spacing={5}>
              <ListItem>
                <HStack align="flex-start" spacing={4}>
                  <Flex 
                    bg="brand.900" 
                    color="brand.400" 
                    boxSize={10} 
                    borderRadius="md" 
                    alignItems="center" 
                    justifyContent="center"
                    flexShrink={0}
                    mt={1}
                  >
                    <Icon as={Star} boxSize={5} />
                  </Flex>
                  <Box>
                    <Heading as="h3" size="md" color="white" fontWeight="semibold">
                      Version 0.3.3
                    </Heading>
                    <Text color="gray.300" mt={1}>
                      Fixed PATCH endpoint to properly merge existing data with partial updates.
                      More reliable partial updates that don't unintentionally overwrite unmentioned fields.
                    </Text>
                    <ChakraLink
                      href="/documentation?doc=version-0.3.3"
                      color="brand.400"
                      display="inline-flex"
                      alignItems="center"
                      mt={2}
                      fontSize="sm"
                      fontWeight="medium"
                    >
                      Read release notes <Icon as={ArrowRight} ml={1} boxSize={4} />
                    </ChakraLink>
                  </Box>
                </HStack>
              </ListItem>
              <Divider borderColor="gray.700" my={2} />
              <ListItem>
                <HStack align="flex-start" spacing={4}>
                  <Flex 
                    bg="brand.900" 
                    color="brand.400" 
                    boxSize={10} 
                    borderRadius="md" 
                    alignItems="center" 
                    justifyContent="center"
                    flexShrink={0}
                    mt={1}
                  >
                    <Icon as={Star} boxSize={5} />
                  </Flex>
                  <Box>
                    <Heading as="h3" size="md" color="white" fontWeight="semibold">
                      Version 0.3.2
                    </Heading>
                    <Text color="gray.300" mt={1}>
                      Added vector search capabilities with semantic querying.
                      Improved data validation with custom rules and enhanced error messages.
                    </Text>
                    <ChakraLink
                      href="/documentation?doc=version-0.3.2"
                      color="brand.400"
                      display="inline-flex"
                      alignItems="center"
                      mt={2}
                      fontSize="sm"
                      fontWeight="medium"
                    >
                      Read release notes <Icon as={ArrowRight} ml={1} boxSize={4} />
                    </ChakraLink>
                  </Box>
                </HStack>
              </ListItem>
            </List>
          </Card>
        </Box>

        {/* Final CTA */}
        <Flex 
          direction="column" 
          align="center" 
          textAlign="center" 
          bg="rgba(17, 25, 40, 0.75)"
          backdropFilter="blur(16px)"
          borderWidth="1px"
          borderColor="gray.700"
          borderRadius="xl"
          p={{ base: 8, md: 12 }}
        >
          <Heading 
            as="h2" 
            size="xl" 
            fontWeight="bold" 
            color="white" 
            mb={4} 
            letterSpacing="tight"
          >
            Ready to build with Infinity?
          </Heading>
          <Text 
            fontSize="lg" 
            color="gray.300" 
            maxW="700px" 
            mb={8}
          >
            Infinity provides the tools you need to manage your data and automate your workflows.
            Get started today.
          </Text>
          <HStack spacing={4}>
            <Button 
              as={Link}
              href="/register"
              size="lg" 
              colorScheme="brand" 
              height="56px" 
              px={8}
              fontSize="md"
            >
              Create Account
            </Button>
            <Button 
              as={Link}
              href="/documentation?doc=1-introduction"
              size="lg" 
              variant="ghost" 
              height="56px" 
              px={8}
              fontSize="md"
              _hover={{
                bg: "whiteAlpha.100"
              }}
            >
              Read Documentation
            </Button>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
} 