'use client';

import { useState, useEffect } from 'react';
import { KeyIcon, PlusIcon, ClipboardIcon, TrashIcon, CheckIcon, ShieldCheckIcon, ClockIcon, AlertCircleIcon } from 'lucide-react';
import { 
  Box,
  Container,
  Card,
  Stack,
  Heading,
  Text,
  Flex,
  Button,
  Icon,
  Input,
  IconButton,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  FormControl,
  FormLabel,
  FormHelperText,
  HStack,
  VStack,
  Divider,
  useDisclosure,
  Badge,
  Spinner
} from '@chakra-ui/react';
import { toast } from 'react-hot-toast';

interface ApiKey {
  id: string;
  name: string;
  created_at: string;
  last_used?: string;
  prefix: string;
  status: 'active' | 'inactive';
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('access-tokens');
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/auth/apikey');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch keys');
      }
      const data = await response.json();
      setApiKeys(data.api_keys || []);
    } catch (error) {
      console.error('Error in fetchApiKeys:', error);
      toast.error(error instanceof Error ? error.message : 'Error loading API keys');
    }
  };

  const createApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) {
      toast.error('Please enter a name for your API key');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/auth/apikey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to create key');
      }
      
      setNewKey(data.key);
      await fetchApiKeys();
      setNewKeyName('');
      setShowCreateForm(false);
      toast.success('API key created! Copy it now - it won\'t be shown again');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error creating API key');
    } finally {
      setIsCreating(false);
    }
  };

  const revokeApiKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/auth/apikey/${keyId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Failed to revoke key');
      }
      
      setApiKeys(keys => keys.filter(k => k.id !== keyId));
      toast.success('API key revoked successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error revoking API key');
    }
  };

  return (
    <Box minH="calc(100vh - 64px)" bg="gray.900" py={6} px={{ base: 4, md: 6 }}>
      <Container maxW="container.xl" px={0}>
        {/* Page Header */}
        <Stack spacing={4} mb={6}>
          <Flex justifyContent="space-between" alignItems="center">
            <Box>
              <Heading size="lg" fontWeight="semibold" color="white" letterSpacing="-0.02em">
                Settings
              </Heading>
              <Text mt={1} color="gray.400" fontSize="sm">
                Manage your account and API keys
              </Text>
            </Box>
          </Flex>
        </Stack>

        {/* Content Area */}
        <Tabs variant="enclosed" colorScheme="purple" isLazy>
          <TabList borderBottomColor="gray.700">
            <Tab 
              _selected={{ color: 'white', bg: 'gray.800', borderColor: 'gray.700', borderBottomColor: 'gray.800' }}
              color="gray.400"
              borderColor="transparent"
              borderTopRadius="md"
              fontWeight="medium"
              fontSize="sm"
              onClick={() => setActiveTab('access-tokens')}
            >
              Access Tokens
            </Tab>
          </TabList>
          
          <TabPanels>
            <TabPanel p={4}>
              <VStack spacing={6} align="stretch">
                {/* API Key Information */}
                <Card bg="gray.800" borderWidth="1px" borderColor="gray.700" borderRadius="md" p={4}>
                  <Flex gap={3}>
                    <Flex 
                      bg="gray.700" 
                      color="purple.400" 
                      boxSize={10} 
                      borderRadius="md" 
                      alignItems="center" 
                      justifyContent="center"
                      flexShrink={0}
                    >
                      <Icon as={ShieldCheckIcon} boxSize={5} />
                    </Flex>
                    <Box>
                      <Heading as="h3" fontSize="md" fontWeight="semibold" color="white" mb={2}>
                        About API Keys
                      </Heading>
                      <VStack align="stretch" spacing={2} fontSize="sm" color="gray.400">
                        <Text>• API keys grant programmatic access to your data</Text>
                        <Text>• Each key should be used for a specific purpose or integration</Text>
                        <Text>• Keys are shown only once upon creation - store them securely</Text>
                        <Text>• Revoke keys immediately if they are compromised</Text>
                      </VStack>
                    </Box>
                  </Flex>
                </Card>

                {/* Create New Key Form */}
                {showCreateForm ? (
                  <Card as="form" onSubmit={createApiKey} bg="gray.800" borderWidth="1px" borderColor="gray.700" borderRadius="md" p={4}>
                    <VStack spacing={4} align="stretch">
                      <Heading as="h3" fontSize="md" fontWeight="semibold" color="white">
                        Create New API Key
                      </Heading>
                      
                      <FormControl>
                        <FormLabel fontSize="sm" fontWeight="medium" color="gray.400">
                          Key Name
                        </FormLabel>
                        <Input
                          value={newKeyName}
                          onChange={(e) => setNewKeyName(e.target.value)}
                          placeholder="e.g., Production API, Development Key"
                          size="md"
                          bg="gray.900"
                          borderColor="gray.700"
                          _hover={{ borderColor: "gray.600" }}
                          _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)" }}
                          isDisabled={isCreating}
                        />
                        <FormHelperText fontSize="xs" color="gray.500">
                          Choose a descriptive name to help you identify this key later
                        </FormHelperText>
                      </FormControl>
                      
                      <HStack spacing={2}>
                        <Button
                          type="submit"
                          colorScheme="purple"
                          isLoading={isCreating}
                          loadingText="Creating..."
                          isDisabled={isCreating}
                        >
                          Create Key
                        </Button>
                        <Button
                          variant="ghost"
                          color="gray.400"
                          _hover={{ color: "white", bg: "gray.700" }}
                          onClick={() => setShowCreateForm(false)}
                        >
                          Cancel
                        </Button>
                      </HStack>
                    </VStack>
                  </Card>
                ) : (
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    leftIcon={<Icon as={PlusIcon} boxSize={4} />}
                    colorScheme="purple"
                    size="md"
                    alignSelf="flex-start"
                  >
                    Create New API Key
                  </Button>
                )}

                {/* Newly Created Key */}
                {newKey && (
                  <Card bg="gray.800" borderWidth="1px" borderColor="yellow.600" borderRadius="md" p={4}>
                    <VStack spacing={4} align="stretch">
                      <Flex gap={3}>
                        <Icon as={AlertCircleIcon} boxSize={5} color="yellow.300" />
                        <Box>
                          <Heading as="h3" fontSize="md" fontWeight="semibold" color="yellow.300">
                            Save Your API Key
                          </Heading>
                          <Text fontSize="sm" color="gray.400" mt={1}>
                            Copy this key now. For security reasons, it won't be shown again.
                          </Text>
                        </Box>
                      </Flex>
                      
                      <Flex 
                        bg="gray.900" 
                        p={3} 
                        borderRadius="md" 
                        borderWidth="1px" 
                        borderColor="gray.700"
                        align="center"
                      >
                        <Box 
                          as="code" 
                          fontFamily="mono" 
                          fontSize="sm" 
                          flex="1" 
                          overflowX="auto" 
                          color="gray.300" 
                          py={1}
                          px={2}
                        >
                          {newKey}
                        </Box>
                        <IconButton
                          aria-label="Copy to clipboard"
                          icon={<Icon as={ClipboardIcon} boxSize={4} />}
                          size="sm"
                          variant="ghost"
                          color="gray.400"
                          _hover={{ color: "white", bg: "gray.700" }}
                          onClick={() => {
                            navigator.clipboard.writeText(newKey);
                            toast.success('API key copied to clipboard');
                          }}
                        />
                      </Flex>
                    </VStack>
                  </Card>
                )}

                {/* API Keys List */}
                <VStack spacing={4} align="stretch">
                  <Heading as="h3" fontSize="md" fontWeight="semibold" color="white">
                    Your API Keys
                  </Heading>
                  
                  {apiKeys.length === 0 ? (
                    <Text color="gray.400" fontSize="sm">
                      You haven't created any API keys yet.
                    </Text>
                  ) : (
                    apiKeys.map(key => (
                      <Card 
                        key={key.id}
                        bg="gray.800" 
                        borderWidth="1px" 
                        borderColor="gray.700" 
                        borderRadius="md" 
                        p={4}
                      >
                        <Flex justify="space-between" align="center">
                          <VStack spacing={1} align="start">
                            <Flex align="center" gap={2}>
                              <Flex 
                                bg="gray.700" 
                                color="purple.400" 
                                boxSize={8} 
                                borderRadius="md" 
                                alignItems="center" 
                                justifyContent="center"
                              >
                                <Icon as={KeyIcon} boxSize={4} />
                              </Flex>
                              <Heading as="h4" fontSize="md" fontWeight="semibold" color="white">
                                {key.name}
                              </Heading>
                            </Flex>
                            
                            <HStack spacing={4} fontSize="sm" color="gray.400" ml={10}>
                              <Text fontFamily="mono">{key.prefix}•••••••</Text>
                              <Flex align="center" gap={1}>
                                <Icon as={ClockIcon} boxSize={3} />
                                <Text>Created {new Date(key.created_at).toLocaleDateString()}</Text>
                              </Flex>
                              {key.last_used && (
                                <Flex align="center" gap={1}>
                                  <Icon as={CheckIcon} boxSize={3} />
                                  <Text>Last used {new Date(key.last_used).toLocaleDateString()}</Text>
                                </Flex>
                              )}
                            </HStack>
                          </VStack>
                          
                          <IconButton
                            aria-label="Revoke API key"
                            icon={<Icon as={TrashIcon} boxSize={4} />}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => revokeApiKey(key.id)}
                          />
                        </Flex>
                      </Card>
                    ))
                  )}
                </VStack>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </Box>
  );
} 