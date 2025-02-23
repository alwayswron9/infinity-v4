import { z } from 'zod';

// Column configuration schema
export const ViewColumnConfig = z.object({
  field: z.string(),
  visible: z.boolean(),
  width: z.number(),
  format: z.object({
    type: z.enum(['text', 'number', 'date', 'boolean', 'custom']),
    options: z.record(z.string(), z.any()).optional(),
    customFormatter: z.string().optional()
  }),
  sortable: z.boolean(),
  filterable: z.boolean()
});

// Sorting configuration schema
export const ViewSortConfig = z.object({
  field: z.string(),
  direction: z.enum(['asc', 'desc'])
});

// Filter configuration schema
export const ViewFilterConfig = z.object({
  field: z.string(),
  operator: z.enum([
    'equals', 'notEquals',
    'contains', 'notContains', 
    'startsWith', 'endsWith',
    'gt', 'gte', 'lt', 'lte',
    'between', 'in', 'notIn',
    'isNull', 'isNotNull'
  ]),
  value: z.any(),
  conjunction: z.enum(['and', 'or']).optional()
});

// Grouping configuration schema
export const ViewGroupConfig = z.object({
  fields: z.array(z.string()),
  aggregations: z.array(z.object({
    field: z.string(),
    function: z.enum(['sum', 'avg', 'count', 'min', 'max', 'countDistinct'])
  })),
  expandedByDefault: z.boolean().optional()
});

// Layout configuration schema
export const ViewLayoutConfig = z.object({
  density: z.enum(['compact', 'normal', 'comfortable']).default('normal'),
  theme: z.enum(['light', 'dark', 'system']).default('light')
});

// Realtime configuration schema
export const ViewRealtimeConfig = z.object({
  enabled: z.boolean(),
  highlightUpdates: z.boolean().optional(),
  updateBehavior: z.enum(['instant', 'batch']).optional(),
  batchInterval: z.number().optional()
});

// Complete view configuration schema
export const ViewConfigSchema = z.object({
  columns: z.array(ViewColumnConfig),
  filters: z.array(ViewFilterConfig).default([]),
  sorting: z.array(ViewSortConfig).default([{
    field: '_id',
    direction: 'asc'
  }]),
  layout: ViewLayoutConfig.default({
    density: 'normal',
    theme: 'light'
  }),
  grouping: ViewGroupConfig.optional(),
  realtime: ViewRealtimeConfig.optional()
});

// View definition schema
export const ModelViewSchema = z.object({
  id: z.string().uuid(),
  model_id: z.string().uuid(),
  owner_id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  config: ViewConfigSchema,
  is_default: z.boolean(),
  is_public: z.boolean(),
  created_at: z.date(),
  updated_at: z.date()
});

// Export TypeScript types
export type ViewColumnConfig = z.infer<typeof ViewColumnConfig>;
export type ViewSortConfig = z.infer<typeof ViewSortConfig>;
export type ViewFilterConfig = z.infer<typeof ViewFilterConfig>;
export type ViewGroupConfig = z.infer<typeof ViewGroupConfig>;
export type ViewLayoutConfig = z.infer<typeof ViewLayoutConfig>;
export type ViewRealtimeConfig = z.infer<typeof ViewRealtimeConfig>;
export type ViewConfig = z.infer<typeof ViewConfigSchema>;
export type ModelView = z.infer<typeof ModelViewSchema>; 