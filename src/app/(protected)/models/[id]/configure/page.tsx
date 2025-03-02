'use client';

import { useEffect } from 'react';
import ModelDetailPage from '../page';

// This is just a wrapper component to reuse the ModelDetailPage component
export default function ConfigureModelPage() {
  // Pass a key to force a fresh render of the component
  return <ModelDetailPage key="configure" />;
} 