// steps/typescript/get-pet.step.ts
import { ApiRouteConfig, Handlers } from 'motia';
import { z } from 'zod';
import { TSStore } from './ts-store';

// Define path parameter schema
const pathParamsSchema = z.object({
  id: z.string().min(1, 'Pet ID is required')
});

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'TsGetPet',
  path: '/ts/pets/:id',
  method: 'GET',
  emits: [],
  flows: ['TsPetManagement']
};

export const handler: Handlers['TsGetPet'] = async (req, { logger }) => {
  try {
    // Validate path parameters
    const { id } = pathParamsSchema.parse(req.pathParams);

    const pet = TSStore.get(id);

    if (!pet) {
      return { status: 404, body: { message: 'Pet not found' } };
    }

    return { status: 200, body: pet };

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