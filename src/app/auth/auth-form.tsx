'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Button, 
  FormControl, 
  FormLabel,
  FormErrorMessage, 
  Input, 
  InputGroup, 
  InputRightElement, 
  VStack, 
  Text, 
  Box, 
  Icon,
  Divider,
  Stack
} from '@chakra-ui/react';
import { 
  User, 
  Mail, 
  Lock 
} from 'lucide-react';

interface AuthFormProps {
  mode: 'login' | 'register';
}

interface ValidationError {
  field?: string;
  message: string;
}

// Helper to format error message
const formatErrorMessage = (error: ValidationError) => {
  if (!error.field) return error.message;
  
  // Capitalize field name and format message
  const fieldName = error.field.charAt(0).toUpperCase() + error.field.slice(1);
  return `${fieldName}: ${error.message}`;
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<ValidationError | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = mode === 'login'
      ? {
          username: formData.get('username') as string,
          password: formData.get('password') as string,
        }
      : {
          username: formData.get('username') as string,
          email: formData.get('email') as string,
          name: formData.get('name') as string,
          password: formData.get('password') as string,
        };

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error) {
          if (typeof result.error === 'object' && result.error.field) {
            setError(result.error as ValidationError);
          } else {
            setError({ message: result.error });
          }
          return;
        }
        throw new Error('Authentication failed');
      }

      // Get the from parameter and redirect accordingly
      const from = searchParams.get('from');
      const redirectTo = from || '/dashboard';
      router.replace(redirectTo);
    } catch (err) {
      setError({ 
        message: err instanceof Error ? err.message : 'An unexpected error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <Stack spacing={4}>
          {/* Username */}
          <FormControl isInvalid={error?.field === 'username'}>
            <InputGroup size="md">
              <Input
                id="username"
                name="username"
                type="text"
                required
                placeholder="Username"
                bg="gray.800"
                borderColor="gray.600"
                _hover={{ borderColor: 'gray.500' }}
                _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' }}
                fontSize="md"
              />
              <InputRightElement color="gray.500">
                <Icon as={User} boxSize={4} />
              </InputRightElement>
            </InputGroup>
            {error?.field === 'username' && (
              <FormErrorMessage>{error.message}</FormErrorMessage>
            )}
          </FormControl>

          {/* Email and Name - Only for Register */}
          {mode === 'register' && (
            <>
              <FormControl isInvalid={error?.field === 'email'}>
                <InputGroup size="md">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="Email address"
                    bg="gray.800"
                    borderColor="gray.600"
                    _hover={{ borderColor: 'gray.500' }}
                    _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' }}
                    fontSize="md"
                  />
                  <InputRightElement color="gray.500">
                    <Icon as={Mail} boxSize={4} />
                  </InputRightElement>
                </InputGroup>
                {error?.field === 'email' && (
                  <FormErrorMessage>{error.message}</FormErrorMessage>
                )}
              </FormControl>

              <FormControl isInvalid={error?.field === 'name'}>
                <InputGroup size="md">
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="Full name"
                    bg="gray.800"
                    borderColor="gray.600"
                    _hover={{ borderColor: 'gray.500' }}
                    _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' }}
                    fontSize="md"
                  />
                  <InputRightElement color="gray.500">
                    <Icon as={User} boxSize={4} />
                  </InputRightElement>
                </InputGroup>
                {error?.field === 'name' && (
                  <FormErrorMessage>{error.message}</FormErrorMessage>
                )}
              </FormControl>
            </>
          )}

          {/* Password */}
          <FormControl isInvalid={error?.field === 'password'}>
            <InputGroup size="md">
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                placeholder="Password"
                bg="gray.800"
                borderColor="gray.600"
                _hover={{ borderColor: 'gray.500' }}
                _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' }}
                fontSize="md"
              />
              <InputRightElement color="gray.500">
                <Icon as={Lock} boxSize={4} />
              </InputRightElement>
            </InputGroup>
            {error?.field === 'password' && (
              <FormErrorMessage>{error.message}</FormErrorMessage>
            )}
          </FormControl>

          {/* Generic Error Message */}
          {error && !error.field && (
            <Text fontSize="sm" color="red.500" textAlign="center">
              {error.message}
            </Text>
          )}

          {/* Submit Button */}
          <Box pt={2}>
            <Button
              type="submit"
              isLoading={loading}
              loadingText="Processing..."
              colorScheme="brand"
              size="md"
              width="full"
              borderRadius="md"
              _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
              _active={{ transform: 'translateY(0)', boxShadow: 'sm' }}
            >
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </Box>
        </Stack>
      </form>
    </Box>
  );
} 