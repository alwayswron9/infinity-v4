import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  error: string;
  title?: string;
}

export function ErrorState({ error, title = "Error Loading Data" }: ErrorStateProps) {
  return (
    <div className="container py-8">
      <div className="p-6 bg-status-error-subtle text-status-error rounded-lg border border-status-error/20">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-6 w-6" />
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 