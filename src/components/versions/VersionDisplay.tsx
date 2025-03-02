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
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { VersionInfo } from '@/utils/versions';

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

  return (
    <Card 
      bg={bgColor} 
      boxShadow="sm" 
      borderWidth="1px" 
      borderColor={borderColor}
      mb={4}
    >
      <CardHeader pb={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Heading size="md">
            Version {version.version}
            {isLatest && (
              <Tag size="sm" ml={2} colorScheme={latestTagColor}>
                Latest
              </Tag>
            )}
          </Heading>
          <Text color="gray.500" fontSize="sm">
            Released: {format(version.releaseDate, 'MMMM d, yyyy')}
          </Text>
        </Box>
      </CardHeader>
      <Divider />
      <CardBody>
        <Box>
          <Heading size="sm" mb={2}>
            Release Notes
          </Heading>
          <Text fontSize="md" fontWeight="normal">
            {version.releaseNotes || 'No release notes available'}
          </Text>
        </Box>
      </CardBody>
    </Card>
  );
};

export default VersionDisplay; 