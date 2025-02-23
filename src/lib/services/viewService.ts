import type { ModelView, ViewConfig } from '@/types/viewDefinition';

class ViewService {
  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for auth
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    // Handle both wrapped and unwrapped responses
    return responseData.data || responseData;
  }

  async listViews(modelId: string): Promise<ModelView[]> {
    return this.fetchWithAuth(`/api/models/${modelId}/views`);
  }

  async createView(
    modelId: string,
    name: string,
    config: ViewConfig,
    description?: string,
    isDefault = false,
    isPublic = false
  ): Promise<ModelView> {
    return this.fetchWithAuth(`/api/models/${modelId}/views`, {
      method: 'POST',
      body: JSON.stringify({
        name,
        config,
        description,
        is_default: isDefault,
        is_public: isPublic,
      }),
    });
  }

  async updateView(
    modelId: string,
    viewId: string,
    updates: {
      name?: string;
      description?: string;
      config?: ViewConfig;
      is_default?: boolean;
      is_public?: boolean;
    }
  ): Promise<ModelView> {
    return this.fetchWithAuth(`/api/models/${modelId}/views?viewId=${viewId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteView(modelId: string, viewId: string): Promise<void> {
    await this.fetchWithAuth(`/api/models/${modelId}/views?viewId=${viewId}`, {
      method: 'DELETE',
    });
  }

  async getDefaultView(modelId: string): Promise<ModelView> {
    const views = await this.listViews(modelId);
    const defaultView = views.find(view => view.is_default);
    if (!defaultView) {
      throw new Error('No default view found');
    }
    return defaultView;
  }
}

export const viewService = new ViewService(); 