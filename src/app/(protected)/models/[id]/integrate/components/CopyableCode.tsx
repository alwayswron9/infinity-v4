import { 
  Box, 
  Code,
  useColorModeValue,
  Button,
  useClipboard,
  Text
} from '@chakra-ui/react';
import { CheckIcon, CopyIcon } from 'lucide-react';

interface CopyableCodeProps {
  content: string;
  label?: string;
  language?: string;
}

export function CopyableCode({ content, label, language = 'json' }: CopyableCodeProps) {
  const { hasCopied, onCopy } = useClipboard(content);
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box position="relative" mb={4}>
      {label && (
        <Text fontSize="sm" fontWeight="medium" mb={1} color="gray.500">
          {label}
        </Text>
      )}
      <Box
        position="relative"
        bg={bgColor}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="md"
        p={4}
        pr={12}
        overflowX="auto"
      >
        <Code
          display="block"
          whiteSpace="pre"
          overflowX="auto"
          bg="transparent"
          p={0}
          fontSize="sm"
          fontFamily="mono"
          className={language ? `language-${language}` : undefined}
        >
          {content}
        </Code>
        <Button
          position="absolute"
          top={2}
          right={2}
          size="sm"
          variant="ghost"
          onClick={onCopy}
          aria-label="Copy code"
          leftIcon={hasCopied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
        >
          {hasCopied ? 'Copied' : 'Copy'}
        </Button>
      </Box>
    </Box>
  );
} 