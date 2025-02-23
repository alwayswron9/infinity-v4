import React from 'react';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ModelView } from '@/types/viewDefinition';

interface ViewSelectorProps {
  views: ModelView[];
  activeViewId: string | null;
  onViewSelect: (viewId: string) => void;
  onCreateView: () => void;
  onDeleteView: (viewId: string) => void;
  isLoading?: boolean;
}

export function ViewSelector({
  views,
  activeViewId,
  onViewSelect,
  onCreateView,
  onDeleteView,
  isLoading = false,
}: ViewSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  const activeView = views.find(v => v.id === activeViewId);

  // Handle click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDeleteView = async (viewId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    // Don't allow deleting the last view
    if (views.length <= 1) {
      return;
    }
    // Don't allow deleting the default view if it's the only one
    const viewToDelete = views.find(v => v.id === viewId);
    if (viewToDelete?.is_default && views.length === 1) {
      return;
    }
    try {
      await onDeleteView(viewId);
      setIsOpen(false); // Close the dropdown after successful deletion
    } catch (error) {
      console.error('Error deleting view:', error);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md border",
          "transition-colors duration-200",
          isOpen
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-surface text-text-primary border-border-primary hover:bg-surface-hover",
          "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-focus"
        )}
      >
        <span className="truncate">{activeView?.name || 'Select View'}</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && !isLoading && (
        <div className="absolute right-0 top-[calc(100%+4px)] z-50 w-[240px] rounded-md border border-border-primary bg-surface shadow-lg">
          <div className="p-2 border-b border-border-primary">
            <h3 className="font-medium text-text-primary">Views</h3>
          </div>
          <div className="max-h-[300px] overflow-y-auto p-1">
            {views.map((view) => (
              <div
                key={view.id}
                className={cn(
                  "flex items-center justify-between px-3 py-2 text-sm rounded-md",
                  "hover:bg-surface-hover",
                  "transition-colors duration-200",
                  view.id === activeViewId && "bg-surface-hover"
                )}
              >
                <button
                  className="flex-1 text-left text-text-primary"
                  onClick={() => {
                    onViewSelect(view.id);
                    setIsOpen(false);
                  }}
                >
                  {view.name}
                </button>
                {views.length > 1 && !view.is_default && (
                  <button
                    onClick={(e) => handleDeleteView(view.id, e)}
                    className="ml-2 p-1 rounded-sm hover:bg-destructive/10 text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="mt-1 border-t border-border-primary pt-1">
            <button
              onClick={() => {
                onCreateView();
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-surface-hover text-text-primary"
            >
              <Plus className="h-4 w-4" />
              <span>New View</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 