"use client";

import { useState, useEffect } from "react";
import { AuthForm } from "@/components/ui/auth-form";
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
  CardHeader
} from "@chakra-ui/react";

export default function Auth() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [randomQuote, setRandomQuote] = useState('');

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

  const toggleMode = (newMode: "login" | "register") => {
    setMode(newMode);
    // This function is kept for backward compatibility
  };

  return (
    <Box minH="100vh" display="flex" flexDirection="column" bg="gray.900">
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
            <Heading as="h1" fontSize="4xl" fontWeight="medium" color="purple.500" letterSpacing="tight">
              Infinity
            </Heading>
            {mode === "login" ? (
              <Text fontSize="md" color="gray.400" maxW="md">
                {randomQuote}
              </Text>
            ) : (
              <Text fontSize="md" color="gray.400" maxW="md">
                The predictable core bringing structure to your automation journey.
              </Text>
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
                color: 'var(--chakra-colors-purple-500)',
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
