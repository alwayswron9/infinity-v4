import React from 'react';
import { SideDrawer } from '@/components/layout/SideDrawer';
import { ModelDataForm } from '@/components/models/ModelDataForm';

interface AddDataDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  modelName: string;
  modelDefinition: any;
  onSubmit: (data: Record<string, any>) => Promise<void>;
}

export function AddDataDrawer({
  isOpen,
  onClose,
  modelName,
  modelDefinition,
  onSubmit
}: AddDataDrawerProps) {
  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Data to ${modelName}`}
      className="record-drawer"
    >
      <div className="record-form-container">
        <ModelDataForm
          model={modelDefinition}
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      </div>
    </SideDrawer>
  );
} 