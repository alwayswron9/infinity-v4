import { NextResponse } from 'next/server';
import { ModelService } from '@/lib/models/modelService';
import { v4 as uuidv4 } from 'uuid';
import { CreateModelDefinitionInput, UpdateModelDefinitionInput } from '@/types/modelDefinition';

export async function GET() {
  try {
    const testResults: Record<string, any> = {};
    const modelService = new ModelService();

    // Test data
    const ownerId = uuidv4();
    const testModel: CreateModelDefinitionInput = {
      name: 'test-model-' + Date.now(),
      description: 'Test model description',
      fields: {
        title: {
          id: uuidv4(),
          type: 'string' as const,
          required: true
        },
        count: {
          id: uuidv4(),
          type: 'number' as const,
          default: 0
        }
      },
      embedding: {
        enabled: true,
        source_fields: ['title']
      }
    };

    // 1. Test Model Creation
    const model = await modelService.createModelDefinition(testModel, ownerId);
    testResults.creation = {
      success: true,
      model: {
        id: model.id,
        name: model.name,
        fields: model.fields
      }
    };

    // 2. Test Model Retrieval
    const foundById = await modelService.getModelDefinition(model.id);
    const foundByName = await modelService.getModelDefinitionByName(model.name, ownerId);
    const allModels = await modelService.listModelDefinitions(ownerId);

    testResults.retrieval = {
      byId: foundById.id === model.id,
      byName: foundByName.id === model.id,
      list: allModels.length === 1
    };

    // 3. Test Model Update
    const updateData: UpdateModelDefinitionInput = {
      description: 'Updated description',
      fields: {
        ...model.fields,
        description: {
          id: uuidv4(),
          type: 'string' as const
        }
      }
    };

    const updatedModel = await modelService.updateModelDefinition(model.id, updateData, ownerId);
    testResults.update = {
      success: true,
      description: updatedModel.description === updateData.description,
      fieldCount: Object.keys(updatedModel.fields).length === 3
    };

    // 4. Test CRUD Operation Validation
    const validationResult = await modelService.validateCrudOperation(model.id, ownerId);
    testResults.validation = {
      success: validationResult.id === model.id
    };

    // 5. Test Duplicate Prevention
    try {
      await modelService.createModelDefinition(testModel, ownerId);
      testResults.duplicatePrevention = {
        success: false,
        error: 'Failed to prevent duplicate model name'
      };
    } catch (error: any) {
      testResults.duplicatePrevention = {
        success: true,
        error: error.message
      };
    }

    // 6. Test Invalid Field Type
    try {
      await modelService.createModelDefinition({
        name: 'invalid-model',
        fields: {
          test: {
            id: uuidv4(),
            type: 'invalid' as any
          }
        }
      }, ownerId);
      testResults.fieldValidation = {
        success: false,
        error: 'Failed to prevent invalid field type'
      };
    } catch (error: any) {
      testResults.fieldValidation = {
        success: true,
        error: error.message
      };
    }

    // 7. Test Unauthorized Update
    try {
      await modelService.updateModelDefinition(model.id, updateData, uuidv4());
      testResults.authorizationCheck = {
        success: false,
        error: 'Failed to prevent unauthorized update'
      };
    } catch (error: any) {
      testResults.authorizationCheck = {
        success: true,
        error: error.message
      };
    }

    // 8. Clean up
    await modelService.deleteModelDefinition(model.id, ownerId);
    try {
      await modelService.getModelDefinition(model.id);
      testResults.cleanup = {
        success: false,
        error: 'Failed to delete model'
      };
    } catch (error) {
      testResults.cleanup = {
        success: true
      };
    }

    return NextResponse.json({
      success: true,
      message: 'PostgreSQL model service tests completed successfully',
      results: testResults
    });

  } catch (error: any) {
    console.error('PostgreSQL model service test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 