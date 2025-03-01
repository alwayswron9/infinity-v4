import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, DatabaseIcon, LayoutDashboardIcon, Plus, Trash, ClipboardCopy } from 'lucide-react';
import { ViewSelector } from '@/components/data/table/ViewSelector';
import { EditableHeading } from './EditableHeading';
import type { ModelView as ModelViewType } from '@/types/viewDefinition';

interface ModelHeaderProps {
  modelId: string;
  modelName: string;
  currentView: ModelViewType | null;
  editedName: string;
  isEditingName: boolean;
  setEditingName: (isEditing: boolean) => void;
  onViewNameEdit: (name: string) => void;
  onCopyModelDetails: () => void;
  onAddData: () => void;
  onClearData: () => void;
  copyingDetails: boolean;
  views: ModelViewType[];
  activeViewId: string | null;
  onViewSelect: (viewId: string) => void;
  onCreateView: () => void;
  onDeleteView: (viewId: string) => Promise<void>;
  setEditedName: (name: string) => void;
}

export function ModelHeader({
  modelId,
  modelName,
  currentView,
  editedName,
  isEditingName,
  setEditingName,
  onViewNameEdit,
  onCopyModelDetails,
  onAddData,
  onClearData,
  copyingDetails,
  views,
  activeViewId,
  onViewSelect,
  onCreateView,
  onDeleteView,
  setEditedName
}: ModelHeaderProps) {
  return (
    <div className="model-header-container">
      <div className="model-header-content">
        <div className="model-header-left">
          <Link 
            href="/models" 
            className="back-button"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="model-header-title">
            <DatabaseIcon className="h-5 w-5" />
            <div className="flex flex-col">
              <h1 className="model-name-title">{modelName}</h1>
            </div>
          </div>
          {currentView && (
            <div className="view-name-container">
              <LayoutDashboardIcon className="view-icon" />
              <EditableHeading
                value={editedName}
                onChange={setEditedName}
                isEditing={isEditingName}
                onEditStart={() => setEditingName(true)}
                onEditEnd={() => {
                  setEditingName(false);
                  onViewNameEdit(editedName);
                }}
                className="text-sm"
              />
            </div>
          )}
        </div>
        <div className="model-header-right">
          <Button
            variant="outline"
            onClick={onCopyModelDetails}
            disabled={copyingDetails}
            className="action-button"
          >
            <ClipboardCopy className="h-4 w-4" />
            {copyingDetails ? 'Copying...' : 'Copy Details'}
          </Button>
          <Button
            variant="outline"
            onClick={onAddData}
            className="action-button"
          >
            <Plus className="h-4 w-4" />
            Add Data
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (window.confirm(`Are you sure you want to clear all data for ${modelName}? This action cannot be undone.`)) {
                onClearData();
              }
            }}
            className="action-button text-warning"
          >
            <Trash className="h-4 w-4" />
            Clear Data
          </Button>
          <ViewSelector
            views={views}
            activeViewId={activeViewId}
            onViewSelect={onViewSelect}
            onCreateView={onCreateView}
            onDeleteView={onDeleteView}
          />
        </div>
      </div>
    </div>
  );
} 