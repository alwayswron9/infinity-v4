'use client';

import { Suspense } from 'react';
import AuthPage from './auth/page';

export default function HomePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <AuthPage />
    </Suspense>
  );
}
