"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Plus, ChevronDown, Pencil, Trash2, Star } from 'lucide-react';
import type { ModelView } from '@/types/viewDefinition';
import { cn } from '@/lib/utils';

interface ViewSelectorProps {
  views: ModelView[];
  activeViewId: string | null;
  onViewSelect: (viewId: string) => void;
  onCreateView: () => void;
  onEditView: (viewId: string) => void;
  onDeleteView: (viewId: string) => void;
  isLoading?: boolean;
}

export function ViewSelector({
  views,
  activeViewId,
  onViewSelect,
  onCreateView,
  onEditView,
  onDeleteView,
  isLoading = false,
}: ViewSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get the active view
  const activeView = views.find(view => view.id === activeViewId);

  // Create a safe subset of views for rendering
  const safeViews = views.map(view => ({
    id: view.id,
    name: view.name,
    is_default: view.is_default
  }));

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={cn(
          "inline-flex items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          isOpen && "bg-accent"
        )}
      >
        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Loading views...</span>
            </div>
          ) : (
            <>
              <span>{activeView?.name || "Select a view"}</span>
              {activeView?.is_default && <Star className="h-4 w-4 text-yellow-500" />}
            </>
          )}
        </div>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>

      {isOpen && !isLoading && (
        <div className="absolute left-0 top-full z-50 mt-1 w-[240px] rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
          <div className="max-h-[300px] overflow-y-auto">
            {views.map((view) => (
              <div
                key={view.id}
                className="flex items-center justify-between rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
              >
                <button
                  className="flex items-center gap-2 flex-1 text-left"
                  onClick={() => {
                    onViewSelect(view.id);
                    setIsOpen(false);
                  }}
                >
                  <span>{view.name}</span>
                  {view.is_default && <Star className="h-3 w-3 text-yellow-500" />}
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditView(view.id)}
                    className="rounded-sm p-1 hover:bg-muted"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => onDeleteView(view.id)}
                    className="rounded-sm p-1 hover:bg-muted text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
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
              <span>Create new view</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 