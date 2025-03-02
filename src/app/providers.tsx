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
    // Important: To prevent flickering, we don't want to render until after hydration
    setMounted(true);
    
    // Ensure the chakra-ui-dark class is added to body consistently
    // This matches what the server rendering expects
    if (!document.body.classList.contains('chakra-ui-dark')) {
      document.body.classList.add('chakra-ui-dark');
    }
  }, []);

  // This approach ensures SSR works properly with Chakra UI
  // By rendering an exact HTML structure match during SSR and first render
  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme} resetCSS={true}>
        <SaasProvider theme={theme}>
          {mounted ? (
            <>
              {children}
              <Toaster 
                position="bottom-right"
                duration={4000}
                richColors
                closeButton
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'var(--chakra-colors-gray-800)',
                    color: 'var(--chakra-colors-white)',
                    border: '1px solid var(--chakra-colors-gray-700)',
                  },
                  className: 'font-medium',
                }}
              />
            </>
          ) : (
            // This div matches the structure but remains invisible until client hydration
            <div style={{ visibility: 'hidden' }}>{children}</div>
          )}
        </SaasProvider>
      </ChakraProvider>
    </>
  );
} 