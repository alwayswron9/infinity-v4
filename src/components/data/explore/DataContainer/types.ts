import type { ModelView as ModelViewType } from '@/types/viewDefinition';
import type { ColumnDef } from '@tanstack/react-table';

export interface DataContainerProps {
  currentView: ModelViewType | null;
  data: any[];
  columns: ColumnDef<Record<string, any>>[];
  pagination: { pageIndex: number; pageSize: number; pageCount: number; total: number } | null;
  isLoadingData: boolean;
  isInitialLoad: boolean;
  hasUnsavedChanges: boolean;
  availableColumns: string[];
  views: ModelViewType[];
  activeViewId: string | null;
  modelName: string;
  onPaginationChange: (pageIndex: number, pageSize: number) => void;
  onConfigChange: (config: any) => void;
  onSave: () => void;
  onEditRow: (row: Record<string, any>) => void;
  onDeleteRow: (row: Record<string, any>) => void;
  onCreateView: () => void;
  onViewSelect: (viewId: string) => void;
  onDeleteView: (viewId: string) => Promise<void>;
  onAddData: () => void;
  onCopyModelDetails: () => void;
  onClearData: () => void;
  onViewNameEdit?: (newName: string) => void;
  copyingDetails?: boolean;
  editedName?: string;
  isEditingName?: boolean;
  setEditingName?: (isEditing: boolean) => void;
  setEditedName?: (name: string) => void;
}

export type DataHeaderProps = Pick<DataContainerProps, 
  'currentView' | 'hasUnsavedChanges' | 'activeViewId' | 'views' |
  'onSave' | 'onCreateView' | 'onViewSelect' | 'onDeleteView' | 
  'onCopyModelDetails' | 'copyingDetails' | 'editedName' | 
  'isEditingName' | 'setEditingName' | 'setEditedName' | 'onViewNameEdit'> & {
  viewName: string;
  editing: boolean;
  setEditing: (editing: boolean) => void;
  onOpenFilterDrawer: () => void;
  allAvailableColumns: { key: string; label: string; visible: boolean }[];
  handleColumnToggle: (columnKey: string, isVisible: boolean) => void;
  currentFilters: any[];
  onOpenClearDataDialog: () => void;
};

export type DataTableProps = Pick<DataContainerProps, 
  'data' | 'isLoadingData' | 'currentView' | 'onEditRow' | 'onDeleteRow'> & {
  visibleColumns: ColumnDef<Record<string, any>>[];
};

export type DataFooterProps = Pick<DataContainerProps, 'pagination' | 'onPaginationChange'> & {
  pageSizeOptions: number[];
};

export type DataDrawersProps = Pick<DataContainerProps, 
  'currentView' | 'onConfigChange' | 'onClearData'> & {
  isFilterDrawerOpen: boolean;
  onCloseFilterDrawer: () => void;
  isClearDataDialogOpen: boolean;
  onCloseClearDataDialog: () => void;
};

export interface EmptyStateViewProps {
  onCreateView: () => void;
} 