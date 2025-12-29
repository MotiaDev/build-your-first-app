// steps/typescript/delete-pet.step.ts
import { ApiRouteConfig, Handlers } from 'motia';
import { z } from 'zod';
import { TSStore } from './ts-store';

// Define path parameter schema
const pathParamsSchema = z.object({
  id: z.string().min(1, 'Pet ID is required')
});

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'TsDeletePet',
  path: '/ts/pets/:id',
  method: 'DELETE',
  emits: [],
  flows: ['TsPetManagement']
};

export const handler: Handlers['TsDeletePet'] = async (req, { logger }) => {
  try {
    // Validate path parameters
    const { id } = pathParamsSchema.parse(req.pathParams);

    const deletedPet = TSStore.softDelete(id);

    if (!deletedPet) {
      return { status: 404, body: { message: 'Pet not found' } };
    }

    if (logger) {
      logger.info('🗑️ Pet soft deleted', {
        petId: deletedPet.id,
        name: deletedPet.name,
        purgeAt: new Date(deletedPet.purgeAt!).toISOString()
      });
    }

    return {
      status: 202,
      body: {
        message: 'Pet scheduled for deletion',
        petId: deletedPet.id,
        purgeAt: deletedPet.purgeAt
      }
    };

  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        status: 400,
        body: {
          message: 'Validation error',
          errors: error.errors
        }
      };
    }

    return {
      status: 500,
      body: { message: 'Internal server error' }
    };
  }
};