'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Container, 
  Stack, 
  Heading, 
  Text, 
  Flex, 
  Button,
  Card,
  Icon,
  SimpleGrid,
  Link as ChakraLink,
  Divider,
  List,
  ListItem,
  Tab,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Spinner,
  HStack,
  IconButton,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Center,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Code,
  useColorModeValue
} from '@chakra-ui/react';
import Link from 'next/link';
import { 
  FileText, 
  BookOpen, 
  Code as CodeIcon,
  Database,
  Workflow,
  Search,
  Users,
  ChevronRight,
  ExternalLink,
  ArrowLeft,
  Home,
  Image as ImageIcon
} from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

// Sample doc card component
const DocCard = ({ title, description, icon, docId, onClick }: { 
  title: string; 
  description: string; 
  icon: any; 
  docId: string;
  onClick: (id: string) => void; 
}) => (
  <Card
    onClick={() => onClick(docId)}
    bg="gray.800"
    borderWidth="1px"
    borderColor="gray.700"
    borderRadius="md"
    p={5}
    transition="all 0.2s"
    _hover={{ 
      transform: 'translateY(-2px)', 
      borderColor: 'brand.500',
      shadow: 'md',
      cursor: 'pointer'
    }}
    h="full"
  >
    <Flex direction="column" gap={3}>
      <Flex 
        bg="brand.900" 
        color="brand.400" 
        boxSize={10} 
        borderRadius="md" 
        alignItems="center" 
        justifyContent="center"
      >
        <Icon as={icon} boxSize={5} />
      </Flex>
      <Heading as="h3" size="md" fontWeight="semibold" color="white">
        {title}
      </Heading>
      <Text color="gray.400">{description}</Text>
    </Flex>
  </Card>
);

// Work in Progress banner component for reuse
const WorkInProgressBanner = () => (
  <Alert 
    status="warning" 
    variant="solid" 
    bg="yellow.700" 
    color="white" 
    borderRadius="md" 
    mb={6}
  >
    <AlertIcon color="yellow.200" />
    <Box>
      <AlertTitle fontWeight="bold">Documentation in Progress</AlertTitle>
      <AlertDescription>
        The Infinity documentation is currently being developed and refined. Some sections may be incomplete or subject to change.
      </AlertDescription>
    </Box>
  </Alert>
);

// Image placeholder component for missing images
const ImagePlaceholder = ({ alt }: { alt: string }) => (
  <Flex 
    my={4}
    direction="column" 
    justify="center" 
    align="center" 
    bg="gray.800" 
    border="2px dashed" 
    borderColor="gray.600" 
    borderRadius="md" 
    p={4}
    h="120px"
    maxW="100%"
  >
    <Icon as={ImageIcon} boxSize={8} color="gray.500" mb={2} />
    <Text color="gray.500" fontSize="sm" textAlign="center">
      {alt || "Image placeholder"}
    </Text>
  </Flex>
);

// Enhanced markdown-to-JSX renderer for documentation
const MarkdownRenderer = ({ content }: { content: string }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [processedContent, setProcessedContent] = useState('');
  
  useEffect(() => {
    if (!content) return;
    
    // Process the markdown with enhanced rendering
    const processed = processMarkdown(content);
    setProcessedContent(processed);
    
    // After the content is rendered, enhance tables and code blocks
    setTimeout(() => {
      if (contentRef.current) {
        enhanceCodeBlocks(contentRef.current);
        enhanceTables(contentRef.current);
      }
    }, 100);
  }, [content]);
  
  // Process markdown with better formatting
  const processMarkdown = (markdown: string) => {
    // First pass to gather headings and avoid duplicates
    const headings = new Set<string>();
    
    // Enhanced markdown processing
    return markdown
      // Fix line breaks
      .replace(/\r\n/g, '\n')
      
      // Headers with IDs for linking
      .replace(/^# (.*$)/gim, (match, title) => {
        if (headings.has(title.trim())) {
          return ''; // Skip duplicate heading
        }
        const id = title.toLowerCase().replace(/[^\w]+/g, '-');
        headings.add(title.trim());
        return `<h1 id="${id}">${title}</h1>`;
      })
      .replace(/^## (.*$)/gim, (match, title) => {
        const id = title.toLowerCase().replace(/[^\w]+/g, '-');
        return `<h2 id="${id}">${title}</h2>`;
      })
      .replace(/^### (.*$)/gim, (match, title) => {
        const id = title.toLowerCase().replace(/[^\w]+/g, '-');
        return `<h3 id="${id}">${title}</h3>`;
      })
      .replace(/^#### (.*$)/gim, (match, title) => {
        const id = title.toLowerCase().replace(/[^\w]+/g, '-');
        return `<h4 id="${id}">${title}</h4>`;
      })
      
      // Links with better handling
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, (match, text, url) => {
        const isExternal = url.startsWith('http') || url.startsWith('mailto:');
        const attrs = isExternal ? 
          `href="${url}" target="_blank" rel="noopener noreferrer" class="external-link"` : 
          `href="${url}" class="internal-link"`;
        return `<a ${attrs}>${text}</a>`;
      })
      
      // Enhanced formatting
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      
      // Improved list handling
      .replace(/^\s*- (.*$)/gim, '<li>$1</li>')
      .replace(/(<li>.*<\/li>\n?)+/gim, '<ul>$&</ul>')
      
      // Better numbered list handling
      .replace(/^\s*(\d+)\. (.*$)/gim, '<li value="$1">$2</li>')
      .replace(/(<li value=.*<\/li>\n?)+/gim, '<ol>$&</ol>')
      
      // Tables with enhanced structure
      .replace(/^\|(.*)\|$/gim, (match, content) => {
        const cells = content.split('|').map((cell: string) => cell.trim());
        return `<tr>${cells.map((cell: string) => `<td>${cell}</td>`).join('')}</tr>`;
      })
      .replace(/^(\|[-:]+[-| :]*\|)$/gim, (match, content) => {
        const headerRow = match.replace(/\|/g, '').trim();
        return `<thead><tr>${headerRow.split('|').map(() => '<th></th>').join('')}</tr></thead>`;
      })
      .replace(/(<tr>.*<\/tr>\n?)+/gim, '<table class="md-table">$&</table>')
      
      // Code blocks with language detection
      .replace(/```(\w*)\n([\s\S]*?)```/gim, (match, lang, code) => {
        return `<pre class="code-block${lang ? ' language-' + lang : ''}"><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
      })
      
      // Inline code
      .replace(/`([^`]*)`/gim, '<code class="inline-code">$1</code>')
      
      // Blockquotes with better styling
      .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
      
      // Images with placeholders
      .replace(/!\[(.*?)\]\((.*?)\)/gim, (match, alt, src) => {
        if (!src || src.includes('placeholder') || src.includes('to-be-added')) {
          return `<div class="image-placeholder" data-alt="${alt || 'Image'}"></div>`;
        }
        return `<img src="${src}" alt="${alt}" class="md-image" />`;
      })
      
      // Horizontal rules
      .replace(/^---$/gim, '<hr class="md-hr" />')
      
      // Ensure paragraphs are properly wrapped
      .replace(/^(?!<h\d|<ul|<ol|<li|<blockquote|<pre|<hr|<table)(.+)$/gim, '<p>$1</p>')
      .replace(/\n\n/g, '</p><p>');
  };
  
  // Post-processing for code blocks
  const enhanceCodeBlocks = (container: HTMLElement) => {
    // Find all code blocks
    const codeBlocks = container.querySelectorAll('pre.code-block');
    codeBlocks.forEach(block => {
      // Add copy button
      const copyButton = document.createElement('button');
      copyButton.className = 'code-copy-btn';
      copyButton.textContent = 'Copy';
      copyButton.onclick = () => {
        const code = block.querySelector('code')?.textContent || '';
        navigator.clipboard.writeText(code).then(() => {
          copyButton.textContent = 'Copied!';
          setTimeout(() => {
            copyButton.textContent = 'Copy';
          }, 2000);
        });
      };
      
      // Create wrapper for the code block with header
      const wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper';
      
      // Get language if specified
      const language = Array.from(block.classList)
        .find(cls => cls.startsWith('language-'))
        ?.replace('language-', '') || '';
      
      // Create header with language badge
      const header = document.createElement('div');
      header.className = 'code-block-header';
      
      if (language) {
        const langBadge = document.createElement('span');
        langBadge.className = 'code-lang-badge';
        langBadge.textContent = language;
        header.appendChild(langBadge);
      }
      
      header.appendChild(copyButton);
      
      // Structure the enhanced code block
      block.parentNode?.insertBefore(wrapper, block);
      wrapper.appendChild(header);
      wrapper.appendChild(block);
      
      // Apply line numbers
      const code = block.querySelector('code');
      if (code) {
        const lines = code.innerHTML.split('\n');
        if (lines.length > 1) {
          code.innerHTML = lines
            .map((line, i) => `<span class="code-line">${line}</span>`)
            .join('\n');
        }
      }
    });
  };
  
  // Post-processing for tables
  const enhanceTables = (container: HTMLElement) => {
    const tables = container.querySelectorAll('table.md-table');
    tables.forEach(table => {
      // Create Chakra Table components structure
      const newTable = document.createElement('table');
      newTable.className = 'chakra-table enhanced-table';
      
      // Check if table has thead
      let thead = table.querySelector('thead');
      if (!thead) {
        // Use the first row as header if no explicit header
        const firstRow = table.querySelector('tr');
        if (firstRow) {
          thead = document.createElement('thead');
          const headerRow = document.createElement('tr');
          
          // Convert first row cells to th
          const cells = firstRow.querySelectorAll('td');
          cells.forEach(cell => {
            const th = document.createElement('th');
            th.innerHTML = cell.innerHTML;
            th.className = 'chakra-table__th';
            headerRow.appendChild(th);
          });
          
          thead.appendChild(headerRow);
          newTable.appendChild(thead);
          
          // Remove the first row as we converted it to header
          firstRow.parentNode?.removeChild(firstRow);
        }
      } else {
        // Use existing thead but enhance it
        const headerRow = thead.querySelector('tr');
        if (headerRow) {
          const ths = headerRow.querySelectorAll('th');
          ths.forEach(th => {
            th.className = 'chakra-table__th';
          });
        }
        newTable.appendChild(thead);
      }
      
      // Create tbody with remaining rows
      const tbody = document.createElement('tbody');
      tbody.className = 'chakra-table__tbody';
      
      const rows = table.querySelectorAll('tr');
      rows.forEach(row => {
        const newRow = document.createElement('tr');
        newRow.className = 'chakra-table__tr';
        
        const cells = row.querySelectorAll('td');
        cells.forEach(cell => {
          const td = document.createElement('td');
          td.innerHTML = cell.innerHTML;
          td.className = 'chakra-table__td';
          newRow.appendChild(td);
        });
        
        tbody.appendChild(newRow);
      });
      
      newTable.appendChild(tbody);
      
      // Replace original table with enhanced version
      table.parentNode?.replaceChild(newTable, table);
    });
  };
  
  return (
    <Box className="markdown-content">
      <style jsx global>{`
        /* Enhanced markdown styling */
        .markdown-content h1, .markdown-content h2, .markdown-content h3, 
        .markdown-content h4, .markdown-content h5, .markdown-content h6 {
          scroll-margin-top: 80px;
          position: relative;
        }
        
        .markdown-content h2::before, .markdown-content h3::before {
          content: "";
          display: block;
          height: 1px;
          margin-bottom: 1rem;
          background: rgba(255, 255, 255, 0.1);
        }
        
        /* Link styling */
        .markdown-content a.internal-link {
          color: #63b3ed;
          text-decoration: none;
          border-bottom: 1px dotted #63b3ed;
          transition: all 0.2s;
        }
        
        .markdown-content a.external-link {
          color: #68D391;
          text-decoration: none;
          border-bottom: 1px dotted #68D391;
          transition: all 0.2s;
        }
        
        .markdown-content a.internal-link:hover, 
        .markdown-content a.external-link:hover {
          opacity: 0.8;
        }
        
        .markdown-content a.external-link::after {
          content: "↗";
          font-size: 0.8em;
          margin-left: 2px;
          display: inline-block;
          vertical-align: top;
        }
        
        /* Code block styling */
        .code-block-wrapper {
          margin: 1.5rem 0;
          border-radius: 0.375rem;
          overflow: hidden;
          background: #1A202C;
          border: 1px solid #2D3748;
        }
        
        .code-block-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 1rem;
          background: #2D3748;
          border-bottom: 1px solid #4A5568;
        }
        
        .code-lang-badge {
          font-family: monospace;
          font-size: 0.8rem;
          color: #E2E8F0;
          padding: 0.15rem 0.5rem;
          background: #4A5568;
          border-radius: 0.25rem;
          text-transform: uppercase;
        }
        
        .code-copy-btn {
          background: #2D3748;
          color: #A0AEC0;
          border: 1px solid #4A5568;
          border-radius: 0.25rem;
          padding: 0.25rem 0.5rem;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .code-copy-btn:hover {
          background: #4A5568;
          color: #E2E8F0;
        }
        
        .code-block {
          margin: 0 !important;
          padding: 1rem !important;
          background: #1A202C !important;
          overflow-x: auto;
          font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
          font-size: 0.9rem;
          line-height: 1.5;
        }
        
        .code-line {
          display: block;
          position: relative;
          padding-left: 1.5rem;
        }
        
        .code-line:before {
          content: attr(data-line-number);
          position: absolute;
          left: 0;
          color: #4A5568;
          text-align: right;
          width: 1.5rem;
        }
        
        /* Inline code styling */
        .inline-code {
          font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
          background: #2D3748;
          color: #FC8181;
          padding: 0.1rem 0.3rem;
          border-radius: 0.25rem;
          font-size: 0.9em;
          white-space: nowrap;
        }
        
        /* Table styling */
        .enhanced-table {
          width: 100%;
          margin: 1.5rem 0;
          border-collapse: separate;
          border-spacing: 0;
          border-radius: 0.375rem;
          overflow: hidden;
          border: 1px solid #2D3748;
        }
        
        .enhanced-table th {
          background: #2D3748 !important;
          color: #E2E8F0 !important;
          font-weight: 600;
          text-align: left;
          padding: 0.75rem 1rem !important;
          border-bottom: 2px solid #4A5568 !important;
        }
        
        .enhanced-table td {
          padding: 0.75rem 1rem !important;
          border-bottom: 1px solid #2D3748 !important;
          color: #CBD5E0 !important;
        }
        
        .enhanced-table tr:last-child td {
          border-bottom: none !important;
        }
        
        .enhanced-table tr:nth-of-type(even) {
          background: rgba(45, 55, 72, 0.3);
        }
        
        /* Blockquote styling */
        .markdown-content blockquote {
          border-left: 4px solid #4299E1;
          background: rgba(66, 153, 225, 0.1);
          padding: 1rem;
          margin: 1.5rem 0;
          border-radius: 0 0.375rem 0.375rem 0;
          font-style: italic;
        }
        
        /* List styling */
        .markdown-content ul, .markdown-content ol {
          padding-left: 1.5rem;
          margin: 1rem 0;
        }
        
        .markdown-content li {
          margin-bottom: 0.5rem;
          position: relative;
        }
        
        .markdown-content ol {
          counter-reset: item;
        }
        
        .markdown-content ol > li {
          counter-increment: item;
          padding-left: 0.5rem;
        }
        
        /* Image styling */
        .md-image {
          max-width: 100%;
          height: auto;
          border-radius: 0.375rem;
          margin: 1.5rem 0;
          border: 1px solid #2D3748;
        }
      `}</style>
      
      <Box 
        ref={contentRef}
        className="markdown-renderer"
        sx={{
          color: 'gray.300',
          lineHeight: 1.7,
          fontSize: 'md',
          
          '& > *:first-of-type': {
            marginTop: 0
          }
        }}
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
    </Box>
  );
};

// Document content component
const DocumentContent = ({ docId, onBack }: { docId: string; onBack: () => void }) => {
  const [content, setContent] = useState<string>('');
  const [frontmatter, setFrontmatter] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDoc() {
      setLoading(true);
      try {
        const response = await fetch(`/docs/${docId}.md`);
        if (!response.ok) {
          throw new Error('Document not found');
        }
        
        const text = await response.text();
        
        // Simple frontmatter parsing
        const frontmatterMatch = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
        
        if (frontmatterMatch) {
          const frontmatterText = frontmatterMatch[1];
          const contentText = frontmatterMatch[2];
          
          // Parse frontmatter
          const frontmatterData: any = {};
          frontmatterText.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split(':');
            if (key && valueParts.length) {
              const value = valueParts.join(':').trim();
              frontmatterData[key.trim()] = value.replace(/^"(.*)"$/, '$1');
            }
          });
          
          setFrontmatter(frontmatterData);
          setContent(contentText);
        } else {
          setContent(text);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load document');
      } finally {
        setLoading(false);
      }
    }
    
    fetchDoc();
  }, [docId]);
  
  if (loading) {
    return (
      <Flex justify="center" align="center" h="50vh" direction="column" gap={6}>
        <WorkInProgressBanner />
        <Spinner size="xl" color="brand.500" />
      </Flex>
    );
  }
  
  if (error) {
    return (
      <Box p={8} textAlign="center">
        <WorkInProgressBanner />
        <Heading size="lg" mb={4} color="red.500">Error Loading Document</Heading>
        <Text>{error}</Text>
        <Button mt={4} leftIcon={<Icon as={ArrowLeft} />} onClick={onBack}>
          Back to Documentation
        </Button>
      </Box>
    );
  }

  return (
    <>
      <WorkInProgressBanner />
      <Card bg="gray.800" borderColor="gray.700" variant="outline" shadow="sm" borderRadius="lg" p={6}>
        <Box mb={4}>
          <HStack mb={6} spacing={4}>
            <IconButton
              aria-label="Back to documentation"
              icon={<Icon as={ArrowLeft} />}
              variant="ghost"
              color="gray.400"
              _hover={{ color: "white", bg: "gray.700" }}
              onClick={onBack}
            />
            <Breadcrumb separator={<Icon as={ChevronRight} color="gray.500" boxSize={4} />}>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={onBack} color="brand.400">Documentation</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink color="gray.400">
                  {frontmatter.title || docId}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>
          </HStack>

          {frontmatter.title && (
            <Box mb={8}>
              <Heading as="h1" size="xl" mb={2}>{frontmatter.title}</Heading>
              {frontmatter.description && (
                <Text fontSize="lg" color="gray.500">{frontmatter.description}</Text>
              )}
              {frontmatter.lastUpdated && (
                <Text fontSize="sm" color="gray.400" mt={2}>
                  Last updated: {frontmatter.lastUpdated}
                </Text>
              )}
            </Box>
          )}
          
          <MarkdownRenderer content={content} />
        </Box>
      </Card>
    </>
  );
};

// Documentation home component
const DocumentationHome = ({ onSelectDoc }: { onSelectDoc: (id: string) => void }) => {
  return (
    <>
      <WorkInProgressBanner />
      {/* Introduction Card */}
      <Card bg="gray.800" borderColor="gray.700" variant="outline" shadow="sm" borderRadius="lg" mb={6} p={6}>
        <Stack spacing={4}>
          <Heading as="h2" size="md" fontWeight="semibold" color="white">
            Welcome to Infinity Documentation
          </Heading>
          <Text color="gray.300">
            Infinity is your centralized data management system that allows you to create custom data models,
            interact with your data through an intuitive UI, and connect with workflow automation tools.
            This documentation will help you get the most out of Infinity.
          </Text>
          <Divider borderColor="gray.700" />
          <Text color="gray.400" fontSize="sm">
            The documentation is organized by topic. Start with the Getting Started guide if you're new to Infinity.
          </Text>
        </Stack>
      </Card>

      {/* Documentation Categories */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <DocCard
          title="Getting Started"
          description="Learn the basics of Infinity and set up your first data model"
          icon={BookOpen}
          docId="1-introduction"
          onClick={onSelectDoc}
        />
        <DocCard
          title="Data Modeling"
          description="Create and manage custom data models with fields and relations"
          icon={Database}
          docId="3-data-modeling"
          onClick={onSelectDoc}
        />
        <DocCard
          title="API Reference"
          description="Comprehensive API documentation for integrating with Infinity"
          icon={CodeIcon}
          docId="5-api-reference"
          onClick={onSelectDoc}
        />
        <DocCard
          title="Workflow Automation"
          description="Connect Infinity with n8n for powerful workflow automation"
          icon={Workflow}
          docId="6-workflow-automation"
          onClick={onSelectDoc}
        />
        <DocCard
          title="Vector Search"
          description="Implement AI-powered semantic search across your data"
          icon={Search}
          docId="7-vector-search"
          onClick={onSelectDoc}
        />
        <DocCard
          title="Use Cases"
          description="Explore real-world examples and applications of Infinity"
          icon={Users}
          docId="8-use-cases"
          onClick={onSelectDoc}
        />
      </SimpleGrid>

      {/* Documentation Resources */}
      <Card bg="gray.800" borderColor="gray.700" variant="outline" shadow="sm" borderRadius="lg" mb={6} p={6}>
        <Stack spacing={6}>
          <Heading as="h2" size="md" fontWeight="semibold" color="white">
            Popular Resources
          </Heading>
          
          <Tabs variant="enclosed" colorScheme="brand">
            <TabList borderBottomColor="gray.700">
              <Tab 
                _selected={{ color: 'white', bg: 'gray.800', borderColor: 'gray.700', borderBottomColor: 'gray.800' }}
                color="gray.400"
                borderColor="transparent"
                borderTopRadius="md"
              >
                Getting Started
              </Tab>
              <Tab 
                _selected={{ color: 'white', bg: 'gray.800', borderColor: 'gray.700', borderBottomColor: 'gray.800' }}
                color="gray.400" 
                borderColor="transparent"
                borderTopRadius="md"
              >
                API Integration
              </Tab>
              <Tab 
                _selected={{ color: 'white', bg: 'gray.800', borderColor: 'gray.700', borderBottomColor: 'gray.800' }}
                color="gray.400" 
                borderColor="transparent"
                borderTopRadius="md"
              >
                Use Cases
              </Tab>
            </TabList>
            
            <TabPanels>
              <TabPanel p={4}>
                <List spacing={3}>
                  <ListItem>
                    <Flex justify="space-between" align="center">
                      <ChakraLink color="brand.400" onClick={() => onSelectDoc('1-introduction')}>
                        Introduction to Infinity
                      </ChakraLink>
                      <Icon as={ChevronRight} color="gray.500" />
                    </Flex>
                  </ListItem>
                  <ListItem>
                    <Flex justify="space-between" align="center">
                      <ChakraLink color="brand.400" onClick={() => onSelectDoc('2-getting-started')}>
                        Setting Up Your First Model
                      </ChakraLink>
                      <Icon as={ChevronRight} color="gray.500" />
                    </Flex>
                  </ListItem>
                  <ListItem>
                    <Flex justify="space-between" align="center">
                      <ChakraLink color="brand.400" onClick={() => onSelectDoc('3-data-modeling')}>
                        Understanding Data Models
                      </ChakraLink>
                      <Icon as={ChevronRight} color="gray.500" />
                    </Flex>
                  </ListItem>
                </List>
              </TabPanel>
              
              <TabPanel p={4}>
                <List spacing={3}>
                  <ListItem>
                    <Flex justify="space-between" align="center">
                      <ChakraLink color="brand.400" onClick={() => onSelectDoc('5-api-reference')}>
                        API Authentication
                      </ChakraLink>
                      <Icon as={ChevronRight} color="gray.500" />
                    </Flex>
                  </ListItem>
                  <ListItem>
                    <Flex justify="space-between" align="center">
                      <ChakraLink color="brand.400" onClick={() => onSelectDoc('5-api-reference')}>
                        Endpoint Reference
                      </ChakraLink>
                      <Icon as={ChevronRight} color="gray.500" />
                    </Flex>
                  </ListItem>
                  <ListItem>
                    <Flex justify="space-between" align="center">
                      <ChakraLink color="brand.400" onClick={() => onSelectDoc('5-api-reference')}>
                        Filtering & Sorting
                      </ChakraLink>
                      <Icon as={ChevronRight} color="gray.500" />
                    </Flex>
                  </ListItem>
                </List>
              </TabPanel>
              
              <TabPanel p={4}>
                <List spacing={3}>
                  <ListItem>
                    <Flex justify="space-between" align="center">
                      <ChakraLink color="brand.400" onClick={() => onSelectDoc('8-use-cases')}>
                        Customer Management
                      </ChakraLink>
                      <Icon as={ChevronRight} color="gray.500" />
                    </Flex>
                  </ListItem>
                  <ListItem>
                    <Flex justify="space-between" align="center">
                      <ChakraLink color="brand.400" onClick={() => onSelectDoc('8-use-cases')}>
                        Inventory Tracking
                      </ChakraLink>
                      <Icon as={ChevronRight} color="gray.500" />
                    </Flex>
                  </ListItem>
                  <ListItem>
                    <Flex justify="space-between" align="center">
                      <ChakraLink color="brand.400" onClick={() => onSelectDoc('8-use-cases')}>
                        Project Management
                      </ChakraLink>
                      <Icon as={ChevronRight} color="gray.500" />
                    </Flex>
                  </ListItem>
                </List>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Stack>
      </Card>

      {/* Help & Support */}
      <Card bg="gray.800" borderColor="gray.700" variant="outline" shadow="sm" borderRadius="lg" p={6}>
        <Stack spacing={4}>
          <Heading as="h2" size="md" fontWeight="semibold" color="white">
            Need Help?
          </Heading>
          <Text color="gray.300">
            If you can't find what you're looking for in the documentation, our support team is here to help.
          </Text>
          <Flex mt={2} gap={4} flexWrap="wrap">
            <Button
              as={ChakraLink}
              href="mailto:aiwahlabs@gmail.com"
              colorScheme="brand"
              size="md"
              rightIcon={<Icon as={ExternalLink} boxSize={4} />}
            >
              Contact Support
            </Button>
            <Button
              variant="outline"
              borderColor="gray.600"
              color="gray.300"
              _hover={{ bg: "gray.700" }}
              size="md"
              onClick={() => onSelectDoc('index')}
            >
              View All Documentation
            </Button>
          </Flex>
        </Stack>
      </Card>
    </>
  );
};

export default function Documentation() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  
  // Read from query parameters on initial load
  useEffect(() => {
    const doc = searchParams.get('doc');
    if (doc) {
      setSelectedDoc(doc);
    }
  }, [searchParams]);

  // Handle document selection
  const handleSelectDoc = (docId: string) => {
    setSelectedDoc(docId);
    // Update URL for bookmarking/sharing
    router.push(`/documentation?doc=${docId}`);
  };

  // Handle back to docs home
  const handleBackToDocs = () => {
    setSelectedDoc(null);
    router.push('/documentation');
  };

  return (
    <Box minH="calc(100vh - 64px)" bg="gray.900" py={6} px={{ base: 4, md: 6 }}>
      <Container maxW="container.xl" px={0}>
        {/* Page Header */}
        <Stack spacing={4} mb={6}>
          <Flex justifyContent="space-between" alignItems="center">
            <Box>
              <Heading size="lg" fontWeight="semibold" color="white" letterSpacing="-0.02em">
                Documentation
              </Heading>
              <Text mt={1} color="gray.400" fontSize="sm">
                Learn how to use Infinity effectively for your data management needs
              </Text>
            </Box>
          </Flex>
        </Stack>

        {/* Conditional rendering based on selected document */}
        {selectedDoc ? (
          <DocumentContent docId={selectedDoc} onBack={handleBackToDocs} />
        ) : (
          <DocumentationHome onSelectDoc={handleSelectDoc} />
        )}
      </Container>
    </Box>
  );
} 