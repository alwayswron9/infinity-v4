'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

/**
 * Default page for /models/[id]
 * This simply redirects to /models/[id]/explore
 */
export default function ModelDefaultPage() {
  const router = useRouter();
  const params = useParams();
  
  // Extract model ID from URL path
  const modelId = typeof params.id === 'string' ? params.id : '';
  
  // Redirect to explore page
  useEffect(() => {
    if (modelId) {
      router.push(`/models/${modelId}/explore`);
    }
  }, [modelId, router]);
  
  // This component renders nothing as it immediately redirects
  return null;
} 
