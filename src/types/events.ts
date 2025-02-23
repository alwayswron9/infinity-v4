export type ModelDataEvent = {
  type: 'created' | 'updated' | 'deleted';
  modelId: string;
  recordId: string;
  data?: Record<string, any>;
  timestamp: number;
  viewId?: string; // Optional: if the event is specific to a view
};

export type ViewUpdateEvent = {
  type: 'config_updated' | 'view_deleted';
  viewId: string;
  modelId: string;
  data?: Record<string, any>;
  timestamp: number;
};

export type RealtimeEvent = ModelDataEvent | ViewUpdateEvent; 