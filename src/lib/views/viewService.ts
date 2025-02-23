import { executeQuery } from '../db/postgres';
import { v4 as uuidv4 } from 'uuid';
import { 
  ModelView, 
  ViewConfig,
  ViewConfigSchema as ViewConfigSchemaType,
  ModelViewSchema as ModelViewSchemaType,
  ViewConfigSchema,
  ModelViewSchema
} from '@/types/viewDefinition';

export class ViewService {
  async createView(
    modelId: string, 
    ownerId: string,
    name: string,
    config: ViewConfig,
    description?: string,
    isDefault = false,
    isPublic = false
  ): Promise<ModelView> {
    // Validate config against schema
    const validatedConfig = ViewConfigSchema.parse(config);

    // Check if default view exists if this is marked as default
    if (isDefault) {
      await this.unsetDefaultView(modelId, ownerId);
    }

    const sql = `
      INSERT INTO model_views (
        id, model_id, owner_id, name, description, config, is_default, is_public
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8
      ) RETURNING *;
    `;

    const values = [
      uuidv4(),
      modelId,
      ownerId,
      name,
      description,
      JSON.stringify(validatedConfig),
      isDefault,
      isPublic
    ];

    const result = await executeQuery(sql, values);
    return this.mapRowToView(result.rows[0]);
  }

  async getView(viewId: string): Promise<ModelView> {
    const sql = 'SELECT * FROM model_views WHERE id = $1;';
    const result = await executeQuery(sql, [viewId]);
    
    if (result.rows.length === 0) {
      throw new Error(`View not found: ${viewId}`);
    }

    return this.mapRowToView(result.rows[0]);
  }

  async getDefaultView(modelId: string, ownerId: string): Promise<ModelView | null> {
    const sql = `
      SELECT * FROM model_views 
      WHERE model_id = $1 
      AND owner_id = $2 
      AND is_default = true;
    `;
    const result = await executeQuery(sql, [modelId, ownerId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToView(result.rows[0]);
  }

  async listViews(modelId: string, ownerId: string): Promise<ModelView[]> {
    const sql = `
      SELECT * FROM model_views 
      WHERE model_id = $1 
      AND (owner_id = $2 OR is_public = true)
      ORDER BY created_at DESC;
    `;
    const result = await executeQuery(sql, [modelId, ownerId]);
    return result.rows.map(row => this.mapRowToView(row));
  }

  async updateView(
    viewId: string,
    ownerId: string,
    updates: Partial<ModelView>
  ): Promise<ModelView> {
    // Get existing view
    const view = await this.getView(viewId);
    if (view.owner_id !== ownerId) {
      throw new Error('Unauthorized to update this view');
    }

    // If making this view default, unset any existing default
    if (updates.is_default) {
      await this.unsetDefaultView(view.model_id, ownerId);
    }

    // Validate config if it's being updated
    if (updates.config) {
      updates.config = ViewConfigSchema.parse(updates.config);
    }

    const sql = `
      UPDATE model_views 
      SET 
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        config = COALESCE($3, config),
        is_default = COALESCE($4, is_default),
        is_public = COALESCE($5, is_public),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6 AND owner_id = $7
      RETURNING *;
    `;

    const values = [
      updates.name,
      updates.description,
      updates.config ? JSON.stringify(updates.config) : null,
      updates.is_default,
      updates.is_public,
      viewId,
      ownerId
    ];

    const result = await executeQuery(sql, values);
    
    if (result.rows.length === 0) {
      throw new Error(`Failed to update view: ${viewId}`);
    }

    return this.mapRowToView(result.rows[0]);
  }

  async deleteView(viewId: string, ownerId: string): Promise<void> {
    const view = await this.getView(viewId);
    if (view.owner_id !== ownerId) {
      throw new Error('Unauthorized to delete this view');
    }

    // Don't allow deleting the last default view
    if (view.is_default) {
      const otherViews = await this.listViews(view.model_id, ownerId);
      if (otherViews.length === 1) {
        throw new Error('Cannot delete the last view for a model');
      }
    }

    const sql = 'DELETE FROM model_views WHERE id = $1 AND owner_id = $2;';
    await executeQuery(sql, [viewId, ownerId]);
  }

  private async unsetDefaultView(modelId: string, ownerId: string): Promise<void> {
    const sql = `
      UPDATE model_views 
      SET is_default = false 
      WHERE model_id = $1 
      AND owner_id = $2 
      AND is_default = true;
    `;
    await executeQuery(sql, [modelId, ownerId]);
  }

  private mapRowToView(row: any): ModelView {
    return ModelViewSchema.parse({
      id: row.id,
      model_id: row.model_id,
      owner_id: row.owner_id,
      name: row.name,
      description: row.description,
      config: row.config,
      is_default: row.is_default,
      is_public: row.is_public,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    });
  }
} 