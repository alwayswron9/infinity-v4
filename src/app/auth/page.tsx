import { Suspense } from 'react';
import { Box, Spinner, Center } from '@chakra-ui/react';
import dynamic from 'next/dynamic';

// Import the client component without ssr: false
const AuthPageContent = dynamic(() => import('./AuthPageContent'));

// Loading fallback that matches the styling of the main component
function LoadingFallback() {
  return (
    <Box 
      minH="100vh" 
      display="flex" 
      flexDirection="column" 
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
          filter: "grayscale(100%)",
          WebkitFilter: "grayscale(100%)",
          zIndex: -1
        }
      }}
    >
      <Center flex={1}>
        <Spinner 
          size="xl" 
          color="brand.500" 
          thickness="4px"
          speed="0.65s"
        />
      </Center>
    </Box>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthPageContent />
    </Suspense>
  );
}
