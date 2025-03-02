import { Box, Flex, Heading, Icon, Text } from '@chakra-ui/react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, backHref, actions }: PageHeaderProps) {
  return (
    <Flex alignItems="center" gap="4" mb="6" px="4">
      {backHref && (
        <Link
          href={backHref}
          style={{
            padding: '8px',
            borderRadius: '8px',
            transition: 'background-color 0.2s',
            color: 'var(--chakra-colors-gray-400)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--chakra-colors-gray-700)';
            e.currentTarget.style.color = 'var(--chakra-colors-gray-100)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--chakra-colors-gray-400)';
          }}
        >
          <Icon as={ArrowLeft} boxSize="5" />
        </Link>
      )}
      <Box flex="1">
        <Heading as="h1" size="lg" color="gray.100">{title}</Heading>
        {description && (
          <Text color="gray.400" mt="1">{description}</Text>
        )}
      </Box>
      {actions && (
        <Flex alignItems="center" gap="3">
          {actions}
        </Flex>
      )}
    </Flex>
  );
} 