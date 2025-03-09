import { toast } from 'sonner';

// Use a more generic type for ModelView to avoid type conflicts
export interface GenericModelView {
  id: string;
  model_id: string;
  owner_id: string;
  name: string;
  config: any;
  is_default?: boolean;
  is_public?: boolean;
  [key: string]: any;
}

export interface ViewHandlerProps {
  currentView: GenericModelView | null;
  handleSaveView: (view: Partial<GenericModelView>) => Promise<void>;
  handleViewConfigChange: (config: any) => void;
  setIsEditing: (isEditing: boolean) => void;
  editedName: string;
}

// Handle config change
export const createConfigChangeHandler = (props: {
  currentView: GenericModelView | null;
  handleViewConfigChange: (config: any) => void;
  setIsEditing: (isEditing: boolean) => void;
}) => {
  const { currentView, handleViewConfigChange, setIsEditing } = props;
  
  return (config: any) => {
    console.log("ExplorePage: handleConfigChange called with config:", config);
    
    if (!currentView) {
      console.error("ExplorePage: Cannot change config - no current view");
      return;
    }
    
    console.log("ExplorePage: Calling handleViewConfigChange");
    handleViewConfigChange(config);
    
    // Set isEditing flag to ensure Save button appears when config changes
    console.log("ExplorePage: Setting isEditing to true");
    setIsEditing(true);
  };
};

// Handle save view changes
export const createSaveChangesHandler = (props: {
  currentView: GenericModelView | null;
  handleSaveView: (view: Partial<GenericModelView>) => Promise<void>;
  editedName: string;
}) => {
  const { currentView, handleSaveView, editedName } = props;
  
  return async () => {
    if (!currentView) return;
    
    console.log("ViewHandlers: createSaveChangesHandler called");
    console.log("ViewHandlers: Current view:", currentView);
    console.log("ViewHandlers: Edited name:", editedName);
    
    try {
      // Make sure we're updating the existing view by preserving its ID
      await handleSaveView({
        ...currentView,
        name: editedName || currentView.name
      });
      
      toast.success('View saved successfully');
    } catch (error: any) {
      toast.error(error.message);
    }
  };
};

// Handle view name edit
export const createViewNameEditHandler = (props: {
  setEditedName: (name: string) => void;
  setIsEditingName: (isEditing: boolean) => void;
  setIsEditing: (isEditing: boolean) => void;
}) => {
  const { setEditedName, setIsEditingName, setIsEditing } = props;
  
  return (newName: string) => {
    console.log("ViewHandlers: createViewNameEditHandler called with newName:", newName);
    
    // Update the edited name
    setEditedName(newName);
    
    // Only set editing flags if not already set
    // This prevents unnecessary re-renders
    setIsEditingName(true);
    setIsEditing(true);
  };
};

// Handle row click
export const createRowClickHandler = (props: {
  setCurrentRecord: (record: Record<string, any>) => void;
  setIsEditMode: (isEditMode: boolean) => void;
  onRecordDrawerOpen: () => void;
}) => {
  const { setCurrentRecord, setIsEditMode, onRecordDrawerOpen } = props;
  
  return (row: Record<string, any>) => {
    setCurrentRecord(row);
    setIsEditMode(false);
    onRecordDrawerOpen();
  };
};
