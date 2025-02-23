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
    onDeleteView(viewId);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={cn(
          "flex items-center gap-2 px-3 py-2 text-sm rounded-md border shadow-sm",
          "hover:bg-accent hover:text-accent-foreground",
          "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500",
          isOpen && "bg-accent"
        )}
      >
        <span className="truncate">{activeView?.name || 'Select View'}</span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>

      {isOpen && !isLoading && (
        <div className="absolute left-0 top-full z-50 mt-1 w-[200px] rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
          <div className="max-h-[300px] overflow-y-auto">
            {views.map((view) => (
              <div
                key={view.id}
                className={cn(
                  "flex items-center justify-between px-2 py-1.5 text-sm rounded-sm",
                  "hover:bg-accent hover:text-accent-foreground",
                  view.id === activeViewId && "bg-accent text-accent-foreground"
                )}
              >
                <button
                  className="flex-1 text-left"
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
                    className="ml-2 p-1 rounded-sm hover:bg-red-100 text-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="mt-1 border-t pt-1">
            <button
              onClick={() => {
                onCreateView();
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
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