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
    <div className="view-selector relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md border",
          "transition-colors duration-200",
          isOpen
            ? "bg-brand-primary text-white border-brand-primary"
            : "bg-surface-1 text-text-primary border-border hover:bg-surface-2",
          "focus:outline-none focus:ring-1 focus:ring-brand-primary"
        )}
      >
        <span className="truncate max-w-[150px]">{activeView?.name || 'Select View'}</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && !isLoading && (
        <div className="view-dropdown">
          <div className="p-2 border-b border-border">
            <h3 className="font-medium text-text-primary text-sm">Views</h3>
          </div>
          <div className="max-h-[300px] overflow-y-auto p-1">
            {views.map((view) => (
              <div
                key={view.id}
                className={cn(
                  "view-option",
                  view.id === activeViewId && "active-view"
                )}
              >
                <button
                  className="flex-1 text-left truncate"
                  onClick={() => {
                    onViewSelect(view.id);
                    setIsOpen(false);
                  }}
                >
                  {view.name}
                  {view.is_default && (
                    <span className="ml-2 text-xs text-text-tertiary">(Default)</span>
                  )}
                </button>
                <button
                  onClick={(e) => handleDeleteView(view.id, e)}
                  className={cn(
                    "p-1 rounded-full hover:bg-surface-3 text-text-tertiary hover:text-status-error",
                    (views.length <= 1 || (view.is_default && views.length === 1)) && "opacity-50 cursor-not-allowed"
                  )}
                  disabled={views.length <= 1 || (view.is_default && views.length === 1)}
                >
                  <Trash2 className="h-3 w-3" />
                  <span className="sr-only">Delete view</span>
                </button>
              </div>
            ))}
          </div>
          <div className="p-2 border-t border-border">
            <button
              onClick={() => {
                onCreateView();
                setIsOpen(false);
              }}
              className="flex items-center gap-1 w-full p-2 text-sm text-text-primary hover:bg-surface-2 rounded-md"
            >
              <Plus className="h-4 w-4" />
              New View
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 