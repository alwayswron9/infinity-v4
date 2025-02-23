"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { ModelView, ViewConfig } from '@/types/viewDefinition';
import { cn } from '@/lib/utils';

// Schema that matches exactly with the API's expected format
const viewFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  config: z.object({
    columns: z.array(z.object({
      field: z.string(),
      visible: z.boolean(),
      width: z.number(),
      format: z.object({
        type: z.enum(['text', 'number', 'date', 'boolean', 'custom'])
      }),
      sortable: z.boolean(),
      filterable: z.boolean()
    })),
    filters: z.array(z.object({
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
    })).default([]),
    sorting: z.array(z.object({
      field: z.string(),
      direction: z.enum(['asc', 'desc'])
    })).default([{
      field: '_id',
      direction: 'asc'
    }]),
    layout: z.object({
      density: z.enum(['compact', 'normal', 'comfortable']).default('normal'),
      theme: z.enum(['light', 'dark', 'system']).default('light')
    }).default({
      density: 'normal',
      theme: 'light'
    }),
    grouping: z.object({
      fields: z.array(z.string()),
      aggregations: z.array(z.object({
        field: z.string(),
        function: z.enum(['sum', 'avg', 'count', 'min', 'max', 'countDistinct'])
      })),
      expandedByDefault: z.boolean().optional()
    }).optional(),
    realtime: z.object({
      enabled: z.boolean(),
      highlightUpdates: z.boolean().optional(),
      updateBehavior: z.enum(['instant', 'batch']).optional(),
      batchInterval: z.number().optional()
    }).optional()
  }),
  is_default: z.boolean().default(false),
  is_public: z.boolean().default(false)
});

type ViewFormData = z.infer<typeof viewFormSchema>;

interface ViewEditorProps {
  view?: ModelView;
  availableColumns: string[];
  onSave: (data: ViewFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ViewEditor({
  view,
  availableColumns,
  onSave,
  onCancel,
  isLoading = false
}: ViewEditorProps) {
  const form = useForm<ViewFormData>({
    resolver: zodResolver(viewFormSchema),
    defaultValues: view ? {
      name: view.name,
      description: view.description,
      is_default: view.is_default,
      is_public: view.is_public,
      config: {
        columns: availableColumns.map(field => {
          const existingColumn = view.config.columns.find(col => col.field === field);
          return {
            field,
            visible: existingColumn?.visible ?? true,
            width: existingColumn?.width ?? 150,
            format: existingColumn?.format ?? { type: field.startsWith('_') && field.endsWith('_at') ? 'date' : 'text' },
            sortable: existingColumn?.sortable ?? true,
            filterable: existingColumn?.filterable ?? true
          };
        }),
        filters: view.config.filters || [],
        sorting: view.config.sorting || [{ field: '_id', direction: 'asc' }],
        layout: view.config.layout || { density: 'normal', theme: 'light' },
        grouping: view.config.grouping || { fields: [], aggregations: [], expandedByDefault: false },
        realtime: view.config.realtime || { enabled: false, highlightUpdates: false, updateBehavior: 'instant', batchInterval: 0 }
      }
    } : {
      name: '',
      description: '',
      is_default: false,
      is_public: false,
      config: {
        columns: availableColumns.map(field => ({
          field,
          visible: true,
          width: 150,
          format: { 
            type: field.startsWith('_') && field.endsWith('_at') ? 'date' : 'text'
          },
          sortable: true,
          filterable: true
        })),
        filters: [],
        sorting: [{ field: '_id', direction: 'asc' }],
        layout: { density: 'normal', theme: 'light' },
        grouping: { fields: [], aggregations: [], expandedByDefault: false },
        realtime: { enabled: false, highlightUpdates: false, updateBehavior: 'instant', batchInterval: 0 }
      }
    }
  });

  const { register, handleSubmit, formState: { errors } } = form;

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-6">
      <div>
        <input
          {...register('name')}
          placeholder="View Name"
          className="text-xl font-medium border-0 px-0 h-auto focus:ring-0 placeholder:text-gray-400 w-full"
        />
        {errors.name?.message && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium rounded-md border hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          {isLoading ? 'Saving...' : (view ? 'Update View' : 'Create View')}
        </button>
      </div>
    </form>
  );
} 