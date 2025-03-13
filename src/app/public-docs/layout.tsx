'use client';

import { Box, Flex, HStack, Button, IconButton, useDisclosure, Container, Text, Link as ChakraLink, Image } from '@chakra-ui/react';
import Link from 'next/link';
import { Menu, X, Github, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function PublicDocLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen, onToggle } = useDisclosure();
  const [scrolled, setScrolled] = useState(false);
  
  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Box minH="100vh">
      {/* Navigation Header */}
      <Box 
        as="nav" 
        position="fixed" 
        top={0} 
        left={0} 
        right={0} 
        zIndex={10}
        transition="all 0.3s ease"
        bg={scrolled ? "rgba(17, 25, 40, 0.85)" : "transparent"}
        backdropFilter={scrolled ? "blur(10px)" : "none"}
        borderBottom={scrolled ? "1px solid" : "none"}
        borderColor="gray.800"
        py={scrolled ? 2 : 4}
      >
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center" px={4}>
            <HStack spacing={8} align="center">
              <Link href="/" passHref>
                <Box as="a" display="flex" alignItems="center">
                  <Box boxSize={10} position="relative">
                    <Box
                      position="absolute"
                      top={0}
                      left={0}
                      right={0}
                      bottom={0}
                      bg="brand.500"
                      borderRadius="md"
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
                      fontSize="lg"
                    >
                      ∞
                    </Flex>
                  </Box>
                  <Text
                    fontSize="lg"
                    fontWeight="bold"
                    color="white"
                    ml={3}
                  >
                    Infinity
                  </Text>
                </Box>
              </Link>
              
              {/* Desktop Links */}
              <HStack spacing={8} display={{ base: 'none', md: 'flex' }}>
                <Link href="/public-docs" passHref>
                  <ChakraLink color="gray.200" fontWeight="medium" _hover={{ color: 'white' }}>
                    Documentation
                  </ChakraLink>
                </Link>
                <Link href="/documentation?doc=5-api-reference" passHref>
                  <ChakraLink color="gray.200" fontWeight="medium" _hover={{ color: 'white' }}>
                    API
                  </ChakraLink>
                </Link>
                <ChakraLink 
                  href="https://github.com/your-repo" 
                  isExternal
                  color="gray.200" 
                  fontWeight="medium" 
                  _hover={{ color: 'white' }}
                  display="flex"
                  alignItems="center"
                >
                  Github <ExternalLink size={14} style={{ marginLeft: '4px' }} />
                </ChakraLink>
              </HStack>
            </HStack>
            
            {/* Auth Buttons */}
            <HStack spacing={4} display={{ base: 'none', md: 'flex' }}>
              <Link href="/login" passHref>
                <Button variant="ghost" fontWeight="medium" color="gray.200" _hover={{ bg: 'whiteAlpha.200' }}>
                  Sign In
                </Button>
              </Link>
              <Link href="/register" passHref>
                <Button colorScheme="brand" fontWeight="medium">
                  Get Started
                </Button>
              </Link>
            </HStack>
            
            {/* Mobile menu button */}
            <IconButton
              aria-label="Toggle Menu"
              icon={isOpen ? <X /> : <Menu />}
              onClick={onToggle}
              variant="ghost"
              color="white"
              display={{ base: 'flex', md: 'none' }}
              _hover={{ bg: 'whiteAlpha.200' }}
            />
          </Flex>
          
          {/* Mobile Menu */}
          <Box 
            display={{ base: isOpen ? 'block' : 'none', md: 'none' }} 
            mt={4} 
            py={4} 
            px={2}
            bg="gray.800"
            borderRadius="md"
            borderWidth="1px"
            borderColor="gray.700"
          >
            <Flex direction="column">
              <ChakraLink 
                as={Link} 
                href="/public-docs"
                color="gray.200" 
                fontWeight="medium" 
                py={2} 
                px={3}
                _hover={{ bg: 'whiteAlpha.100', borderRadius: 'md' }}
              >
                Documentation
              </ChakraLink>
              <ChakraLink 
                as={Link} 
                href="/documentation?doc=5-api-reference"
                color="gray.200" 
                fontWeight="medium" 
                py={2} 
                px={3}
                _hover={{ bg: 'whiteAlpha.100', borderRadius: 'md' }}
              >
                API
              </ChakraLink>
              <ChakraLink 
                href="https://github.com/your-repo" 
                isExternal
                color="gray.200" 
                fontWeight="medium" 
                py={2} 
                px={3}
                _hover={{ bg: 'whiteAlpha.100', borderRadius: 'md' }}
                display="flex"
                alignItems="center"
              >
                Github <ExternalLink size={14} style={{ marginLeft: '4px' }} />
              </ChakraLink>
              <Flex direction="column" mt={4} pt={4} borderTopWidth="1px" borderColor="gray.700">
                <Link href="/login" passHref>
                  <Button variant="ghost" w="full" justifyContent="flex-start" mb={2} color="gray.200">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" passHref>
                  <Button colorScheme="brand" w="full">
                    Get Started
                  </Button>
                </Link>
              </Flex>
            </Flex>
          </Box>
        </Container>
      </Box>
      
      {/* Main Content */}
      <Box pt={{ base: 16, md: 20 }}>
        {children}
      </Box>
      
      {/* Footer */}
      <Box bg="gray.900" color="gray.400" py={10} borderTopWidth="1px" borderColor="gray.800">
        <Container maxW="container.xl">
          <Flex 
            direction={{ base: 'column', md: 'row' }} 
            justify="space-between" 
            align={{ base: 'center', md: 'flex-start' }}
            textAlign={{ base: 'center', md: 'left' }}
            px={4}
          >
            <Flex direction="column" mb={{ base: 8, md: 0 }}>
              <Box display="flex" alignItems="center" justifyContent={{ base: 'center', md: 'flex-start' }} mb={4}>
                <Box boxSize={8} position="relative">
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    bg="brand.500"
                    borderRadius="md"
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
                  >
                    ∞
                  </Flex>
                </Box>
                <Text fontSize="lg" fontWeight="bold" color="white" ml={2}>
                  Infinity
                </Text>
              </Box>
              <Text fontSize="sm" maxW="300px" mb={4}>
                Your centralized data management system for automation workflows
              </Text>
              <Text fontSize="xs" color="gray.500">
                © {new Date().getFullYear()} AiwaLabs. All rights reserved.
              </Text>
            </Flex>
            
            <Flex direction={{ base: 'column', md: 'row' }} gap={{ base: 8, md: 16 }}>
              <Flex direction="column" gap={3}>
                <Text color="white" fontWeight="semibold" mb={2}>
                  Product
                </Text>
                <ChakraLink as={Link} href="/public-docs" color="gray.400" fontSize="sm" _hover={{ color: 'white' }}>
                  Documentation
                </ChakraLink>
                <ChakraLink as={Link} href="/documentation?doc=5-api-reference" color="gray.400" fontSize="sm" _hover={{ color: 'white' }}>
                  API Reference
                </ChakraLink>
                <ChakraLink as={Link} href="/documentation?doc=7-vector-search" color="gray.400" fontSize="sm" _hover={{ color: 'white' }}>
                  Vector Search
                </ChakraLink>
              </Flex>
              
              <Flex direction="column" gap={3}>
                <Text color="white" fontWeight="semibold" mb={2}>
                  Company
                </Text>
                <ChakraLink href="mailto:aiwahlabs@gmail.com" color="gray.400" fontSize="sm" _hover={{ color: 'white' }}>
                  Contact
                </ChakraLink>
                <ChakraLink href="https://github.com/your-repo" isExternal color="gray.400" fontSize="sm" _hover={{ color: 'white' }}>
                  Github
                </ChakraLink>
              </Flex>
            </Flex>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
} 