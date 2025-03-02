'use client';

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Box, 
  Center, 
  Container, 
  Heading, 
  Text, 
  VStack, 
  Card,
  CardBody,
  CardHeader,
  Badge
} from "@chakra-ui/react";
import { AuthForm } from "./auth-form";
import { VersionInfo } from "@/utils/versions";

export default function AuthPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [randomQuote, setRandomQuote] = useState('');
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [versionLoading, setVersionLoading] = useState(true);

  // Fetch version info
  useEffect(() => {
    async function fetchVersionInfo() {
      try {
        const response = await fetch('/api/versions');
        if (response.ok) {
          const data = await response.json();
          setVersionInfo(data.latestVersion);
        }
      } catch (error) {
        console.error('Failed to fetch version info:', error);
      } finally {
        setVersionLoading(false);
      }
    }
    
    fetchVersionInfo();
  }, []);

  // Helper to determine if we need to set initial mode
  useEffect(() => {
    // Set the mode initially based on URL
    const modeParam = searchParams.get("mode");
    if (modeParam === "register" || modeParam === "login") {
      setMode(modeParam);
    }
    
    // Set a professional tagline for login page
    if (modeParam === "login" || !modeParam) {
      const taglines = [
        "Enterprise knowledge management solution.",
        "Secure document infrastructure for businesses.",
        "Streamline information workflows.",
        "Optimize enterprise data accessibility.",
        "Advanced information architecture platform."
      ];
      setRandomQuote(taglines[Math.floor(Math.random() * taglines.length)]);
    }
  }, [searchParams]);

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
      {/* Beta warning banner */}
      <Box w="full" bg="orange.900" py={1} textAlign="center">
        <Text fontSize="xs" fontWeight="light" color="orange.500">
          <Text as="span" fontWeight="medium">BETA VERSION</Text> — Not for production use. Data may be reset at any time.
        </Text>
      </Box>

      {/* Main content */}
      <Center flex={1} px={4}>
        <Container maxW={mode === "login" ? "md" : "lg"} py={8}>
          {/* Logo and Title */}
          <VStack mb={6} spacing={2} textAlign="center">
            <Heading as="h1" fontSize="4xl" fontWeight="medium" color="brand.500" letterSpacing="tight">
              Infinity
            </Heading>
            {versionInfo && (
              <Badge colorScheme="gray" fontSize="xs" variant="subtle">
                v{versionInfo.version} - unstable preview
              </Badge>
            )}
          </VStack>

          {/* Authentication Card */}
          <Card bg="gray.800" borderColor="gray.700" variant="outline" shadow="md">
            <CardHeader pb={0}>
              <Heading size="md" textAlign="center" color="white">
                {mode === "login" ? "Sign In" : "Create Account"}
              </Heading>
            </CardHeader>
            <CardBody pt={4}>
              <AuthForm mode={mode} />
            </CardBody>
          </Card>

          {/* Mode toggle link */}
          <Text textAlign="center" fontSize="sm" color="gray.400" mt={4}>
            {mode === "login" ? "Need an account?" : "Already have an account?"}{" "}
            <Link
              href={mode === "login" ? "/auth?mode=register" : "/auth?mode=login"}
              style={{
                color: 'var(--chakra-colors-brand-500)',
                fontWeight: '500',
                transition: 'color 0.2s ease'
              }}
            >
              {mode === "login" ? "Register" : "Sign in"}
            </Link>
          </Text>
        </Container>
      </Center>
    </Box>
  );
} 