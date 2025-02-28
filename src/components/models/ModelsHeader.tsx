import Link from 'next/link';
import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface ModelsHeaderProps {
  searchQuery: string;
  showArchived: boolean;
  onSearchChange: (query: string) => void;
  onShowArchivedChange: (show: boolean) => void;
}

export function ModelsHeader({
  searchQuery,
  showArchived,
  onSearchChange,
  onShowArchivedChange
}: ModelsHeaderProps) {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Models</h1>
        <Link href="/models/new">
          <Button variant="primary" size="default" className="h-10 px-4">
            <Plus className="h-4 w-4 mr-2" />
            Add model
          </Button>
        </Link>
      </div>

      <div className="flex flex-col space-y-5">
        <div className="search-filter-container">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="search-input w-full"
              style={{ 
                backgroundColor: 'var(--surface-0)', 
                color: 'var(--text-primary)',
                border: '1px solid var(--surface-2)',
                boxShadow: 'none'
              }}
            />
          </div>
          
          <div className="flex items-center justify-end">
            <div className="flex items-center space-x-2">
              <div className="text-sm text-text-primary font-medium">Show archived</div>
              <Switch
                id="show-archived"
                checked={showArchived}
                onCheckedChange={onShowArchivedChange}
                className="data-[state=checked]:bg-brand-primary border-surface-3"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 