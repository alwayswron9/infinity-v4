import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
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
      <div className="min-h-screen bg-background flex">
        <Sidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    );
  }