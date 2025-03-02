import { Box, Container } from '@chakra-ui/react';

interface PageContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  className?: string;
}

export function PageContainer({ children, maxWidth = '7xl', className }: PageContainerProps) {
  return (
    <Container maxW={maxWidth} px="4" py="4" className={className}>
      <Box display="flex" flexDirection="column" gap="6">
        {children}
      </Box>
    </Container>
  );
} 