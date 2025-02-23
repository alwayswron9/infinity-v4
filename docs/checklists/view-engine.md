# View Engine & Real-time Updates Implementation Checklist

## 1. Database Schema Updates

### 1.1 Create Views Table
```sql
CREATE TABLE model_views (
  id UUID PRIMARY KEY,
  model_id UUID NOT NULL REFERENCES model_definitions(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  config JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(model_id, owner_id, name)
);

-- Index for faster lookups
CREATE INDEX model_views_model_id_idx ON model_views(model_id);
CREATE INDEX model_views_owner_id_idx ON model_views(owner_id);
```

### 1.2 View Configuration Schema
```typescript
// types/viewDefinition.ts
export interface ViewConfig {
  columns: {
    field: string;
    visible: boolean;
    width?: number;
    format?: {
      type: 'text' | 'number' | 'date' | 'boolean' | 'custom';
      options?: Record<string, any>;
    };
    sortable?: boolean;
    filterable?: boolean;
  }[];
  sorting: {
    field: string;
    direction: 'asc' | 'desc';
  }[];
  filters: {
    field: string;
    operator: 'equals' | 'contains' | 'gt' | 'lt' | 'between' | 'in';
    value: any;
  }[];
  grouping?: {
    fields: string[];
    aggregations: {
      field: string;
      function: 'sum' | 'avg' | 'count' | 'min' | 'max';
    }[];
  };
  layout: {
    density: 'compact' | 'normal' | 'comfortable';
    theme?: 'light' | 'dark';
  };
}
```

## 2. Real-time Updates Infrastructure

### 2.1 WebSocket Setup
- [ ] Install `@pusher/pusher-js` for client and `pusher` for server
- [ ] Create WebSocket connection manager in `lib/realtime/websocket.ts`
- [ ] Set up Pusher channels for model data updates
- [ ] Implement authentication for WebSocket connections

### 2.2 Event System
```typescript
// lib/realtime/events.ts
export type ModelDataEvent = {
  type: 'created' | 'updated' | 'deleted';
  modelId: string;
  recordId: string;
  data?: Record<string, any>;
  timestamp: number;
};
```

## 3. View Engine Components

### 3.1 Core Table Component
- [ ] Replace current DataTable with `@tanstack/react-table`
- [ ] Implement in `components/data/EnhancedDataTable.tsx`
- [ ] Add support for:
  - Column resizing
  - Column reordering
  - Column hiding/showing
  - Custom cell rendering
  - Row selection
  - Sorting
  - Filtering
  - Grouping
  - Pagination
  - Row virtualization

### 3.2 View Management UI
- [ ] Create ViewSelector component
- [ ] Create ViewEditor component
- [ ] Create ViewSaveDialog component
- [ ] Add view management toolbar

### 3.3 Visual Feedback Components
```typescript
// components/data/VisualCues.tsx
export const RowHighlight: React.FC<{
  type: 'created' | 'updated' | 'deleted';
  duration?: number;
}>;

export const CellUpdate: React.FC<{
  oldValue: any;
  newValue: any;
  type: 'number' | 'text' | 'date';
}>;
```

## 4. State Management

### 4.1 View Store
```typescript
// lib/stores/viewStore.ts
interface ViewState {
  activeView: string | null;
  views: ModelView[];
  config: ViewConfig;
  loading: boolean;
  error: string | null;
}

class ViewStore {
  subscribe(callback: (state: ViewState) => void): () => void;
  loadViews(modelId: string): Promise<void>;
  saveView(view: Partial<ModelView>): Promise<void>;
  deleteView(viewId: string): Promise<void>;
  setActiveView(viewId: string): void;
  updateConfig(config: Partial<ViewConfig>): void;
}
```

### 4.2 Real-time State Updates
- [ ] Implement optimistic updates
- [ ] Add rollback mechanism for failed operations
- [ ] Handle conflict resolution

## 5. API Endpoints

### 5.1 View Management
```typescript
// app/api/models/[id]/views/route.ts
// GET /api/models/[id]/views
// POST /api/models/[id]/views
// PUT /api/models/[id]/views/[viewId]
// DELETE /api/models/[id]/views/[viewId]
```

### 5.2 Real-time Updates
```typescript
// app/api/models/[id]/realtime/route.ts
// POST /api/models/[id]/realtime/subscribe
// POST /api/models/[id]/realtime/unsubscribe
```

## 6. Services

### 6.1 View Service
```typescript
// lib/views/viewService.ts
class ViewService {
  createView(modelId: string, config: ViewConfig): Promise<ModelView>;
  updateView(viewId: string, config: Partial<ViewConfig>): Promise<ModelView>;
  deleteView(viewId: string): Promise<void>;
  listViews(modelId: string): Promise<ModelView[]>;
  getDefaultView(modelId: string): Promise<ModelView>;
}
```

### 6.2 Real-time Service
```typescript
// lib/realtime/realtimeService.ts
class RealtimeService {
  subscribeToModel(modelId: string, callback: (event: ModelDataEvent) => void): () => void;
  publishUpdate(event: ModelDataEvent): Promise<void>;
  getRecentEvents(modelId: string, since: Date): Promise<ModelDataEvent[]>;
}
```

## 7. UI Updates

### 7.1 Explore Page Updates
- [ ] Update `src/app/(protected)/models/[id]/explore/page.tsx`
- [ ] Add view management section
- [ ] Add real-time indicators
- [ ] Implement view persistence

### 7.2 Model Service Updates
- [ ] Update `src/lib/models/modelService.ts` to handle view-related operations
- [ ] Add real-time event handling
- [ ] Implement view validation

## 8. Testing

### 8.1 Unit Tests
- [ ] View configuration validation
- [ ] Real-time event handling
- [ ] State management
- [ ] Data transformation

### 8.2 Integration Tests
- [ ] View CRUD operations
- [ ] Real-time updates
- [ ] WebSocket connection handling
- [ ] State synchronization

## 9. Documentation

### 9.1 Technical Documentation
- [ ] Architecture overview
- [ ] View configuration guide
- [ ] Real-time events reference
- [ ] API endpoints documentation

### 9.2 User Documentation
- [ ] View management guide
- [ ] Real-time features guide
- [ ] Configuration options reference
- [ ] Best practices

## 10. Performance Optimization

### 10.1 Client-side
- [ ] Implement row virtualization
- [ ] Optimize re-renders
- [ ] Add request debouncing
- [ ] Implement proper cleanup

### 10.2 Server-side
- [ ] Add proper indexing
- [ ] Implement caching
- [ ] Optimize WebSocket messages
- [ ] Add rate limiting

## Required Packages

```json
{
  "dependencies": {
    "@tanstack/react-table": "^8.9.3",
    "@pusher/pusher-js": "^8.0.2",
    "pusher": "^5.1.3",
    "zustand": "^4.3.9",
    "react-virtual": "^2.10.4",
    "date-fns": "^2.30.0",
    "react-hook-form": "^7.45.1",
    "zod": "^3.21.4"
  }
}
```

## Implementation Order

1. Database schema updates
2. Basic view management (CRUD)
3. Core table component with @tanstack/react-table
4. View configuration UI
5. Real-time infrastructure
6. Visual feedback components
7. State management
8. Performance optimization
9. Testing
10. Documentation
