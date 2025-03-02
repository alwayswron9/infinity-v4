import React from 'react';
import { ConfirmDialog } from '@saas-ui/react';
import { FilterDrawer } from '../FilterDrawer';
import { DataDrawersProps } from './types';

export function DataDrawers({
  currentView,
  isFilterDrawerOpen,
  onCloseFilterDrawer,
  isClearDataDialogOpen,
  onCloseClearDataDialog,
  onClearData,
  onConfigChange
}: DataDrawersProps) {
  return (
    <>
      {currentView && (
        <FilterDrawer
          isOpen={isFilterDrawerOpen}
          onClose={onCloseFilterDrawer}
          currentView={currentView}
          onConfigChange={onConfigChange}
        />
      )}
      
      <ConfirmDialog
        isOpen={isClearDataDialogOpen}
        onClose={onCloseClearDataDialog}
        title="Clear all data"
        confirmProps={{ colorScheme: 'red' }}
        onConfirm={() => {
          onClearData();
          onCloseClearDataDialog();
        }}
      >
        Are you sure you want to clear all data? This action cannot be undone.
      </ConfirmDialog>
    </>
  );
} 