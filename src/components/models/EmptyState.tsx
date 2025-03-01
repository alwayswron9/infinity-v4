import Link from 'next/link';
import { Database, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="bg-highlight rounded-full p-3 mb-3">
        <Database className="h-7 w-7 text-primary" />
      </div>
      <h3 className="text-base font-medium mb-1.5 text-text-primary">No models found</h3>
      <p className="text-text-secondary mb-5 max-w-md text-sm">
        Create your first model to start organizing and managing your data
      </p>
      <Link href="/models/new">
        <Button className="gap-2 bg-primary hover:bg-primary-hover text-white py-2 px-4 rounded-md h-9">
          <Plus className="h-4 w-4" />
          Create New Model
        </Button>
      </Link>
    </div>
  );
} 