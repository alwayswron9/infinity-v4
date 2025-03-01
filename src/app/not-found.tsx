'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-text-primary p-4">
      <div className="max-w-lg w-full text-center">
        <h1 className="text-7xl font-light mb-6 text-brand-primary">404</h1>
        
        <h2 className="text-2xl font-medium mb-4">This page could not be found</h2>
        
        <p className="text-text-secondary mb-8">
          The page you're looking for doesn't exist or has been moved to another location.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/"
            className="btn-base bg-brand-primary/70 hover:bg-brand-primary px-6 py-2 text-sm text-text-primary transition-colors duration-200"
          >
            Return Home
          </Link>
          
          <Link 
            href="/auth?mode=login"
            className="btn-base bg-surface-2 hover:bg-surface-3 px-6 py-2 text-sm text-text-primary transition-colors duration-200"
          >
            Sign In
          </Link>
        </div>
        
        <div className="mt-12 text-xs text-text-tertiary">
          <p>Need help? <a href="mailto:support@infinity-platform.com" className="text-brand-primary/70 hover:text-brand-primary">Contact Support</a></p>
        </div>
      </div>
    </div>
  );
}
