import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest, createErrorResponse } from '@/lib/api/middleware';
import { ModelService } from '@/lib/models/modelService';
import { PostgresDataService } from '@/lib/data/postgresDataService';

const modelService = new ModelService();

async function handleGetDetails(req: AuthenticatedRequest, { id }: { id: string }) {
  try {
    const userId = req.auth.payload.sub;

    // Fetch the model definition
    const modelDefinition = await modelService.getModelDefinition(id);
    
    // Verify ownership
    if (modelDefinition.owner_id !== userId) {
      return createErrorResponse('Unauthorized', 403);
    }

    // Initialize data service to get record count
    const dataService = new PostgresDataService(modelDefinition);
    
    // Get record count
    const { total: recordCount } = await dataService.listRecords({
      page: 1,
      limit: 1
    });

    // Get created date from the model
    const createdAt = modelDefinition.created_at 
      ? new Date(modelDefinition.created_at).toLocaleString()
      : 'Unknown';

    // Get updated date from the model
    const updatedAt = modelDefinition.updated_at 
      ? new Date(modelDefinition.updated_at).toLocaleString()
      : 'Unknown';

    // Prepare field information
    const fieldDetails = Object.entries(modelDefinition.fields).map(([name, field]) => {
      const fieldInfo: Record<string, any> = {
        name,
        type: field.type,
        required: field.required || false,
        unique: field.unique || false,
      };

      // Add additional properties based on field type
      if ('description' in field && field.description) {
        fieldInfo.description = field.description;
      }
      
      if ('default' in field && field.default !== undefined) {
        fieldInfo.default = field.default;
      }
      
      if ('enum' in field && field.enum) {
        fieldInfo.enum = field.enum;
      }

      return fieldInfo;
    });

    // Extract vector search configuration if available
    let vectorSearchConfig: Record<string, any> = { enabled: false };
    
    if (modelDefinition.embedding?.enabled) {
      vectorSearchConfig = {
        enabled: true,
        sourceFields: modelDefinition.embedding.source_fields || []
      };
      
      // Add optional properties if they exist
      if ('provider' in modelDefinition.embedding) {
        vectorSearchConfig.provider = modelDefinition.embedding.provider;
      }
      
      if ('dimensions' in modelDefinition.embedding) {
        vectorSearchConfig.dimensions = modelDefinition.embedding.dimensions;
      }
    }

    // Compile the comprehensive model details
    const modelDetails = {
      id: modelDefinition.id,
      name: modelDefinition.name,
      description: modelDefinition.description || 'No description provided',
      recordCount,
      createdAt,
      updatedAt,
      fields: fieldDetails,
      vectorSearch: vectorSearchConfig,
      relationships: modelDefinition.relationships || [],
      indexes: modelDefinition.indexes || []
    };

    return NextResponse.json({
      success: true,
      data: modelDetails
    });
  } catch (error: any) {
    console.error('Error fetching model details:', error);
    return createErrorResponse(
      error.message || 'Failed to fetch model details',
      error.status || 500
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const resolvedParams = await params;
  return withAuth(request, async (req) => {
    return handleGetDetails(req, resolvedParams);
  }, { params: resolvedParams });
} 