import React from 'react';
import { Columns } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ViewConfig } from '@/types/viewDefinition';

// Helper to check if a field is a system field
const isSystemField = (field: string) => field.startsWith('_');

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

  // Group columns into system and regular fields
  const { systemFields, regularFields } = React.useMemo(() => {
    return viewConfig.columns.reduce<{
      systemFields: typeof viewConfig.columns;
      regularFields: typeof viewConfig.columns;
    }>(
      (acc, column) => {
        if (isSystemField(column.field)) {
          acc.systemFields.push(column);
        } else {
          acc.regularFields.push(column);
        }
        return acc;
      },
      { systemFields: [], regularFields: [] }
    );
  }, [viewConfig.columns]);

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

  const handleColumnToggle = (index: number, checked: boolean) => {
    if (onConfigChange) {
      const newColumns = [...viewConfig.columns];
      newColumns[index] = {
        ...newColumns[index],
        visible: checked
      };
      onConfigChange({
        ...viewConfig,
        columns: newColumns
      });
    }
  };

  const renderColumnGroup = (columns: typeof viewConfig.columns, title: string) => (
    <div className="py-2 first:pt-0 last:pb-0">
      <div className="px-3 py-1.5 text-xs font-medium text-text-secondary/70">
        {title}
      </div>
      <div className="space-y-1">
        {columns.map((col) => {
          const index = viewConfig.columns.findIndex(c => c.field === col.field);
          return (
            <label
              key={col.field}
              className={cn(
                "flex items-center gap-3 px-3 py-1.5",
                "text-sm rounded-sm cursor-pointer",
                "hover:bg-surface-hover/50",
                "transition-colors duration-150"
              )}
            >
              <input
                type="checkbox"
                checked={col.visible}
                onChange={(e) => handleColumnToggle(index, e.target.checked)}
                className={cn(
                  "h-4 w-4 rounded",
                  "border-border-primary",
                  "text-primary focus:ring-1 focus:ring-offset-0 focus:ring-primary",
                  "transition-colors duration-150"
                )}
              />
              <span className="truncate text-text-primary">
                {isSystemField(col.field) ? col.field.slice(1) : col.field}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5",
          "text-sm font-medium rounded-md border",
          "transition-colors duration-150",
          isOpen
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-surface text-text-primary border-border-primary hover:bg-surface-hover/50",
          "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary"
        )}
      >
        <Columns className="h-4 w-4" />
        <span>Columns</span>
      </button>

      {isOpen && (
        <div 
          className={cn(
            "absolute left-0 top-[calc(100%+4px)] z-50 w-[240px]",
            "rounded-md border border-border-primary",
            "bg-surface shadow-lg",
            "flex flex-col max-h-[min(420px,calc(100vh-200px))]"
          )}
        >
          <div className="p-2 border-b border-border-primary flex-shrink-0">
            <h3 className="font-medium text-text-primary text-sm">Toggle Columns</h3>
          </div>
          <div className="overflow-y-auto flex-1 p-2 divide-y divide-border-primary/30">
            {renderColumnGroup(regularFields, 'Model Fields')}
            {systemFields.length > 0 && renderColumnGroup(systemFields, 'System Fields')}
          </div>
        </div>
      )}
    </div>
  );
} 