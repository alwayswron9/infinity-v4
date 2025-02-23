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

    // Return undefined for 204 No Content responses
    if (response.status === 204) {
      return undefined;
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
    try {
      // First try to get an existing default view
      const response = await this.fetchWithAuth(`/api/models/${modelId}/views/default`);
      return response;
    } catch (error) {
      console.error('Error getting default view:', error);
      throw error;
    }
  }
}

export const viewService = new ViewService(); 