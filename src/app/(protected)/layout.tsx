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
      <Flex minH="100vh" bg="gray.900">
        <Sidebar />
        <Box as="main" flex="1" p="6">{children}</Box>
      </Flex>
    );
  }