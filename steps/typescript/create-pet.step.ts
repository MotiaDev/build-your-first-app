// steps/typescript/create-pet.step.ts
import { ApiRouteConfig, Handlers } from 'motia';
import { z } from 'zod';
import { TSStore } from './ts-store';

// Define request body schema with Zod for type safety and validation
const createPetSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  species: z.enum(['dog', 'cat', 'bird', 'other']),
  ageMonths: z.number().int().min(0, 'Age must be a positive number')
});

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'TsCreatePet',
  path: '/ts/pets',
  method: 'POST',
  emits: ['ts.pet.created', 'ts.feeding.reminder.enqueued'],
  flows: ['TsPetManagement']
};

export const handler: Handlers['TsCreatePet'] = async (req, { emit, logger }) => {
  try {
    // Zod automatically validates and parses the request body
    const validatedData = createPetSchema.parse(req.body);
    
    const pet = TSStore.create({ 
      name: validatedData.name, 
      species: validatedData.species, 
      ageMonths: validatedData.ageMonths 
    });
    
    if (logger) {
      logger.info('🐾 Pet created', { petId: pet.id, name: pet.name, species: pet.species, status: pet.status });
    }
    
    if (emit) {
      await (emit as any)({
        topic: 'ts.pet.created',
        data: { petId: pet.id, event: 'pet.created', name: pet.name, species: validatedData.species }
      });
      
      // Enqueue feeding reminder background job
      await (emit as any)({
        topic: 'ts.feeding.reminder.enqueued',
        data: { petId: pet.id, enqueuedAt: Date.now() }
      });
    }
    
    return { status: 201, body: pet };
    
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
