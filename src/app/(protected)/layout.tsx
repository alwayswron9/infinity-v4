import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Box, Flex } from '@chakra-ui/react'
import Sidebar from '@/components/navigation/sidebar'

export default async function ProtectedLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    const cookiesList = await cookies()
    const hasToken = cookiesList.has('token')

    if (!hasToken) {
      redirect('/login')
    }

    return (
      <Flex minH="100vh" bg="gray.900" overflow="hidden">
        <Sidebar />
        <Box 
          as="main" 
          flex="1" 
          p="6" 
          height="100vh" 
          overflow="auto" 
          maxW="calc(100vw - 16rem)" 
          w="100%"
          position="relative"
          css={{
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'var(--chakra-colors-gray-800)',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'var(--chakra-colors-gray-600)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: 'var(--chakra-colors-gray-500)',
            }
          }}
        >
          {children}
        </Box>
      </Flex>
    );
  }