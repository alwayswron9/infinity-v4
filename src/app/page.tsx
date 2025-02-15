'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if we have a token in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  // Show a loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse">Redirecting...</div>
    </div>
  );
}