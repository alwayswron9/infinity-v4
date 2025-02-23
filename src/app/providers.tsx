'use client';

import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster 
        position="bottom-right"
        duration={1000}
        richColors
        closeButton
        toastOptions={{
          duration: 1000,
          style: {
            background: 'var(--surface)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-primary)',
          },
          className: 'font-medium',
        }}
      />
    </>
  );
} 