'use client';

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
        50: '#E6FFFA',
        100: '#B2F5EA',
        200: '#81E6D9',
        300: '#4FD1C5',
        400: '#38B2AC',
        500: '#319795',
        600: '#2C7A7B',
        700: '#285E61',
        800: '#234E52',
        900: '#1D4044',
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