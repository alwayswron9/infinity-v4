import { Box, Flex, Heading, Text, VStack, Card, CardHeader, CardBody } from "@chakra-ui/react";

interface SectionProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function Section({ children, title, description, actions, className }: SectionProps) {
  return (
    <Card 
      variant="outline" 
      bg="white" 
      borderColor="gray.200" 
      _dark={{ bg: "gray.800", borderColor: "gray.700" }}
      className={className}
      mb={6}
      shadow="sm"
    >
      {(title || actions) && (
        <CardHeader pb={description ? 2 : 4}>
          <Flex alignItems="center" justifyContent="space-between">
            <Box>
              {title && <Heading as="h2" size="md">{title}</Heading>}
              {description && <Text fontSize="sm" color="gray.500" _dark={{ color: "gray.400" }} mt={1}>{description}</Text>}
            </Box>
            {actions && <Flex alignItems="center" gap={3}>{actions}</Flex>}
          </Flex>
        </CardHeader>
      )}
      <CardBody pt={(title || actions) && !description ? 0 : 4}>
        {children}
      </CardBody>
    </Card>
  );
} 