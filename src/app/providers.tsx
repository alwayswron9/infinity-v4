'use client';

import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { SaasProvider } from '@saas-ui/react';
import { Toaster } from 'sonner';
import { theme } from '@/lib/theme';
import { useEffect, useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  // Add client-side rendering guard to prevent hydration mismatch
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme} resetCSS={true}>
        <SaasProvider theme={theme}>
          {/* Render children only after component has mounted on client */}
          {mounted ? children : <div style={{ visibility: 'hidden' }}>{children}</div>}
          <Toaster 
            position="bottom-right"
            duration={1000}
            richColors
            closeButton
            toastOptions={{
              duration: 1000,
              style: {
                background: 'var(--chakra-colors-gray-800)',
                color: 'var(--chakra-colors-white)',
                border: '1px solid var(--chakra-colors-gray-700)',
              },
              className: 'font-medium',
            }}
          />
        </SaasProvider>
      </ChakraProvider>
    </>
  );
} 