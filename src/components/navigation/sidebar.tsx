'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Box, 
  VStack, 
  Heading, 
  Flex, 
  Icon, 
  Text, 
  Button, 
  Divider
} from '@chakra-ui/react';
import { 
  Home as HomeIcon, 
  Database as DatabaseIcon, 
  Settings as SettingsIcon, 
  LogOut as LogOutIcon 
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: HomeIcon },
  { href: '/models', label: 'Models', icon: DatabaseIcon },
  { href: '/settings', label: 'Settings', icon: SettingsIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      // Call logout API
      await fetch('/api/auth/logout', { 
        method: 'GET',
        credentials: 'same-origin'
      });

      // Clear client-side storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Force reload to clear any cached state
      window.location.replace('/');
    } catch (error) {
      console.error('Logout failed:', error);
      window.location.replace('/');
    }
  };

  return (
    <Box 
      as="aside" 
      w="64" 
      h="100vh" 
      position="sticky" 
      top="0" 
      bg="gray.900" 
      borderRightWidth="1px" 
      borderRightColor="gray.700" 
      display="flex" 
      flexDirection="column"
    >
      <Box p="6">
        <Heading size="md" fontWeight="semibold" color="purple.500">Infinity</Heading>
      </Box>
      
      <VStack as="nav" flex="1" px="4" spacing="2" align="stretch">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link href={item.href} key={item.href} style={{ textDecoration: 'none' }}>
              <Flex
                align="center"
                gap="3"
                px="4"
                py="2"
                borderRadius="lg"
                transition="all 0.2s"
                bg={isActive ? 'purple.500' : 'transparent'}
                color={isActive ? 'white' : 'gray.400'}
                _hover={{
                  bg: isActive ? 'purple.600' : 'gray.800',
                  color: isActive ? 'white' : 'gray.200'
                }}
              >
                <Icon as={item.icon} boxSize="5" />
                <Text>{item.label}</Text>
              </Flex>
            </Link>
          );
        })}
      </VStack>

      <Divider borderColor="gray.700" />
      <Box p="4">
        <Button
          variant="ghost"
          justifyContent="flex-start"
          width="full"
          leftIcon={<Icon as={LogOutIcon} boxSize="5" />}
          onClick={handleLogout}
          color="gray.400"
          _hover={{ bg: 'gray.800', color: 'gray.200' }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
} 