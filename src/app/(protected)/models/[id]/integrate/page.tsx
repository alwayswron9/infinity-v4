'use client';

import ModelDetailPage from '../page';

// This is just a wrapper component to reuse the ModelDetailPage component
export default function IntegrateModelPage() {
  // Pass a key to force a fresh render of the component
  return <ModelDetailPage key="integrate" />;
} 