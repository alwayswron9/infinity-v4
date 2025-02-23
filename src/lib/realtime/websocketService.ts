import { ModelDataEvent, ViewUpdateEvent, RealtimeEvent } from '@/types/events';
import { pusherServer } from './pusherConfig';

export class WebSocketService {
  async publishModelUpdate(modelId: string, event: ModelDataEvent): Promise<void> {
    const channel = `model-${modelId}`;
    await pusherServer.trigger(channel, 'data-update', {
      ...event,
      timestamp: Date.now()
    });
  }

  async publishViewUpdate(viewId: string, event: ViewUpdateEvent): Promise<void> {
    const channel = `view-${viewId}`;
    await pusherServer.trigger(channel, 'view-update', {
      ...event,
      timestamp: Date.now()
    });
  }

  async publishBatchUpdate(modelId: string, events: ModelDataEvent[]): Promise<void> {
    const channel = `model-${modelId}`;
    await pusherServer.trigger(channel, 'batch-update', {
      events: events.map(event => ({
        ...event,
        timestamp: Date.now()
      })),
      timestamp: Date.now()
    });
  }

  async publishToUser(userId: string, event: RealtimeEvent): Promise<void> {
    const channel = `private-user-${userId}`;
    await pusherServer.trigger(channel, 'notification', {
      ...event,
      timestamp: Date.now()
    });
  }

  getChannelName(type: 'model' | 'view' | 'user', id: string): string {
    switch (type) {
      case 'model':
        return `model-${id}`;
      case 'view':
        return `view-${id}`;
      case 'user':
        return `private-user-${id}`;
    }
  }
}

// Create singleton instance
export const websocketService = new WebSocketService(); 