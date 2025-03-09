import React from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Divider,
  Heading,
  Text,
  Box,
  Tag,
  useColorModeValue,
  VStack,
  HStack,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { VersionInfo } from '@/utils/versions';
import { CheckCircleIcon, InfoIcon, WarningIcon } from '@chakra-ui/icons';

interface VersionDisplayProps {
  version: VersionInfo;
  isLatest?: boolean;
}

export const VersionDisplay: React.FC<VersionDisplayProps> = ({
  version,
  isLatest = false,
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const latestTagColor = 'green';
  
  // Parse release notes to extract sections
  const parseReleaseNotes = (notes: string): {
    main: string;
    sections: {
      internal: string[];
      issues: string[];
    }
  } => {
    if (!notes) return { 
      main: 'No release notes available', 
      sections: { 
        internal: [], 
        issues: [] 
      } 
    };
    
    const lines = notes.split('.');
    const sections: {
      main: string[];
      internal: string[];
      issues: string[];
    } = {
      main: [],
      internal: [],
      issues: []
    };
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;
      
      if (trimmedLine.toLowerCase().includes('internal changes:')) {
        // Start of internal changes section
        sections.internal.push(trimmedLine.replace('Internal Changes:', '').trim());
      } else if (trimmedLine.toLowerCase().includes('known issues:')) {
        // Start of known issues section
        sections.issues.push(trimmedLine.replace('Known Issues:', '').trim());
      } else if (sections.internal.length > 0 && !sections.issues.length) {
        // Continue adding to internal changes
        sections.internal.push(trimmedLine);
      } else if (sections.issues.length > 0) {
        // Continue adding to known issues
        sections.issues.push(trimmedLine);
      } else {
        // Main content
        sections.main.push(trimmedLine);
      }
    });
    
    return {
      main: sections.main.filter(Boolean).join('. '),
      sections: {
        internal: sections.internal.filter(Boolean),
        issues: sections.issues.filter(Boolean)
      }
    };
  };
  
  const parsedNotes = parseReleaseNotes(version.releaseNotes);

  return (
    <Card 
      bg={bgColor} 
      boxShadow="sm" 
      borderWidth="1px" 
      borderColor={borderColor}
      mb={4}
      variant="elevated"
      overflow="hidden"
    >
      <CardHeader pb={2}>
        <HStack justify="space-between" align="center">
          <HStack spacing={2}>
            <Heading size="md">Version {version.version}</Heading>
            {isLatest && (
              <Tag size="sm" colorScheme={latestTagColor}>
                Latest
              </Tag>
            )}
          </HStack>
          <Text color="gray.500" fontSize="sm">
            Released: {format(version.releaseDate, 'MMMM d, yyyy')}
          </Text>
        </HStack>
      </CardHeader>
      <Divider />
      <CardBody>
        <VStack align="stretch" spacing={4}>
          {parsedNotes.main && (
            <Box>
              <HStack mb={2} align="center">
                <InfoIcon color="blue.500" />
                <Heading size="sm">
                  Summary
                </Heading>
              </HStack>
              <Text fontSize="md" pl={6}>{parsedNotes.main}</Text>
            </Box>
          )}
          
          {parsedNotes.sections.internal.length > 0 && (
            <Box>
              <HStack mb={2} align="center">
                <CheckCircleIcon color="green.500" />
                <Heading size="sm">
                  Changes
                </Heading>
              </HStack>
              <List spacing={2} pl={6}>
                {parsedNotes.sections.internal.map((note, idx) => (
                  <ListItem key={idx} display="flex" alignItems="flex-start">
                    <ListIcon as={CheckCircleIcon} color="green.500" mt={1} />
                    <Text>{note}</Text>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          
          {parsedNotes.sections.issues.length > 0 && (
            <Box>
              <HStack mb={2} align="center">
                <WarningIcon color="orange.500" />
                <Heading size="sm">
                  Known Issues
                </Heading>
              </HStack>
              <List spacing={2} pl={6}>
                {parsedNotes.sections.issues.map((issue, idx) => (
                  <ListItem key={idx} display="flex" alignItems="flex-start">
                    <ListIcon as={WarningIcon} color="orange.500" mt={1} />
                    <Text>{issue}</Text>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

export default VersionDisplay; 