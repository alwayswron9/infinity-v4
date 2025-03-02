import { extendTheme } from '@chakra-ui/react';
import { theme as baseTheme } from '@saas-ui/react';

// Extend the Saas UI theme with our custom configurations
export const theme = extendTheme(
  {
    // Set the color mode config
    config: {
      initialColorMode: 'dark',
      useSystemColorMode: false,
    },
    // Add any custom colors, fonts, etc. here
    colors: {
      brand: {
        50: '#f5f3ff',
        100: '#ede9fe',
        200: '#ddd6fe',
        300: '#c4b5fd',
        400: '#a78bfa',
        500: '#8b5cf6',
        600: '#7c3aed',
        700: '#6d28d9',
        800: '#5b21b6',
        900: '#4c1d95',
      },
    },
    fonts: {
      heading: 'Inter, sans-serif',
      body: 'Inter, sans-serif',
    },
  },
  // Base SaaS UI theme
  baseTheme
);

export default theme; 