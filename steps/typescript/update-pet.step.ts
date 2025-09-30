// steps/typescript/update-pet.step.ts
import { ApiRouteConfig, Handlers } from 'motia';
import { z } from 'zod';
import { TSStore } from './ts-store';

// Define path parameters schema for type safety
const pathParamsSchema = z.object({
  id: z.string().min(1, 'Pet ID is required')
});

// Define request body schema for selective updates
const updatePetSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').trim().optional(),
  species: z.enum(['dog', 'cat', 'bird', 'other']).optional(),
  ageMonths: z.number().int().min(0, 'Age must be a positive number').optional(),
  status: z.enum(['new', 'available', 'pending', 'adopted', 'deleted']).optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
);

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'TsUpdatePet',
  path: '/ts/pets/:id',
  method: 'PUT',
  emits: [],
  flows: ['TsPetManagement']
  // Note: bodySchema with ZodEffects is not supported in current Motia version
  // bodySchema: updatePetSchema
};

export const handler: Handlers['TsUpdatePet'] = async (req) => {
  try {
    // Validate path parameters
    const { id } = pathParamsSchema.parse(req.pathParams);
    
    // Validate request body
    const validatedData = updatePetSchema.parse(req.body);
    
    // Build patch object with only provided fields
    const patch: Partial<{ name: string; species: "dog" | "cat" | "bird" | "other"; ageMonths: number; status: "new" | "available" | "pending" | "adopted" | "deleted" }> = {};
    
    if (validatedData.name !== undefined) patch.name = validatedData.name;
    if (validatedData.species !== undefined) patch.species = validatedData.species;
    if (validatedData.ageMonths !== undefined) patch.ageMonths = validatedData.ageMonths;
    if (validatedData.status !== undefined) patch.status = validatedData.status;

    const updated = TSStore.update(id, patch);
    
    if (!updated) {
      return { 
        status: 404, 
        body: { message: 'Pet not found' } 
      };
    }
    
    return { status: 200, body: updated };
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
