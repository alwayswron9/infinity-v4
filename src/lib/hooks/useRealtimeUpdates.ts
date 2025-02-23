import { useEffect, useCallback, useRef } from 'react';
import { ModelDataEvent, ViewUpdateEvent } from '@/types/events';
import { ViewConfig } from '@/types/viewDefinition';
import { pusherClient } from '../realtime/pusherConfig';

type UpdateCallback = (event: ModelDataEvent) => void;
type ViewUpdateCallback = (event: ViewUpdateEvent) => void;

interface UseRealtimeUpdatesOptions {
  modelId: string;
  viewId?: string;
  viewConfig?: ViewConfig;
  onUpdate?: UpdateCallback;
  onViewUpdate?: ViewUpdateCallback;
  batchInterval?: number;
}

export function useRealtimeUpdates(options: UseRealtimeUpdatesOptions) {
  const {
    modelId,
    viewId,
    viewConfig,
    onUpdate,
    onViewUpdate,
    batchInterval = 1000
  } = options;

  // Refs for batch processing
  const batchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const batchedEventsRef = useRef<ModelDataEvent[]>([]);

  // Process batched events
  const processBatchedEvents = useCallback(() => {
    const events = batchedEventsRef.current;
    if (events.length > 0 && onUpdate) {
      // Sort events by timestamp
      const sortedEvents = [...events].sort((a, b) => a.timestamp - b.timestamp);
      
      // Process each event
      sortedEvents.forEach(onUpdate);

      // Clear the batch
      batchedEventsRef.current = [];
    }
  }, [onUpdate]);

  // Handler for individual updates
  const handleUpdate = useCallback((event: ModelDataEvent) => {
    if (!viewConfig?.realtime?.enabled) return;

    if (viewConfig?.realtime?.updateBehavior === 'batch') {
      // Add to batch
      batchedEventsRef.current.push(event);

      // Clear existing timeout
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }

      // Set new timeout
      batchTimeoutRef.current = setTimeout(processBatchedEvents, batchInterval);
    } else {
      // Process immediately
      onUpdate?.(event);
    }
  }, [viewConfig, onUpdate, batchInterval, processBatchedEvents]);

  // Handler for view updates
  const handleViewUpdate = useCallback((event: ViewUpdateEvent) => {
    onViewUpdate?.(event);
  }, [onViewUpdate]);

  useEffect(() => {
    if (!modelId) return;

    // Subscribe to model channel
    const modelChannel = pusherClient.subscribe(`model-${modelId}`);
    modelChannel.bind('data-update', handleUpdate);
    modelChannel.bind('batch-update', (data: { events: ModelDataEvent[] }) => {
      data.events.forEach(handleUpdate);
    });

    // Subscribe to view channel if viewId is provided
    let viewChannel;
    if (viewId) {
      viewChannel = pusherClient.subscribe(`view-${viewId}`);
      viewChannel.bind('view-update', handleViewUpdate);
    }

    // Cleanup function
    return () => {
      // Clear any pending batch
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
        processBatchedEvents(); // Process any remaining events
      }

      // Unsubscribe from channels
      pusherClient.unsubscribe(`model-${modelId}`);
      if (viewId) {
        pusherClient.unsubscribe(`view-${viewId}`);
      }
    };
  }, [modelId, viewId, handleUpdate, handleViewUpdate, processBatchedEvents]);

  // Return functions to manually trigger updates if needed
  return {
    publishUpdate: handleUpdate,
    publishViewUpdate: handleViewUpdate,
    processBatch: processBatchedEvents
  };
} 