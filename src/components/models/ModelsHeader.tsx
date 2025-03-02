import Link from 'next/link';
import { Search, Plus } from 'lucide-react';
import { 
  Box, 
  Button,
  Card,
  CardBody,
  Flex, 
  Heading, 
  Icon, 
  Input,
  InputGroup,
  InputLeftElement,
  FormControl,
  FormLabel,
  Switch, 
  HStack,
  Stack,
  Text,
  Spacer
} from '@chakra-ui/react';

interface ModelsHeaderProps {
  searchQuery: string;
  showArchived: boolean;
  onSearchChange: (query: string) => void;
  onShowArchivedChange: (show: boolean) => void;
}

export function ModelsHeader({
  searchQuery,
  showArchived,
  onSearchChange,
  onShowArchivedChange
}: ModelsHeaderProps) {
  return (
    <Stack spacing="6">
      <Flex 
        justifyContent="space-between" 
        alignItems="center" 
      >
        <Box>
          <Heading as="h1" size="lg" fontWeight="semibold" letterSpacing="-0.02em" color="white">
            Models
          </Heading>
          <Text color="gray.400" mt="1" fontSize="sm">
            Create and manage your data models
          </Text>
        </Box>
        
        <Link href="/models/new" style={{ textDecoration: 'none' }}>
          <Button
            leftIcon={<Icon as={Plus} boxSize="4" />}
            colorScheme="brand"
            size="md"
            fontWeight="medium"
            borderRadius="md"
            px="4"
            _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
          >
            Add model
          </Button>
        </Link>
      </Flex>

      <Card 
        bg="gray.800" 
        borderColor="gray.700"
        variant="outline"
        borderRadius="lg"
        boxShadow="sm"
      >
        <CardBody py="4">
          <Flex 
            direction={{ base: "column", md: "row" }} 
            gap={{ base: "4", md: "6" }}
            alignItems={{ md: "center" }}
          >
            <Box flex="1" maxW={{ md: "md" }}>
              <InputGroup size="md">
                <InputLeftElement pointerEvents="none">
                  <Icon as={Search} color="gray.500" boxSize="4" />
                </InputLeftElement>
                <Input
                  placeholder="Search models..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  bg="gray.900"
                  color="gray.100"
                  borderColor="gray.700"
                  fontSize="sm"
                  borderRadius="md"
                  _hover={{ borderColor: "gray.600" }}
                  _focus={{ 
                    borderColor: "brand.500", 
                    boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
                    bg: "gray.900" 
                  }}
                  _placeholder={{ color: "gray.500" }}
                />
              </InputGroup>
            </Box>
            
            <Spacer display={{ base: "none", md: "block" }} />
            
            <FormControl display="flex" alignItems="center" width="auto" justifyContent="flex-end">
              <FormLabel htmlFor="show-archived" mb="0" mr="3" fontSize="sm" color="gray.300" fontWeight="medium">
                Show archived
              </FormLabel>
              <Switch
                id="show-archived"
                isChecked={showArchived}
                onChange={(e) => onShowArchivedChange(e.target.checked)}
                colorScheme="brand"
                size="md"
              />
            </FormControl>
          </Flex>
        </CardBody>
      </Card>
    </Stack>
  );
} 