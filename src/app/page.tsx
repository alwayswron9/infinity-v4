'use client';

import { Suspense } from 'react';
import Auth from './auth';

export default function HomePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <Auth />
    </Suspense>
  );
}
