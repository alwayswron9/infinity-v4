"use client";

import ModelDetailPage from '../page';

// This is just a wrapper component to reuse the ModelDetailPage component
export default function ExploreModelPage() {
  // Pass a key to force a fresh render of the component
  return <ModelDetailPage key="explore" />;
} 