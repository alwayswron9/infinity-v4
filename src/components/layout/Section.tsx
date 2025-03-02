import { Box, Flex, Heading, Text, VStack } from "@chakra-ui/react";

interface SectionProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function Section({ children, title, description, actions, className }: SectionProps) {
  return (
    <Box 
      bg="gray.800" 
      rounded="xl" 
      p="4" 
      mb="6" 
      className={className}
    >
      {(title || actions) && (
        <Flex alignItems="center" justifyContent="space-between" mb="4" px="4">
          <Box>
            {title && <Heading as="h2" size="md" color="gray.100">{title}</Heading>}
            {description && <Text fontSize="sm" color="gray.400" mt="1">{description}</Text>}
          </Box>
          {actions && <Flex alignItems="center" gap="3">{actions}</Flex>}
        </Flex>
      )}
      <VStack spacing="4" align="stretch" px="4">
        {children}
      </VStack>
    </Box>
  );
} 