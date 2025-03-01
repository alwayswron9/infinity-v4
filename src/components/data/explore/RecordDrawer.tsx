import React from 'react';
import { Button } from '@/components/ui/button';
import { SideDrawer } from '@/components/layout/SideDrawer';
import { ModelDataForm } from '@/components/models/ModelDataForm';

interface RecordDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isEditMode: boolean;
  setEditMode: (isEditMode: boolean) => void;
  title: string;
  record: Record<string, any> | null;
  model: any;
  onSubmit: (data: Record<string, any>) => Promise<void>;
}

export function RecordDrawer({
  isOpen,
  onClose,
  isEditMode,
  setEditMode,
  title,
  record,
  model,
  onSubmit
}: RecordDrawerProps) {
  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      className="record-drawer"
    >
      <div className="record-form-container">
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditMode(!isEditMode)}
            className="gap-1.5"
          >
            {isEditMode ? "Cancel Edit" : "Edit Record"}
          </Button>
        </div>
        
        <ModelDataForm
          model={model}
          initialData={record || undefined}
          onSubmit={onSubmit}
          onCancel={() => {
            if (isEditMode) {
              setEditMode(false);
            } else {
              onClose();
            }
          }}
          submitButtonText="Save Changes"
          readOnly={!isEditMode}
        />
      </div>
    </SideDrawer>
  );
} 