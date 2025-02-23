import React from 'react';
import { Columns } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ViewConfig } from '@/types/viewDefinition';

interface ColumnSelectorProps {
  viewConfig: ViewConfig;
  onConfigChange?: (config: Partial<ViewConfig>) => void;
}

export function ColumnSelector({
  viewConfig,
  onConfigChange,
}: ColumnSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

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

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 text-sm rounded-md border shadow-sm",
          "hover:bg-accent hover:text-accent-foreground",
          "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500",
          isOpen && "bg-accent"
        )}
      >
        <Columns className="h-4 w-4" />
        <span>Columns</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-1 w-[200px] rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
          <div className="max-h-[300px] overflow-y-auto">
            {viewConfig.columns.map((col, index) => (
              <label
                key={col.field}
                className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
              >
                <input
                  type="checkbox"
                  checked={col.visible}
                  onChange={(e) => {
                    if (onConfigChange) {
                      const newColumns = [...viewConfig.columns];
                      newColumns[index] = {
                        ...newColumns[index],
                        visible: e.target.checked
                      };
                      onConfigChange({
                        ...viewConfig,
                        columns: newColumns
                      });
                    }
                  }}
                  className="rounded border-gray-300"
                />
                <span>{col.field}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 